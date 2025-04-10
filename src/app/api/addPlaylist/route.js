import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { playlistUrl, userOmid } = await req.json();

    if (!playlistUrl || !userOmid) {
      return new Response(
        JSON.stringify({ message: "Playlist URL and user OMID are required." }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Fetch playlist details from Spotify API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // Use environment variable or fallback to localhost
    const tokenResponse = await fetch(`${baseUrl}/api/spotify`);
    const { access_token } = await tokenResponse.json();

    const playlistId = playlistUrl.split("/").pop().split("?")[0]; // Extract playlist ID
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ message: "Failed to fetch playlist details." }),
        { status: 400 }
      );
    }

    const playlistData = await response.json();

    const playlist = {
      id: playlistData.id,
      name: playlistData.name,
      description: playlistData.description || "No description available.",
      imageUrl: playlistData.images[0]?.url || "/images/default-playlist.png",
      href: playlistData.external_urls.spotify,
      userOmid, // Associate playlist with the user's OMID
    };

    // Save playlist to MongoDB
    await db.collection("playlists").insertOne(playlist);

    return new Response(JSON.stringify({ playlist }), { status: 200 });
  } catch (error) {
    console.error("Error adding playlist:", error);
    return new Response(
      JSON.stringify({ message: "Failed to add playlist." }),
      { status: 500 }
    );
  }
}