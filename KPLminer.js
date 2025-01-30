const getTaskData = require("./helpers/getTaskData");
const transferKPL = require("./helpers/transferKPL");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.DB_KEY;
const DB_name = "mainnet_airdrop_middleman";
const collection_name = "kplminer";

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

async function recordTransfer(round, kplToken, transfers) {
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
      token: kplToken,
      transfers: transfers, // An array of objects with { address, amount }
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
    // mainnet kpl token mint addresses
    const listOfKPLs = [
      "Fe7878UvoGHUM7B8C95rX3MigUqtBZmtcPcX5sz3Qhxd", // BIRD
      "AayQB5XgchRR9zTr5bi95aQ1FFtJ6jEVmbrBQRx5m4gw", // BB
      "CJLjkLohs3PScpBQ3r1WKHjQsWYPq291MgPjpTWTXNc4", // ASTRO
      "4qayyw53kWz6GzypcejjT1cvwMXS1qYLSMQRE8se3gTv", // FIRE
      "9VUq3SfNDh1bgwamF8tr9aGvuXvNi6ktjx1Edc2da7ey", // VIP
      "AoH4CZCusGBivTYAPukc8euJDHDsbbcfyDcL429GFj3C", // SOMA
      "BY5Vjkd34oK9QeahjPdTPkQFGBawFycSrkDSqE8JXqc5", // SONA
      // "5WWwTwzaM9So2pxAY3wzktTDHARhhnRmSvYpxxw5wLkJ", // FISH
      // "CgdFgTz2iX9B63XASmraYExu9gTs27DfK7JW4S6tbmgD", // KVN
      // "n3Rep7GRh3jgkGXaULNu8WzfuwCC9Rcrv82mxzJMnnH", // SONO
      // "BmdvRw51zhCKfkBmw6jmLawJafimTMtZ2eVwT3fL2WM6", // RATs
      // "NGFruaQX9xHqWv195RNQL2wtq2LJwTmnkE9XjGAZKHx", // SOMA
      // "EErjDSPHmjz9ZipEtVoN54QzCjPvePBADvXcWKT659NW", // SSS
      // "HK8STMDTos4QFocyEADxwdXBrN13DCB9AcwLXsmvBthh" // SMART

    ];

    let addresses = [];

    const taskData = await getTaskData(
      "2XUizbiDdG2PUWHX48vFzp7ekqJ2NpgCvtGtHHpDiHtS",
      0
    );
    
    const randomKPL = listOfKPLs[Math.floor(Math.random() * listOfKPLs.length)];

    // Split 500 KPL among all submission addresses
    // const totalKPL = 3000;
    addresses = taskData.submissions;
    // let kplPerSubmission = totalKPL / addresses.length;
    // kplPerSubmission = parseFloat(kplPerSubmission.toFixed(2));

    let kplPerSubmission = 0.2;

    console.log("Miner round: ", taskData.maxRound)
    console.log("Random KPL: ", randomKPL);
    console.log("KPL per submission: ", kplPerSubmission);
    console.log("Addresses: ", addresses.length);

    let checkTransferred = await hasRoundTransferred(taskData.maxRound);
    if (checkTransferred) {
      console.log("Round already transferred", taskData.maxRound);
    } else {
      // Transfer KPL to all addresses
      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        const transferResult = await transferKPL(randomKPL, address, kplPerSubmission);
        
        if (transferResult) {
          console.log(`Transferred ${kplPerSubmission} KPL to ${address}`);
        }
      }
      
      // Record the transfer after processing all addresses
      await recordTransfer(taskData.maxRound, randomKPL, addresses);
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
