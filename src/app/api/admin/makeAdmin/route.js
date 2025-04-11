import { connectToDatabase } from "@/utils/db";

export async function POST(req) {
  try {
    const { userId, key } = await req.json();

    // Validate the admin key
    if (key !== process.env.ADMIN_KEY) {
      return new Response(JSON.stringify({ message: "Invalid admin key" }), {
        status: 401,
      });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Update the user's isAdmin status in the database
    const result = await usersCollection.updateOne(
      { omid: userId },
      { $set: { isAdmin: true } }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Failed to update user" }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ message: "User updated successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in makeAdmin API:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}