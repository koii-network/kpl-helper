const { Connection, PublicKey } = require("@_koii/web3.js");
const transferKPL = require("./helpers/transferKPL");
const { getTaskStateInfo } = require("@_koii/create-task-cli");
const getStakingAccountInfo = require("./helpers/getStakingAccountInfo");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.DB_KEY;
const DB_name = "mainnet_airdrop_middleman";
const collection_name = "kplsender";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function hasRoundTransferred(address) {
  try {
    await client.connect();
    const database = client.db(DB_name);
    const transfersCollection = database.collection(collection_name);

    // Check if the round exists in the collection
    const transfer = await transfersCollection.findOne({ address: address });
    // console.log(transfer)
    return transfer !== null; // If the round exists, it has been transferred
  } catch (error) {
    console.error("Error checking round transfer:", error);
    return false; // Return false if error occurs
  } finally {
    await client.close(); // Ensure the connection is closed
  }
}

async function recordTransfer(round, kplToken, address) {
  try {
    await client.connect();
    const database = client.db(DB_name);
    const transfersCollection = database.collection(collection_name);

    // Insert the transfer record
    await transfersCollection.insertOne({
      round: round,
      token: kplToken,
      address: address, // An array of objects with { address, amount }
      timestamp: new Date(),
    });

    // console.log(`Recorded transfer for round ${round}`);
  } catch (error) {
    console.error("Error recording transfer:", error);
  } finally {
    await client.close(); // Ensure the connection is closed
  }
}

async function main() {
  try {
    const KPLMintAddress = "CJLjkLohs3PScpBQ3r1WKHjQsWYPq291MgPjpTWTXNc4"; // ASLINK
    const connection = new Connection("https://mainnet.koii.network");

    const taskData = await getTaskStateInfo(
      connection,
      "E1EF4QTSMVXvVCGLu5iCBVhwvYdkUAq1qxvVg3e4xP5F" // Task ID
    );
    const stakeList = taskData.stake_list;
    const addresses = Object.keys(stakeList);

    // Transfer KPL to all addresses
    for (const address of addresses) {
      let checkTransferred = await hasRoundTransferred(address);
      if (!checkTransferred) {
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
        const amount = 1; // Convert amount to correct KPL
        const transferResult = await transferKPL(
          KPLMintAddress,
          walletAddress,
          amount
        );

        if (transferResult) {
          console.log(`Transferred ${amount} KPL to ${address}`);
          // Record the transfer after processing all addresses
          await recordTransfer(0, KPLMintAddress, address);
          // Record the transfer after processing all addresses
          //  await recordTransfer(taskData.maxRound, KPLMintAddress, addresses);
        } else {
          console.log(`Failed to transfer to ${address}`);
        }
      } else {
        console.log("Already sent KPL to ", address);
      }
    }
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();
