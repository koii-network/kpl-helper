const { MongoClient } = require("mongodb");
require("dotenv").config();

const DB_KEY = process.env.DB_KEY;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;

let client;

async function connectToMongoDB() {
  if (!client) {
    client = new MongoClient(DB_KEY, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("Connected to MongoDB.");
  }
  return client;
}

async function saveTweetsToMongoDB(tweetList) {
  try {
    const client = await connectToMongoDB();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Create a unique index on the 'tweets_id' field to prevent duplicate entries
    await collection.createIndex({ "tweets_id": 1 }, { unique: true });

    // Loop over each tweet in the list
    for (let tweet of tweetList) {
      const filter = { "tweets_id": tweet.tweets_id };
      const update = { $set: tweet }; // Update tweet data or insert new if it doesn't exist
      const options = { upsert: true };

      await collection.updateOne(filter, update, options);
    }

    console.log(`${tweetList.length} tweets inserted/updated.`);
  } catch (err) {
    console.error("Error:", err);
  }
}

module.exports = saveTweetsToMongoDB;
