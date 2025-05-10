import { connectToDatabase } from "@/lib/mongodb";

export async function DELETE(req) {
  try {
    const { userId } = await req.json();

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    const result = await usersCollection.deleteOne({ omid: userId });

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Failed to delete user" }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ message: "User deleted successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in deleteUser API:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}