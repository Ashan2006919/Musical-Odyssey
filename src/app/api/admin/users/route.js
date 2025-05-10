import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Fetch all users from the database
    const users = await usersCollection.find({}).toArray();

    // Return the users as JSON
    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch users." }),
      { status: 500 }
    );
  }
}