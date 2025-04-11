import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { userId, key } = await req.json();

    if (!userId || !key) {
      return new Response(
        JSON.stringify({ message: "User ID and key are required." }),
        { status: 400 }
      );
    }

    // Validate the key
    if (key !== process.env.ADMIN_KEY) {
      return new Response(
        JSON.stringify({ message: "Invalid admin key." }),
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Update the user's isAdmin field to true
    const result = await usersCollection.updateOne(
      { omid: userId },
      { $set: { isAdmin: true } }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: "User not found or already an admin." }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "User successfully made an admin." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error making user an admin:", error);
    return new Response(
      JSON.stringify({ message: "Failed to make user an admin." }),
      { status: 500 }
    );
  }
}