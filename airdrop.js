const getStakingAccountInfo = require("./helpers/getStakingAccountInfo");
const transferKPL = require("./helpers/transferKPL");
const getFrequentstakingKeys = require("./helpers/getFrequentStake");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.DB_KEY;
const DB_name = "airdrop_middleman";
const collection_name = "kplairdrop";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function hasDateTransferred(address, date) {
  await client.connect();
  const database = client.db(DB_name);
  const transfersCollection = database.collection(collection_name);
  try {
    // Check if a record with the given address and date exists in the collection
    const transfer = await transfersCollection.findOne({
      address: address,
      date: date,
    });
    return transfer !== null; // Return true if both address and date exist, otherwise false
  } catch (error) {
    console.error("Error checking round transfer:", error);
    return false; // Return false if an error occurs
  } finally {
    await client.close(); // Ensure the client connection is closed
  }
}

async function recordTransfer(date, kplToken, address) {
  await client.connect();
  const database = client.db(DB_name);
  const transfersCollection = database.collection(collection_name);
  try {
    // Insert the transfer record
    await transfersCollection.insertOne({
      date: date,
      token: kplToken,
      address: address, // An array of objects with { address, amount }
      timestamp: new Date(),
    });

    // console.log(`Recorded transfer for date ${date}`);
  } catch (error) {
    console.error("Error recording transfer:", error);
  }
}

async function main() {
  try {
    const listOfKPLs = [
      "us8mD4jGkFWnUuAHB8V5ZcrAosEqi2h1Zcyca68QA1G", // BIRD
      "9UcQaSsBTeXowhMBgSbTEeQubGHxXDNJRjz4s7uxibTP", // BB
      "FJG2aEPtertCXoedgteCCMmgngSZo1Zd715oNBzR7xpR", // FIRE
      // "BmdvRw51zhCKfkBmw6jmLawJafimTMtZ2eVwT3fL2WM6", // RATs
      "n3Rep7GRh3jgkGXaULNu8WzfuwCC9Rcrv82mxzJMnnH", // SONO
      // "NGFruaQX9xHqWv195RNQL2wtq2LJwTmnkE9XjGAZKHx", // SOMA
      "3kh898gitJDSb6b7MsntLqyUAvy3Y6D4PkMyGfinubht", // VIP
      // "EErjDSPHmjz9ZipEtVoN54QzCjPvePBADvXcWKT659NW", // SSS
    //   "HK8STMDTos4QFocyEADxwdXBrN13DCB9AcwLXsmvBthh", // SMART
    
    ];

    let stakingList = await getFrequentstakingKeys();
    console.log(`${stakingList.length} address to airdrop`);

    const randomKPL = listOfKPLs[Math.floor(Math.random() * listOfKPLs.length)];

    // Airdrop amount
    const date = new Date().toISOString().split("T")[0];
    let kplPerSubmission = 0.2;

    console.log("Date already transferred", date);
    // Transfer KPL to all addresses
    for (let i = 0; i < stakingList.length; i++) {
      const address = await getStakingAccountInfo(stakingList[i]);
      let checkTransferred = await hasDateTransferred(address, date);
      if (!checkTransferred) {
        const transferResult = await transferKPL(
          randomKPL,
          address,
          kplPerSubmission
        );

        if (transferResult) {
          console.log(`Transferred ${kplPerSubmission} KPL to ${address}`);
        }
        // Record the transfer
        await recordTransfer(date, randomKPL, address);
      } else {
        console.log("Already airdrop to this address");
        continue;
      }
    }

    // Wait for the next round
    console.log("Waiting for the next date...");
    // await new Promise((resolve) => setTimeout(resolve, taskData.roundTime * 1000));
    main();
  } catch (error) {
    console.error("Error in main function:", error);
    console.log("Retrying in 5 seconds");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    main();
  }
}

main();
