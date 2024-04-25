const { MongoClient } = require("mongodb");
const axios = require("axios");
require("dotenv").config();
const DB_KEY = process.env.DB_KEY;

async function saveTweetsToMongoDB(allTweetData) {
 const client = new MongoClient(DB_KEY);

  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const db = client.db("Twitter-new");
    const collection = db.collection("tweets");

    // Create a unique index on the 'tweets_id' field to prevent duplicate entries
    await collection.createIndex({ "tweets_id": 1 }, { unique: true });

    const operations = allTweetData.map(tweet => ({
      updateOne: {
        filter: { "tweets_id": tweet.tweets_id },
        update: { $set: tweet },
        upsert: true
      }
    }));

    const result = await collection.bulkWrite(operations, { ordered: false });
    console.log(`${result.upsertedCount + result.modifiedCount} tweets inserted or updated.`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}



// async function saveTweetsToMongoDB(tweetList) {
//   const client = new MongoClient(DB_KEY);

//   try {
//     /*     const txtResponse = await axios.get(
//       "https://bafybeigvqiiahfaiur2ckwnnnuqt2uhzmdjmjoymt4xgwuj6naniksgyli.ipfs.w3s.link/data.txt"
//     );
//     const txtContent = txtResponse.data;
//     localtl.forEach((obj) => {
//       obj.tweet = txtContent;
//     }); */
//     await client.connect();
//     const db = client.db("Twitter-test");
//     const collection = db.collection('tweets').createIndex({ tweets_id: 1 }, { unique: true });
//     try {
//       const result = await collection.insertMany(tweetList, { ordered: false });
//       console.log(`${result.insertedCount} tweets inserted.`);
//     } catch (error) {
//       console.error(
//         "Error:", err
//         // "Error occurred during insertMany operation. (Potentially, a duplicate key is rejected)"
//       );
//     }
//     console.log("Data inserted.");
//   } finally {
//     await client.close();
//   }
// }

//Default Export
module.exports = saveTweetsToMongoDB;
