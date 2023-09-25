//Imports
const getTaskData = require("./helpers/getTaskData");
const { queuePost, queueCID } = require("./queue");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const DB_KEY = process.env.DB_KEY;
let round = 0;

async function saveTweetsToMongo(tweetList) {
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

async function main() {
  // Get submission list, max round, and round time from Koii
  const taskData = await getTaskData(process.env.TASK_ID);

  //Checks if there is a new round, then get data
  if (round < taskData.maxRound) {
    round = taskData.maxRound;
    console.log("Current round is", round, "...");
    // Extract tweets from IPFS
    const tweetList = await queueCID(taskData.submissions);
    saveTweetsToMongo(tweetList);

    /*     // POST data to server
    let i = 0;
    let result = await queuePost(tweetList, i); */

    console.log("Operation complete, calling the function again.");
    main();
  } else {
    //Each round time unit is roughly equivalent to 408 miliseconds
    const roundTimeInMS = taskData.roundTime * 408;
    console.log(
      "No new round... Checking again in",
      (roundTimeInMS / 60000).toFixed(2),
      "Minutes"
    );
    setTimeout(main, roundTimeInMS);
  }
}

main();
