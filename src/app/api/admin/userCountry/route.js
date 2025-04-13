import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req) {
  console.log("API /api/admin/userCountry called"); // Debug log
  try {
    const { db } = await connectToDatabase();
    console.log("Connected to database"); // Debug log

    const countryData = await db
      .collection("users")
      .aggregate([
        { $match: { country: { $ne: null } } }, // Exclude null or undefined countries
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $project: { country: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } }, // Sort by count in descending order
      ])
      .toArray();

    const responseData = countryData || [];
    console.log("Response Data:", responseData); // Debug log
    console.log("Data Being Sent:", JSON.stringify(responseData)); // Debug log
    return new Response(JSON.stringify(responseData), { status: 200 });
  } catch (error) {
    console.error("Error in /api/admin/userCountry:", error); // Debug log
    return new Response(
      JSON.stringify({ message: "Failed to fetch country data." }),
      { status: 500 }
    );
  }
  finally {
    console.log("API /api/admin/userCountry completed"); // Debug log
  }
}
