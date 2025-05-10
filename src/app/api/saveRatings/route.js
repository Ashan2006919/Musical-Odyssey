export const runtime = "nodejs"; // 👈 Important for MongoDB compatibility

import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { albumId, ratings, averageRating, userOmid, artistName } = await req.json();

    if (!albumId || !ratings || averageRating === null || !userOmid || !artistName) {
      return Response.json(
        { message: "Album ID, ratings, average rating, user OMID, and artist name are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Save the initial ratings to the ratings collection
    try {
      const result = await db.collection("ratings").insertOne({
        albumId, // Use Spotify album ID
        ratings,
        averageRating,
        userOmid, // Store the user's OMID
        artistName, // Store the artist's name
        createdAt: new Date(),
      });

      // Save the average rating to the ratinghistories collection
      await db.collection("ratinghistories").insertOne({
        albumId, // Use Spotify album ID
        averageRating,
        userOmid, // Store the user's OMID in the history as well
        artistName, // Store the artist's name in the history
        date: new Date(), // Use the current date for the history entry
      });

      return Response.json(
        { message: "Ratings and history saved successfully" },
        { status: 200 }
      );
    } catch (error) {
      if (error.code === 11000) {
        // Handle duplicate key error
        return Response.json(
          { message: "You have already rated this album. Please update your rating instead." },
          { status: 409 } // Conflict status code
        );
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error("Failed to save ratings and history:", error);
    return Response.json(
      { message: "Failed to save ratings and history", error },
      { status: 500 }
    );
  }
}
