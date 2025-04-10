import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI; // Your MongoDB connection string
const dbName = process.env.MONGODB_DB; // Your database name

async function cleanDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    // Drop the "users" collection
    await db.collection("users").deleteMany({});
    console.log("Deleted all users.");

    // Drop the "albums" collection
    await db.collection("albums").deleteMany({});
    console.log("Deleted all albums.");

    // Drop other collections if needed
    // await db.collection("ratings").deleteMany({});
    // console.log("Deleted all ratings.");
  } catch (error) {
    console.error("Error cleaning database:", error);
  } finally {
    await client.close();
  }
}

cleanDatabase();