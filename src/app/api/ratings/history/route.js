import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get("albumId");

    console.log("API received albumId:", albumId); // Debugging log

    if (!albumId) {
      return Response.json(
        { message: "Album ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const history = await db
      .collection("ratinghistories")
      .find({ albumId }) // Query by albumId
      .sort({ date: 1 }) // Sort by date in ascending order
      .toArray();

    console.log("Returning history:", history); // Debugging log

    return Response.json({ history }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch rating history:", error);
    return Response.json(
      { message: "Failed to fetch rating history", error },
      { status: 500 }
    );
  }
}