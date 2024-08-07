const { MongoClient } = require("mongodb");
require("dotenv").config();

const DB_KEY = process.env.DB_KEY;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;

let client;

async function connectToMongoDB() {
  if (!client) {
    client = new MongoClient(DB_KEY, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
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

    // Create a unique index on the 'data.tweets_id' field to prevent duplicate entries
    // await collection.createIndex({ "_id": '' }, { unique: true });

    // Loop over each tweet in the list
    for (let tweet of tweetList) {
      // Remove _id field if it exists
      if (tweet._id) {
        delete tweet._id;
      }

      // console.log("Processing tweet:", tweet);
      const { id, ...tweetData } = tweet;
      const filter = { id: tweet.id }; // Filter by tweet ID
      const update = { $set: tweetData }; // Update tweet data or insert new if it doesn't exist
      const options = { upsert: true };
      try {
        const result = await collection.updateOne(filter, update, options);
        if (result.upsertedCount > 0) {
          console.log(`Inserted tweet with tweets_id ${tweet.id}`);
        } else {
          console.log(`Updated tweet with tweets_id ${tweet.id}`);
        }
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error
          console.error(
            `Duplicate key error for tweets_id: ${tweet.id}`,
            error
          );
        } else {
          console.error(
            `Error processing tweet with tweets_id: ${tweet.id}`,
            error
          );
        }
      }
    }

    console.log(`${tweetList.length} tweets processed.`);
  } catch (err) {
    console.error("Error:", err);
  }
}

module.exports = saveTweetsToMongoDB;
