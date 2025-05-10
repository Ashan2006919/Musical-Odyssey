import { NextResponse } from "next/server";

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Spotify credentials missing" }, { status: 500 });
  }

  const authParams = new URLSearchParams();
  authParams.append("grant_type", "client_credentials");
  authParams.append("client_id", clientId);
  authParams.append("client_secret", clientSecret);

  const authResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: authParams,
  });

  if (!authResponse.ok) {
    return NextResponse.json({ error: "Failed to authenticate with Spotify" }, { status: 500 });
  }

  const data = await authResponse.json();
  return data.access_token;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get("albumId");

    if (!albumId) {
      return NextResponse.json({ error: "Album ID missing" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    console.log("Access Token:", accessToken);

    const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (albumResponse.status === 429) {
      const retryAfter = albumResponse.headers.get("Retry-After");
      console.error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    if (!albumResponse.ok) {
      const errorText = await albumResponse.text(); // Read plain text response
      console.error("Spotify API Error:", errorText);
      return NextResponse.json({ error: errorText || "Album not found" }, { status: albumResponse.status });
    }

    const albumData = await albumResponse.json();
    return NextResponse.json(albumData);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}