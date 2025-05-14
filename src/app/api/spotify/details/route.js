import { NextResponse } from "next/server";

let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Spotify credentials missing" }, { status: 500 });
  }

  // Reuse cached token if valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const authResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!authResponse.ok) {
    throw new Error("Failed to authenticate with Spotify");
  }

  const data = await authResponse.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000; // Convert expiry time to milliseconds

  return cachedToken;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get("trackId");

    if (!trackId) {
      return NextResponse.json({ error: "Track ID missing" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!trackResponse.ok) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const trackData = await trackResponse.json();
    return NextResponse.json(trackData);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
