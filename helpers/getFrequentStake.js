const { MongoClient } = require("mongodb");
require("dotenv").config();
const { Connection, PublicKey } = require("@_koii/web3.js");

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
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 1); // Subtract 1 days
    console.log("1 Days Ago (Midnight UTC):", thirtyDaysAgo);

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

    // console.log(documents)

    const stakingKeyCounts = [];

    // Step 2: Populate stakingKeyCounts with all staking keys
    Object.values(daysMap).forEach((stakingKeysSet) => {
      stakingKeysSet.forEach((stakingKey) => {
        stakingKeyCounts.push(stakingKey);
      });
    });

    // Step 3: Count the occurrences of each staking key
    const stakingKeyOccurrences = stakingKeyCounts.reduce((acc, stakingKey) => {
      acc[stakingKey] = (acc[stakingKey] || 0) + 1;
      return acc;
    }, {});

    // Step 4: Filter stakingKeys by threshold
    const threshold = 2;
    const frequentStakingKeys = Object.keys(stakingKeyOccurrences).filter(
      (stakingKey) => stakingKeyOccurrences[stakingKey] >= threshold
    );

    // Step 5: Handle No Frequent Keys
    if (frequentStakingKeys.length === 0) {
      // Find the maximum days any stakingKey appeared
      const maxDays = Math.max(...Object.values(stakingKeyOccurrences));
      console.log(
        `No stakingKey met the threshold of ${threshold} days. Maximum days any stakingKey appeared: ${maxDays}`
      );
      return; // Exit the function gracefully
    }

    // Output frequent staking keys
    console.log(frequentStakingKeys.length);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

getFrequentstakingKeys();
