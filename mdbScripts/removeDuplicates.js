const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "../.env" });

const uri = process.env.DB_KEY;
const dbName = process.env.DB_NAME;

async function removeDuplicates() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("Tweets_AI");

    const duplicates = [];

    const cursor = collection.aggregate([
      {
        $group: {
          _id: "$tweets_id",
          dups: { $addToSet: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    for await (const doc of cursor) {
      doc.dups.shift(); // keep one entry, remove the others
      doc.dups.forEach((dupId) => duplicates.push(dupId));
    }

    if (duplicates.length) {
      const result = await collection.deleteMany({ _id: { $in: duplicates } });
      console.log(`Deleted ${result.deletedCount} duplicate documents.`);
    } else {
      console.log("No duplicates found.");
    }
  } catch (err) {
    console.error("Error removing duplicates:", err);
  } finally {
    await client.close();
  }
}

removeDuplicates();
