import { connectToDatabase } from "@/lib/mongodb";

export async function DELETE(req) {
  try {
    const { playlistId, userOmid } = await req.json();

    if (!playlistId || !userOmid) {
      return new Response(
        JSON.stringify({ message: "Playlist ID and user OMID are required." }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Delete the playlist from the database
    const result = await db.collection("playlists").deleteOne({
      id: playlistId,
      userOmid,
    });

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Playlist not found or already deleted." }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Playlist deleted successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return new Response(
      JSON.stringify({ message: "Failed to delete playlist." }),
      { status: 500 }
    );
  }
}