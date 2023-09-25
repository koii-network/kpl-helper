const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://yigid:PVBKF5ielcmk9ZPb@cluster0.apkfetr.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {});

async function copyCollection() {
  try {
    await client.connect();

    const db = client.db("Twitter");

    // Fetch all documents from the Tweets collection
    const tweets = await db.collection("Tweets_2").find().toArray();

    // If the Tweets_2 collection doesn't exist, it will be created automatically
    await db.collection("Tweets").insertMany(tweets);

    console.log("Collection copied successfully!");
  } catch (error) {
    console.error("Error copying collection:", error);
  } finally {
    await client.close();
  }
}

copyCollection();
