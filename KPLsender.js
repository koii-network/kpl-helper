const { Connection, PublicKey } = require("@_koii/web3.js");
const transferKPL = require("./helpers/transferKPL");
const { getTaskStateInfo } = require("@_koii/create-task-cli");
const getStakingAccountInfo = require("./helpers/getStakingAccountInfo");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.DB_KEY;
const DB_name = "tweets_middleman";
const collection_name = "kplsender";

async function main() {
  try {
    const KPLMintAddress = "NGFruaQX9xHqWv195RNQL2wtq2LJwTmnkE9XjGAZKHx"; // SOMA
    const connection = new Connection("https://testnet.koii.network");

    const taskData = await getTaskStateInfo(
      connection,
      "7dkNVRtCbm1w9LAuMVYQUMgq85Wkme8GZ7TUPvgoCEe5"
    );
    const stakeList = taskData.stake_list;
    const addresses = Object.keys(stakeList);

    // Transfer KPL to all addresses
    for (const address of addresses) {
        let walletAddress = await getStakingAccountInfo(address);
        if (!walletAddress) {
          // console.log(`No transactions found for ${address}`);
          try {
            // walletAddress = await getUserMainWallet(address);
            if (!walletAddress) {
              // console.log(`Main wallet not found for ${address}`);
              continue;
            }
          } catch (error) {
            console.error("Error fetching main wallet:", error);
            continue;
          }
        }
        const amount = stakeList[address] / 1000000000; // Convert amount to correct KPL
        const transferResult = await transferKPL(
          KPLMintAddress,
          walletAddress,
          amount
        );

        if (transferResult) {
          console.log(`Transferred ${amount} KPL to ${address}`);
              // Record the transfer after processing all addresses
            //  await recordTransfer(taskData.maxRound, KPLMintAddress, addresses);
        } else {
          console.log(`Failed to transfer to ${address}`);
        }
      }

  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();
