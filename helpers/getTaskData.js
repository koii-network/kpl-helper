const { Connection, PublicKey } = require("@_koi/web3.js");

async function getTaskData(taskID) {
  const connection = new Connection("https://k2-testnet.koii.live");

  // Check if TASK_ID is defined
  if (!taskID) {
    throw new Error("TASK_ID is not defined in the .env file");
  }

  const accountInfo = await connection.getAccountInfo(new PublicKey(taskID));
  let taskState = JSON.parse(accountInfo.data);

  // Create a submissionList to contain each submission_value
  let submissionList = [];

  // Identify the round with the highest number
  let maxRound = Math.max(...Object.keys(taskState.submissions).map(Number));

  // Iterate through the entries in the highest round
  for (let entry in taskState.submissions[maxRound]) {
    // Extract the submission_value and add it to the list
    submissionList.push(
      taskState.submissions[maxRound][entry].submission_value
    );
  }

  return {
    submissions: submissionList,
    maxRound: maxRound,
    roundTime: taskState.round_time,
  };
}

module.exports = getTaskData;
