const transferKPL = require("./helpers/transferKPL");
const getStakingKey = require("./helpers/getStakingKey");
const getStakingAccountInfo = require("./helpers/getStakingAccountInfo");
const { MongoClient } = require("mongodb");
const cron = require("node-cron"); // Add node-cron
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
  const mintToken = "FJG2aEPtertCXoedgteCCMmgngSZo1Zd715oNBzR7xpR"; // FIRE
  const targetWalletList = [];
  await client.connect();

  // Task ID here(FTT)
  const stakingList = await getStakingKey(
    "Gz2xuLQW1scgiasVLfefteifwWj4GnCJCt1SyYTSr3L4"
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
      const exists = await checkExistingTransfer(
        mintToken,
        walletAddress,
        client
      );
      if (exists) {
        console.log(
          `Transfer to ${walletAddress} with ${mintToken} already exists, skipping...`
        );
        continue;
      }

      // Perform the transfer
      const signature = await transferKPL(mintToken, walletAddress, amount);
      console.log(`Transferred ${amount} KPL to ${walletAddress}`);

      // Add the transfer details to MongoDB
      if (signature) {
        await insertTransferRecord(mintToken, walletAddress, amount, client);
        console.log(
          `Inserted transfer record for ${walletAddress} into MongoDB`
        );
      }
      // Delay for 5 seconds
      await delay(5000);
    }
  } finally {
    await client.close(); // Always ensure that the client is closed
  }
}

// Schedule the job to run every day at midnight
cron.schedule("0 0 * * *", async () => {
    console.log("Running the transfer script at midnight");
    await main();
  });
