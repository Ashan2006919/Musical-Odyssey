import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const playlists = await db.collection("playlists").find({ isPredefined: true }).toArray();

    return new Response(JSON.stringify({ playlists }), { status: 200 });
  } catch (error) {
    console.error("Error fetching predefined playlists:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch predefined playlists." }),
      { status: 500 }
    );
  }
}