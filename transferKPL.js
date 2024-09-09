const transferKPL = require("./helpers/transferKPL");
const getStakingKey = require("./helpers/getStakingKey");
const getStakingAccountInfo = require("./helpers/getStakingAccountInfo");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.DB_KEY;
const client = new MongoClient(uri, { useUnifiedTopology: true });
const dbName = "tweets_middleman";
const collectionName = "userKPLtransfer";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to check if the target wallet and mint token exist in the database
async function checkExistingTransfer(mintToken, targetWallet, client) {
  const collection = client.db(dbName).collection(collectionName);
  const existingTransfer = await collection.findOne({
    targetWallet: targetWallet,
    [`mintToken.${mintToken}`]: { $exists: true },
  });
  return existingTransfer != null;
}

// Function to insert transfer details into MongoDB
async function insertTransferRecord(mintToken, targetWallet, amount, client) {
  const collection = client.db(dbName).collection(collectionName);
  const timestamp = new Date();

  // Update the document if targetWallet exists, else insert a new document
  await collection.updateOne(
    { targetWallet: targetWallet }, // Filter by targetWallet
    {
      $set: { timestamp: timestamp }, // Set/Update timestamp
      $inc: { [`mintToken.${mintToken}`]: amount }, // Increment amount for the mintToken
    },
    { upsert: true } // Insert a new document if it doesn't exist
  );
}

async function main() {
  const mintToken = "us8mD4jGkFWnUuAHB8V5ZcrAosEqi2h1Zcyca68QA1G"; // BIRD
  const targetWalletList = ["HRw1QQ1siygapG7pmsFH3PGNs5YnD9a8sNsWRCmZoi8e"];
  await client.connect();

  //   const targetPublicAddress = await getStakingAccountInfo(
  //     "3JF13GJW2UeYuTTRJQBdBD9bHP6Zj1QLMyXBMoAP2r5Y"
  //   );
  //   console.log(targetPublicAddress);

  const stakingList = await getStakingKey(
    "BVCsj5CGEMJ1sxLnyo6zqtdoWsiKL9S22SBTW89DG8Lp"
  );
  // Populate targetWalletList with the addresses from stakingList
  for (let walletAddress of Object.keys(stakingList)) {
    targetWalletList.push(walletAddress);
  }

  console.log("Target Wallet Length:", targetWalletList.length);

    try {
      for (let i = 0; i < targetWalletList.length; i++) {
        const walletAddress = await getStakingAccountInfo(targetWalletList[i]);
        if (!walletAddress) {
          console.log(`No transactions found for ${targetWalletList[i]}`);
          continue;
        }
        // const walletAddress = targetWalletList[i];
        const amount = 10; // Adjust the amount as needed

        // Check if this wallet and mint token already exists in the database
        const exists = await checkExistingTransfer(mintToken, walletAddress, client);
        if (exists) {
          console.log(`Transfer to ${walletAddress} with ${mintToken} already exists, skipping...`);
          continue;
        }

        // Perform the transfer
        // await transferKPL(mintToken, walletAddress, amount);
        console.log(`Transferred ${amount} KPL to ${walletAddress}`);

        // Add the transfer details to MongoDB
        // await insertTransferRecord(mintToken, walletAddress, amount, client);
        console.log(`Inserted transfer record for ${walletAddress} into MongoDB`);

        // Delay for 5 seconds
        await delay(5000);
      }
    } finally {
      await client.close(); // Always ensure that the client is closed
    }
}

main();
