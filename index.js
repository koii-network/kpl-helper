//Imports
const getTaskData = require("./helpers/getTaskData");
const { queuePost, queueCID } = require("./queue");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const saveTweetsToMongoDB = require("./api/saveTweetsToMongoDB");

let round = 0;
const taskId = process.env.TASK_ID;

async function main() {
  const taskData = await getTaskDataWrapper(taskId, round);

  if (round < taskData.maxRound) {
    round = taskData.maxRound;
    console.log("Current round is", round, "...");

    const submissionList = taskData.submissions;
    const BATCH_SIZE = 10; 
    const totalBatches = Math.ceil(submissionList.length / BATCH_SIZE);
    let allTweetData = [];
    let batchCount = 0;


    for (let i = 0; i < submissionList.length; i += BATCH_SIZE) {
      const batch = submissionList.slice(i, Math.min(i + BATCH_SIZE, submissionList.length));
      const tweetList = await queueCID(batch, batchCount, totalBatches);
      allTweetData.push(...tweetList);
      batchCount++;

      // Save data every two batches or at the end of all batches
      if (batchCount % 2 === 0 || i + BATCH_SIZE >= submissionList.length) {
          if (allTweetData.length > 0) {
              await saveTweetsToMongoDB(allTweetData);
              console.log(`Data from ${batchCount} batches saved successfully.`);
              allTweetData = []; // Reset after saving
          }
      }
  }

  console.log("Operation complete, preparing for next round.");
  scheduleNextRound(1000); // Schedule next round after 1 second
} else {
  console.log("Current data is up to date. Waiting for new round...");
  const roundTimeInMS = taskData.roundTime * 408;
  console.log("No new round... Checking again in", (roundTimeInMS / 60000).toFixed(2), "Minutes");
  scheduleNextRound(roundTimeInMS);
}
}


async function getTaskDataWrapper(taskId, currentRound) {
  let taskData = await getTaskData(taskId, currentRound);
  if (!taskData) {
    console.log("No new round found. Retrying in 60 seconds...");
    await new Promise(resolve => setTimeout(resolve, 60000));
    return getTaskDataWrapper(taskId, currentRound);
  }
  return taskData;
}

function scheduleNextRound(delay) {
  setTimeout(main, delay);
}

main();
