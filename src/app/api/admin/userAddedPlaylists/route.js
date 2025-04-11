import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const playlists = await db
      .collection("playlists")
      .find({ isPredefined: false, name: { $exists: true }, userOmid: { $exists: true } }) // Ensure `name` and `userOmid` exist
      .toArray();

    return new Response(JSON.stringify({ playlists }), { status: 200 });
  } catch (error) {
    console.error("Error fetching user-added playlists:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch user-added playlists." }),
      { status: 500 }
    );
  }
}