const { Connection, PublicKey } = require("@_koii/web3.js");

async function getStakingKey(taskID) {
  const connection = new Connection("https://mainnet.koii.network");

  // Check if TASK_ID is defined
  if (!taskID) {
    throw new Error("TASK_ID is not defined");
  }

  const accountInfo = await connection.getAccountInfo(new PublicKey(taskID));
  let taskState = JSON.parse(accountInfo.data);
  let stakingList =  taskState.stake_list
//   console.log(stakingList);
  return stakingList;
}
module.exports = getStakingKey;
