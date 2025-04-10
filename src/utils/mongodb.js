import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

if (!MONGODB_DB) {
  throw new Error("Please add your MongoDB database name to .env.local");
}

// Global cache for Mongoose connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new MongoDB connection");
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => {
      console.log("Connected to MongoDB:", mongoose.connection.name);
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Album Schema
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

// Model
const Album = mongoose.models.Album || mongoose.model("Album", AlbumSchema);

// Function to update ratings and average for an album
export async function updateAlbumRating(albumId, trackRatings) {
  try {
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
    const result = await Album.updateOne(
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

export default connectToDatabase;
