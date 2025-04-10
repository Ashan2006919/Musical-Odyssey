import { NextResponse } from "next/server";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

let cachedToken = null; // Store the cached token
let tokenExpiry = null; // Store the token expiry time

export async function GET(req) {
  // Check if a valid token is already cached
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return new Response(
      JSON.stringify({ access_token: cachedToken }),
      { status: 200 }
    );
  }

  const retryLimit = 3; // Number of retries
  const retryDelay = 1000; // Delay between retries in milliseconds

  for (let attempt = 1; attempt <= retryLimit; attempt++) {
    try {
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
        if (authResponse.status === 503 && attempt < retryLimit) {
          console.warn(`Spotify API unavailable. Retrying in ${retryDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue; // Retry the request
        }
        throw new Error(`Spotify API responded with status: ${authResponse.status}`);
      }

      const data = await authResponse.json();

      // Cache the token and its expiry time
      cachedToken = data.access_token;
      tokenExpiry = Date.now() + data.expires_in * 1000; // Convert expiry time to milliseconds

      return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
      if (attempt === retryLimit) {
        console.error("Failed to fetch access token after retries:", error);
        return new Response(
          JSON.stringify({ message: "Failed to fetch access token." }),
          { status: 500 }
        );
      }
    }
  }
}
