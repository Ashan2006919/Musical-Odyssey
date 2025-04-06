import { MongoClient } from "mongodb";

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
    console.log(`Connected to database: ${dbName}`); // Log successful connection
    return { client, db };
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw new Error("Database connection failed");
  }
}

// Function to get the users collection
export async function getUsersCollection() {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");
    console.log("Accessed users collection"); // Log successful access
    return usersCollection;
  } catch (error) {
    console.error("Failed to access users collection:", error);
    throw new Error("Could not access users collection");
  }
}
