const getTaskData = require("./helpers/getTaskData");
const transferKOII = require("./helpers/transferKOII");
const { MongoClient } = require("mongodb");
const { Connection } = require("@_koii/web3.js");
require("dotenv").config();

const uri = process.env.DB_KEY;
const DB_name = "mainnet_airdrop_middleman";
const collection_name = "koiiminer";

async function hasRoundTransferred(round) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const database = client.db(DB_name);
    const transfersCollection = database.collection(collection_name);

    // Check if the round exists in the collection
    const transfer = await transfersCollection.findOne({ round: round });
    return transfer !== null; // If the round exists, it has been transferred
  } catch (error) {
    console.error("Error checking round transfer:", error);
    return false; // Return false if error occurs
  } finally {
    await client.close(); // Ensure the connection is closed
  }
}

async function recordTransfer(round, koiiToken, transfers, taskID) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const database = client.db(DB_name);
    const transfersCollection = database.collection(collection_name);

    // Insert the transfer record
    await transfersCollection.insertOne({
      round: round,
      token: koiiToken,
      transfers: transfers, // An array of objects with { address, amount }
      taskID: taskID,
      timestamp: new Date(),
    });

    console.log(`Recorded transfer for round ${round}`);
  } catch (error) {
    console.error("Error recording transfer:", error);
  } finally {
    await client.close(); // Ensure the connection is closed
  }
}

async function main() {
  try {
    let addresses = [];
    const taskID = "4ESVAytVPEmTWeVGxKX3kVhFrfFYPkXSCTMqFmWc5M4v";

    const connection = new Connection("https://mainnet.koii.network");
    const taskData = await getTaskData(
      connection,
      taskID,
      0
    );
    // console.log("taskData", taskData);
    
    addresses = taskData.submitters;
    let koiiPerSubmission = 0.001;

    console.log("Miner round: ", taskData.maxRound)
    console.log("KOII per submission: ", koiiPerSubmission);
    console.log("Addresses: ", addresses.length);

    let checkTransferred = await hasRoundTransferred(taskData.maxRound);
    if (checkTransferred) {
      console.log("Round already transferred", taskData.maxRound);
    } else {
      // Transfer KOII to all addresses
      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        const transferResult = await transferKOII(connection, address, koiiPerSubmission);
        
        if (transferResult) {
          console.log(`Transferred ${koiiPerSubmission} KOII to ${address}`);
        }
      }
      
      // Record the transfer after processing all addresses
      await recordTransfer(taskData.maxRound, "KOII", addresses, taskID);
    }

    // Wait for the next round
    console.log("Waiting for the next round...");
    await new Promise((resolve) => setTimeout(resolve, 600000));
    main();
  } catch (error) {
    console.error("Error in main function:", error);
    console.log("Retrying in 5 seconds");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    main();
  }
}

main();
