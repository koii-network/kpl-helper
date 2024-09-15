const transferKPL = require("./helpers/transferKPL");
const getStakingKey = require("./helpers/getStakingKey");
const getStakingAccountInfo = require("./helpers/getStakingAccountInfo");
const getUserMainWallet = require("./helpers/getUserMainWallet");
const { MongoClient } = require("mongodb");
const cron = require("node-cron"); // Add node-cron
const moment = require("moment");
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
  const targetWalletList = [];
  await client.connect();

  // Task ID here(FTT)
  const stakingList = await getStakingKey(
    "Aqr6jKpv7spkZ8TpLpEsLF5jvjNeHpaHaHPtkt4UTkn6"
  );
  // Populate targetWalletList with the addresses from stakingList
  for (let walletAddress of Object.keys(stakingList)) {
    targetWalletList.push(walletAddress);
  }

  console.log("Target Wallet Length:", targetWalletList.length);

  try {
    for (let i = 0; i < targetWalletList.length; i++) {
      let walletAddress = await getStakingAccountInfo(targetWalletList[i]);
      if (!walletAddress) {
        // console.log(`No transactions found for ${targetWalletList[i]}`);
        try {
          walletAddress = await getUserMainWallet(targetWalletList[i]);
          if (!walletAddress) {
            // console.log(`Main wallet not found for ${targetWalletList[i]}`);
            continue;
          }
        } catch (error) {
          console.error("Error fetching main wallet:", error);
          continue;
        }
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


      // Add the transfer details to MongoDB
      if (signature) {
        console.log(`Transferred ${amount} KPL to ${walletAddress}`);
        await insertTransferRecord(mintToken, walletAddress, amount, client);
        console.log(
          `Inserted transfer record for ${walletAddress} into MongoDB`
        );
      }
      // Delay for 0.5 seconds
      await delay(200);
    }
  } finally {
    await client.close(); // Always ensure that the client is closed
  }
}

// Function to calculate time until next job
function timeUntilNextJob(hour, minute) {
  const now = moment();
  const nextJob = moment().hour(hour).minute(minute).second(0);

  // If the next job time is earlier in the day than now, schedule it for tomorrow
  if (now.isAfter(nextJob)) {
    nextJob.add(1, 'days');
  }

  const duration = moment.duration(nextJob.diff(now));
  const hours = Math.floor(duration.asHours());
  const minutes = Math.floor(duration.minutes());

  console.log(`Next job will start in ${hours} hours and ${minutes} minutes.`);
}

// Check how long until the job starts at 20:00 (8 PM)
// timeUntilNextJob(20, 0);

// Schedule the job to run every day at midnight
// cron.schedule("0 20 * * *", async () => {
//     console.log("Running the transfer script at noon");
    main();
  // });
