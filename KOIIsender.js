const { Connection, PublicKey } = require("@_koii/web3.js");
const transferKOII = require("./helpers/transferKOII");
const { getTaskStateInfo } = require("@_koii/create-task-cli");
const getStakingAccountInfo = require("./helpers/getStakingAccountInfo");
const { MongoClient } = require("mongodb");
const fs = require('fs');
require("dotenv").config();

const uri = process.env.DB_KEY;
const DB_name = "mainnet_airdrop_middleman";
const collection_name = "KOIIsender";

// Create a single MongoDB client instance
let mongoClient = null;

async function connectToMongo() {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.DB_KEY, {
      // Remove deprecated options
      // useNewUrlParser and useUnifiedTopology are no longer needed in MongoDB 4.0+
    });
    await mongoClient.connect();
  }
  return mongoClient;
}

async function hasRoundTransferred(taskId, address) {
  try {
    const client = await connectToMongo();
    const db = client.db(DB_name);
    const collection = db.collection(collection_name);
    
    const result = await collection.findOne({ 
      task: taskId,
      stakingAddress: address 
    });
    return !!result;
  } catch (error) {
    console.error('Error checking round transfer:', error);
    return false;
  }
}

async function recordTransfer(taskId, address, walletAddress, amount, signature) {
  try {
    const client = await connectToMongo();
    const db = client.db(DB_name);
    const collection = db.collection(collection_name);

    // Insert the transfer record with all the necessary fields
    await collection.insertOne({
      task: taskId,
      stakingAddress: address,
      walletAddress: walletAddress,
      amount: amount,
      signature: signature,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error recording transfer:", error);
  }
}

function getAddressesFromFile(fileName) {
  try {
    const fileData = fs.readFileSync(fileName, 'utf8');
    const jsonData = JSON.parse(fileData);
    return jsonData.addresses;
  } catch (error) {
    console.error('Error reading addresses from file:', error);
    return null;
  }
}

async function main() {
  try {
    const connection = new Connection("https://mainnet.koii.network");
    // const taskData = await getTaskStateInfo(
    //   connection,
    //   "GKvoaVSNAfV96nGui8EmhWcVpg38n6s545isjHDUQoVF" // Task ID
    // );
    // const stakeList = taskData.stake_list;
    // const addresses = Object.keys(stakeList);

    // Get addresses from file
    const addresses = getAddressesFromFile('stakeList_2025-02-07T21-36-23-065Z.json');
    if (!addresses) {
      console.error('Failed to load addresses from file');
      return;
    }
    console.log(`Loaded ${addresses.length} addresses from file`);
    // console.log(addresses);
    
    // Store addresses in a JSON file (If needed)
    // const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // const fileName = `stakeList_${timestamp}.json`;
    
    // const dataToStore = {
    //   taskId: "GKvoaVSNAfV96nGui8EmhWcVpg38n6s545isjHDUQoVF",
    //   timestamp: new Date().toISOString(),
    //   addresses: addresses,
    //   stakeList: stakeList // Including full stake list data for reference
    // };

    // fs.writeFileSync(
    //   fileName,
    //   JSON.stringify(dataToStore, null, 2)
    // );
    
    // console.log(`Stored ${addresses.length} addresses in ${fileName}`);

    // Process transfers in batches of 10
    const batchSize = 10;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const transferPromises = batch.map(async (address) => {
        try {
          const checkTransferred = await hasRoundTransferred(
            "GKvoaVSNAfV96nGui8EmhWcVpg38n6s545isjHDUQoVF",
            address
          );
          if (checkTransferred) {
            console.log("Already sent KOII to ", address);
            return null;
          }

          const walletAddress = await getStakingAccountInfo(address);
          if (!walletAddress) {
            console.log(`No transactions found for ${address}`);
            return null;
          }

          console.log("Processing:", address, "walletAddress:", walletAddress);
          const amount = 100;
          const transferResult = await transferKOII(
            connection,
            walletAddress,
            amount
          );

          if (transferResult && transferResult.success) {
            console.log(`Transferred ${amount} KOII to ${walletAddress}`);
            await recordTransfer(
              "GKvoaVSNAfV96nGui8EmhWcVpg38n6s545isjHDUQoVF",
              address,
              walletAddress,
              amount,
              transferResult.signature
            );
            return transferResult;
          }
          console.log(`Failed to transfer to ${walletAddress}`);
          return null;
        } catch (error) {
          console.error(`Error processing address ${address}:`, error);
          return null;
        }
      });

      // Wait for the current batch to complete before moving to the next
      await Promise.all(transferPromises);
      console.log(`Completed batch of ${batch.length} transfers`);
      
      // Optional: Add a small delay between batches to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("Error in main function:", error);
  } finally {
    // Close MongoDB connection when done
    if (mongoClient) {
      await mongoClient.close();
      mongoClient = null;
    }
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down...');
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
  process.exit(0);
});

main();
