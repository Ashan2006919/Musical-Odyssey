import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { omid, type, list, timestamp } = await req.json();

    if (!omid || !type || !list) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const { db } = await connectToDatabase();
    await db.collection("rankings").insertOne({ omid, type, list, timestamp });

    return new Response(JSON.stringify({ message: "Ranking saved successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error saving ranking:", error);
    return new Response(JSON.stringify({ error: "Failed to save ranking" }), { status: 500 });
  }
}