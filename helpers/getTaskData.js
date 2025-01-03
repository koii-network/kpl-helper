const { Connection, PublicKey } = require("@_koii/web3.js");
const  { getTaskStateInfo } = require("@_koii/create-task-cli");

async function getTaskData(taskID, round) {
  const connection = new Connection("https://testnet.koii.network");

  // Check if TASK_ID is defined
  if (!taskID) {
    throw new Error("TASK_ID is not defined in the .env file");
  }

  let maxRound;
  let submissionList;
  let taskState;

  async function getLatestTaskData() {
    // const accountInfo = await connection.getAccountInfo(new PublicKey(taskID));
    taskState = await getTaskStateInfo(connection, taskID);

    // taskState = JSON.parse(accountInfo.data);
    // console.log(taskState.submissions);

    // Create a submissionList to contain each submission_value
    submissionList = [];

    // Identify the round with the highest number
    maxRound = Math.max(...Object.keys(taskState.submissions).map(Number));
  }

  await getLatestTaskData();

  //Checks if there is a new round:
  if (round < maxRound) {
    // console.log(`A new round, ${maxRound} has been detected.`);
    // console.log("Waiting 2 Minutes for the potential submission period.");
    await new Promise((resolve) => setTimeout(resolve, 600));
    // console.log("2 Minutes has passed, re-starting the operation.");
    await getLatestTaskData();
  } else {
    return false;
  }

  // Iterate through the entries in the highest round
  // console.log(taskState.submissions)
  for (let entry in taskState.submissions[maxRound - 1]) {
    // Extract the submission_value and add it to the list
    submissionList.push(
      taskState.submissions[maxRound - 1][entry].submission_value
    );
  }

  return {
    submissions: submissionList,
    maxRound: maxRound - 1,
    roundTime: taskState.round_time
  };
}
// getTaskData("6n14Y6Y5uUvD93AAMDv3UvQpVPgWhdeYDSPztwKvbdQZ", 0);
module.exports = getTaskData;
