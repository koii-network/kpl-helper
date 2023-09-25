const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://yigid:PVBKF5ielcmk9ZPb@cluster0.apkfetr.mongodb.net/?retryWrites=true&w=majority";
const dbName = "Twitter";

async function createUniqueIndex() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("Tweets");

    await collection.createIndex({ tweets_id: 1 }, { unique: true });

    console.log("Unique index on tweets_id created successfully.");
  } catch (err) {
    console.error("Error creating index:", err);
  } finally {
    await client.close();
  }
}

createUniqueIndex();
