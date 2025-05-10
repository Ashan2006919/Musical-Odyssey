import { connectToDatabase } from "@/lib/mongodb";

async function aggregateUserGrowth() {
  try {
    const { db } = await connectToDatabase();

    // Aggregate user data by registration date
    const userGrowthData = await db.collection("users").aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date
    ]).toArray();

    // Update the userGrowthHistory collection
    for (const record of userGrowthData) {
      await db.collection("userGrowthHistory").updateOne(
        { date: record._id },
        { $set: { totalUsers: record.totalUsers } },
        { upsert: true }
      );
    }

    console.log("User growth data aggregated successfully.");
  } catch (error) {
    console.error("Error aggregating user growth data:", error);
  }
}

aggregateUserGrowth();