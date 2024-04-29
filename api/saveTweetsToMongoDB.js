const { MongoClient } = require("mongodb");
const axios = require("axios");
require("dotenv").config();

const DB_KEY = process.env.DB_KEY;

async function saveTweetsToMongoDB(tweetList) {
 const client = new MongoClient(DB_KEY, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
 });

  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME);

    // Create a unique index on the 'tweets_id' field to prevent duplicate entries
    await collection.createIndex({ "tweets_id": 1 }, { unique: true });

    for (let tweet of tweetList) {
      const filter = { "tweets_id": tweet.tweets_id };
      const update = { $setOnInsert: tweet };
      const options = { upsert: true };

      await collection.updateOne(filter, update, options);
    }

    console.log(`${tweetList.length} tweets inserted/updated.`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}


//Default Export
module.exports = saveTweetsToMongoDB;
