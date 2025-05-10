import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI; // Ensure this is set in your .env.local file
const client = new MongoClient(uri);

export async function getPredefinedPlaylists() {
  await client.connect();
  const db = client.db("musicReviewAdmin");
  const playlists = await db.collection("playlists").find().toArray();
  return playlists;
}

export async function getUserStats() {
  await client.connect();
  const db = client.db("musicReviewAdmin");
  const stats = await db.collection("userStats").find().toArray();
  return stats;
}

export async function addPlaylistToDatabase(name) {
  await client.connect();
  const db = client.db("musicReviewAdmin");
  const result = await db.collection("playlists").insertOne({ name });

  // Return the inserted document
  return { id: result.insertedId, name };
}