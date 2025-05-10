// filepath: \Projects\Music Review\Musical-Odyssey\src\app\api\spotify\callback\route.js
import { NextResponse } from "next/server";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to fetch access token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    return NextResponse.json(tokenData, { status: 200 }); // Return access token and refresh token
  } catch (error) {
    console.error("Error fetching access token:", error);
    return NextResponse.json({ error: "Failed to fetch access token" }, { status: 500 });
  }
}