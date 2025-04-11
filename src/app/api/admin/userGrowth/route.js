import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();

    // Fetch user growth data
    const growthData = await db
      .collection("userGrowthHistory")
      .find({})
      .sort({ date: 1 }) // Sort by date
      .toArray();

    return new Response(JSON.stringify(growthData), { status: 200 });
  } catch (error) {
    console.error("Error fetching user growth data:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch user growth data." }),
      { status: 500 }
    );
  }
}
