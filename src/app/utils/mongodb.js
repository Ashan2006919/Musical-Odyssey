import { MongoClient } from "mongodb";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB; // Ensure this is set in your environment variables
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (!dbName) {
  throw new Error("Please add your MongoDB database name to .env.local");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Function to connect to the database
export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);
    return { client, db };
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw new Error("Database connection failed");
  }
}

// Function to get the albums collection
export async function getAlbumsCollection() {
  try {
    const { db } = await connectToDatabase();
    const albumsCollection = db.collection("albums");
    console.log("Accessed albums collection");
    return albumsCollection;
  } catch (error) {
    console.error("Failed to access albums collection:", error);
    throw new Error("Could not access albums collection");
  }
}

// Updated Album Schema to store individual track ratings and average history
const AlbumSchema = new mongoose.Schema({
  name: String,
  artist: String,
  ratings: {
    type: Map,
    of: Number, // Store ratings for each track by track id
  },
  averageRating: Number, // Overall average rating for the album
  ratingHistory: [
    {
      date: { type: Date, default: Date.now },
      averageRating: Number,
    },
  ],
});

// Function to update ratings and average for an album
export async function updateAlbumRating(albumId, trackRatings) {
  try {
    const { db } = await connectToDatabase();
    const albumsCollection = db.collection("albums");

    // Calculate new average rating for the album
    const totalTracks = trackRatings.length;
    const totalRating = trackRatings.reduce((acc, track) => acc + track.rating, 0);
    const newAverageRating = totalRating / totalTracks;

    // Prepare the rating update for each track
    const updatedRatings = trackRatings.reduce((acc, track) => {
      acc.set(track.trackId, track.rating); // Set each track's rating by its ID
      return acc;
    }, new Map());

    // Create a log entry for the new average rating
    const ratingLogEntry = {
      averageRating: newAverageRating,
    };

    // Update album's ratings and add new rating history
    const result = await albumsCollection.updateOne(
      { _id: mongoose.Types.ObjectId(albumId) },
      {
        $set: {
          ratings: updatedRatings,
          averageRating: newAverageRating,
        },
        $push: {
          ratingHistory: ratingLogEntry,
        },
      }
    );

    console.log(`Successfully updated ratings for album: ${albumId}`);
    return result;
  } catch (error) {
    console.error("Failed to update album rating:", error);
    throw new Error("Could not update album rating");
  }
}

export default mongoose.models.Album || mongoose.model("Album", AlbumSchema);
