import { connectToDatabase } from "@/lib/mongodb";

async function addIsAdminField() {
  const { db } = await connectToDatabase();
  const usersCollection = db.collection("users");

  await usersCollection.updateMany(
    { isAdmin: { $exists: false } },
    { $set: { isAdmin: false } }
  );

  console.log("Added isAdmin field to all users.");
}

addIsAdminField();