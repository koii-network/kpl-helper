const { MongoClient } = require("mongodb");
require("dotenv").config();
const { Connection, PublicKey } = require ("@_koii/web3.js");

async function getFrequentstakingKeys() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();

    // Source database and collection
    const taskTrackerDb = client.db("taskTracker");
    const submissionsCollection = taskTrackerDb.collection("submissions");
    const keybindingsCollection = taskTrackerDb.collection("keybindings");

    // Target database and collection
    const mainnetMigrationDb = client.db("migrationData");
    const nodesCollection = mainnetMigrationDb.collection("nodes20of30");

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0); // Start of the current day in UTC
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30); // Subtract 30 days
    console.log("30 Days Ago (Midnight UTC):", thirtyDaysAgo);

    // Step 1: Group submissions by date
    const daysMap = {};

    // Query the documents for the last 30 days
    const documents = await submissionsCollection
      .find({
        createdAt: {
          $gte: new Date(
            thirtyDaysAgo.toISOString().split("T")[0] + "T00:00:00Z"
          ),
        },
      })
      .toArray();

    // Group by date and collect unique stakingKeys
    documents.forEach((doc) => {
      if (doc.createdAt && doc.submissions) {
        const date = new Date(doc.createdAt).toISOString().split("T")[0]; // Extract the date (YYYY-MM-DD)

        // Initialize the set for the day if it doesn't exist
        if (!daysMap[date]) {
          daysMap[date] = new Set();
        }

        // Add stakingKeys to the set
        doc.submissions.forEach((stakingKey) => {
          daysMap[date].add(stakingKey);
        });
      } else {
        console.log("Document missing createdAt or submissions:", doc);
      }
    });

    // Step 2: Count days for each stakingKey
    const stakingKeyCounts = {};

    Object.values(daysMap).forEach((stakingKeysSet) => {
      stakingKeysSet.forEach((stakingKey) => {
        if (!stakingKeyCounts[stakingKey]) {
          stakingKeyCounts[stakingKey] = 0;
        }
        stakingKeyCounts[stakingKey]++;
      });
    });

    // Step 3: Filter stakingKeys by threshold
    const threshold = 20;
    const frequentStakingKeys = Object.keys(stakingKeyCounts).filter(
      (stakingKey) => stakingKeyCounts[stakingKey] >= threshold
    );

    // Step 4: Handle No Frequent Keys
    if (frequentStakingKeys.length === 0) {
      // Find the maximum days any stakingKey appeared
      const maxDays = Math.max(...Object.values(stakingKeyCounts));
      console.log(
        `No stakingKey met the threshold of ${threshold} days. Maximum days any stakingKey appeared: ${maxDays}`
      );
      return; // Exit the function gracefully
    }

    // Step 5: Write results to mainnet_migration.nodes20of30
    const documentsToWrite = frequentStakingKeys.map((stakingKey) => ({
      stakingKey,
      count: stakingKeyCounts[stakingKey],
      dateAdded: new Date(),
    }));

    // Clear existing data in the target collection if needed
    await nodesCollection.deleteMany({}); // Optional: clear the collection

    // Insert new data
    const result = await nodesCollection.insertMany(documentsToWrite);

    console.log(
      `Inserted ${result.insertedCount} documents into migrationData.nodes20of30`
    );

    // Step 5: Update each document with publicKey and balance
    for (const document of documentsToWrite) {
        const keybinding = await keybindingsCollection.findOne({
          stakingKey: document.stakingKey,
        });
  
        const publicKey = keybinding?.publicKey || null;
        const balance = publicKey ? await getBalanceForPublicKey(publicKey) : 0;
  
        await nodesCollection.updateOne(
          { stakingKey: document.stakingKey },
          {
            $set: {
              publicKey,
              balance,
            },
          }
        );
      }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

getFrequentstakingKeys();



const getBalanceForPublicKey = async (publicKey) => {
    try {
        // Connect to the network
        const connection = new Connection("https://testnet.koii.network");

        // Get account information
        const account = await connection.getAccountInfo(new PublicKey(publicKey));

        if (!account) {
            console.log(`No account found for publicKey: ${publicKey}`);
            return 0; // Return 0 if the account does not exist
        }

        // Convert lamports to KOII
        const balanceInKoii = account.lamports / 1e9; // Divide lamports by 1e9 to get KOII
        console.log(`PublicKey: ${publicKey}, Balance in KOII: ${balanceInKoii}`);

        return balanceInKoii;
    } catch (error) {
        console.error(`Error fetching balance for publicKey: ${publicKey}`, error);
        return 0; // Return 0 in case of an error
    }
};
