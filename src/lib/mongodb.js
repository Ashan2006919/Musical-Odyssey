import { MongoClient } from "mongodb";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
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
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  return { client, db };
}

// Function to get the users collection
export async function getUsersCollection() {
  const { db } = await connectToDatabase();
  return db.collection("users");
}

const RatingHistorySchema = new mongoose.Schema({
  albumId: { type: String, required: true }, // Album ID (can be ObjectId or string)
  date: { type: Date, default: Date.now },  // Timestamp of the update
  averageRating: { type: Number, required: true }, // New average rating
});

// Check if the model already exists before defining it
const RatingHistory =
  mongoose.models.RatingHistory || mongoose.model("RatingHistory", RatingHistorySchema);

export default RatingHistory;
