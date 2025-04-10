import { MongoClient } from "mongodb";
import mongoose from "mongoose";

// --- MongoClient for NextAuth and raw DB usage ---
const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

// --- Helpers for raw MongoDB usage ---
export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "test");
  return { client, db };
}

export { clientPromise };  // Export the clientPromise for NextAuth

// --- Mongoose Setup & Schema ---
const MONGOOSE_URI = process.env.MONGODB_URI;

if (!MONGOOSE_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

if (!mongoose.connection.readyState) {
  mongoose.connect(MONGOOSE_URI, {
    dbName: process.env.MONGODB_DATABASE,
  }).catch((err) => {
    console.error("Failed to connect to MongoDB with Mongoose:", err);
  });
}

const RatingHistorySchema = new mongoose.Schema({
  albumId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  averageRating: { type: Number, required: true },
});

const RatingHistory =
  mongoose.models.RatingHistory || mongoose.model("RatingHistory", RatingHistorySchema);

// --- Exports ---
export default RatingHistory;
