const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "../.env" });

const uri = process.env.DB_KEY;
const dbName = process.env.DB_NAME;

async function createUniqueIndex() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("Tweets_AI");

    await collection.createIndex({ tweets_id: 1 }, { unique: true });

    console.log("Unique index on tweets_id created successfully.");
  } catch (err) {
    console.error("Error creating index:", err);
  } finally {
    await client.close();
  }
}

createUniqueIndex();
