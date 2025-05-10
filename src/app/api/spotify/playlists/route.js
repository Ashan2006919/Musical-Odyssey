import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", ""); // Extract token from the request header
    if (!token) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    // Fetch playlists
    const playlistsResponse = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!playlistsResponse.ok) {
      throw new Error(`Failed to fetch playlists: ${playlistsResponse.status}`);
    }

    const playlists = await playlistsResponse.json();
    return NextResponse.json(playlists, { status: 200 });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
  }
}