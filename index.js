//Imports
const getTaskData = require("./helpers/getTaskData");
const { queueCID } = require("./queue");
require("dotenv").config();

let round = 0;
const taskId = process.env.TASK_ID;


/**
 * Main function to retry the task data fetch until a new round is found
 */
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
    const submissionList = taskData.submissions;
    const tweetList = await queueCID(submissionList);
    
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
