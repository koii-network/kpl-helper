const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "../.env" });
const DB_KEY = process.env.DB_KEY;

async function saveTweetsToMongoDB(tweetList) {
  const client = new MongoClient(DB_KEY);

  try {
    await client.connect();
    const db = client.db("Twitter");
    const collection = db.collection("Tweets");
    const result = await collection.insertMany(tweetList);

    console.log("Data inserted successfully:", result.insertedCount);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

//Default Export
module.exports = saveTweetsToMongoDB;
