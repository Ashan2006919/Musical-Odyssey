import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userOmid = searchParams.get("userOmid");
    console.log("Received userOmid in API:", userOmid); // Debugging

    if (!userOmid) {
      return new Response(
        JSON.stringify({ message: "User OMID is required." }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Fetch playlists associated with the user's OMID
    const playlists = await db
      .collection("playlists")
      .find({ userOmid })
      .toArray();

    console.log("Playlists fetched from database:", playlists); // Debugging

    return new Response(JSON.stringify({ playlists }), { status: 200 });
  } catch (error) {
    console.error("Error fetching user playlists:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch user playlists." }),
      { status: 500 }
    );
  }
}
