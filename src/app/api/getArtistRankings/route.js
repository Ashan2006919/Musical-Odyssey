// app/api/ratings/route.js

import { MongoClient } from "mongodb";
import fetch from "node-fetch";

const client = new MongoClient(process.env.MONGODB_URI);

async function fetchSpotifyAccessToken() {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Spotify access token");
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching Spotify access token:", error);
    throw error;
  }
}

async function fetchArtistDetails(artistName, accessToken) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch details for artist: ${artistName}`);
      return null;
    }

    const data = await response.json();
    const artist = data.artists?.items?.[0];
    return artist
      ? {
          name: artist.name,
          image: artist.images?.[0]?.url || "/images/default-artist.png",
        }
      : null;
  } catch (error) {
    console.error(`Error fetching artist details for ${artistName}:`, error);
    return null;
  }
}

async function fetchAlbumDetails(albumId, accessToken) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch details for album: ${albumId}`);
      return null;
    }

    const album = await response.json();
    return {
      name: album.name,
      image: album.images?.[0]?.url || "/images/default-album.png",
    };
  } catch (error) {
    console.error(`Error fetching album details for ${albumId}:`, error);
    return null;
  }
}

async function fetchRatingsData(userOmid) {
  try {
    await client.connect();
    const database = client.db("test");
    const ratingsCollection = database.collection("ratings");

    // Group albums by artistName and include albumId and averageRating
    const result = await ratingsCollection
      .aggregate([
        { $match: { userOmid } }, // Filter by userOmid
        {
          $group: {
            _id: "$artistName", // Group by artistName
            albums: {
              $push: {
                albumId: "$albumId",
                averageRating: { $toDouble: "$averageRating" },
              },
            },
            averageRating: { $avg: { $toDouble: "$averageRating" } }, // Calculate overall average rating for the artist
          },
        },
      ])
      .toArray();

    const accessToken = await fetchSpotifyAccessToken();

    // Fetch artist and album details from Spotify
    const artistData = await Promise.all(
      result.map(async (artist) => {
        const details = await fetchArtistDetails(artist._id, accessToken);

        // Fetch album details for each album
        const albums = await Promise.all(
          artist.albums.map(async (album) => {
            const albumDetails = await fetchAlbumDetails(album.albumId, accessToken);
            return {
              albumId: album.albumId,
              averageRating: album.averageRating,
              name: albumDetails?.name || "Unknown Album",
              image: albumDetails?.image || "/images/default-album.png",
            };
          })
        );

        return {
          name: artist._id,
          image: details?.image || "/images/default-artist.png",
          averageRating: artist.averageRating,
          albums, // Include album data with details
        };
      })
    );

    return artistData;
  } catch (error) {
    console.error("Error fetching ratings data:", error);
    throw new Error("Failed to fetch ratings data");
  } finally {
    await client.close();
  }
}

export async function GET(req) {
  try {
    // Extract userOmid from query parameters
    const { searchParams } = new URL(req.url);
    const userOmid = searchParams.get("userOmid");

    if (!userOmid) {
      return new Response("Missing userOmid parameter", { status: 400 });
    }

    const artistData = await fetchRatingsData(userOmid);
    return new Response(JSON.stringify(artistData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /getArtistRankings:", error);
    return new Response("Error fetching data", { status: 500 });
  }
}
