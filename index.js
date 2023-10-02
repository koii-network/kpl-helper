//Imports
const getTaskData = require("./helpers/getTaskData");
const { queuePost, queueCID } = require("./queue");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const saveTweetsToMongoDB = require("./api/saveTweetsToMongoDB");

let round = 0;
taskId = process.env.TASK_ID;

async function main() {
  const getTaskDataWrapper = async (taskId, round) => {
    let wrappedTaskData = await getTaskData(taskId, round);
    if (wrappedTaskData === false) {
      console.log("No new round found. Retrying in 60 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 60000));
      return await getTaskDataWrapper(taskId, round);
    } else {
      return wrappedTaskData;
    }
  };

  const taskData = await getTaskDataWrapper(taskId, round);

  if (round < taskData.maxRound) {
    round = taskData.maxRound;
    console.log("Current round is", round, "...");
    // Extract tweets from IPFS

    const tweetList = await queueCID(taskData.submissions);
    await saveTweetsToMongoDB(tweetList);

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
