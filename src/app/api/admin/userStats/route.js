import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { db } = await connectToDatabase(); // Properly connect to the database
    const stats = await db.collection("userStats").find().toArray();
    const totalUsers = stats.reduce((sum, stat) => sum + stat.users, 0);

    return new Response(JSON.stringify({ stats, totalUsers }), { status: 200 });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch user stats" }),
      { status: 500 }
    );
  }
}