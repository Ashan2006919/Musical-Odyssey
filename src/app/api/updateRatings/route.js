import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { ratingId, ratings } = await req.json();
    const { db } = await connectToDatabase();

    const result = await db.collection("ratings").updateOne(
      { _id: new ObjectId(ratingId) },
      { $set: { ratings } }
    );

    if (result.modifiedCount === 1) {
      return Response.json({ message: "Ratings updated successfully" }, { status: 200 });
    } else {
      return Response.json({ message: "Rating not found" }, { status: 404 });
    }
  } catch (error) {
    return Response.json({ message: "Failed to update ratings", error }, { status: 500 });
  }
}
