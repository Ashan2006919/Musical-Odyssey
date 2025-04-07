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

// --- Helpers for raw MongoDB usage ---
export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "test");
  return { client, db };
}

export async function getUsersCollection() {
  const { db } = await connectToDatabase();
  return db.collection("users");
}

// --- Mongoose Setup & Schema ---
const MONGOOSE_URI = process.env.MONGODB_URI;

if (!MONGOOSE_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

if (!mongoose.connection.readyState) {
  mongoose.connect(MONGOOSE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
export { clientPromise };
