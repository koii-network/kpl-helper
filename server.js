const express = require("express");
const axios = require("axios");
const getTaskData = require("./helpers/getTaskData");
require("dotenv").config();
const app = express();
const port = 3000;
const getStakingKey = require("./helpers/getStakingKey");
const cron = require("node-cron");
app.use(express.json());

// Custom keywords or randomly selected
const defaultKeyword = process.env.KEY_WORD;
let pendingRequests = [];
let stakingKeyList = {};

// Function to update stakingKeyList
async function updateStakingKeyList() {
  try {
    stakingKeyList = await getStakingKey(process.env.TASK_ID);
    // console.log("Updated stakingKeyList:", stakingKeyList);
  } catch (error) {
    console.error("Error updating stakingKeyList:", error);
  }
}

// Run the updateStakingKeyList function immediately and then every 10 minutes
updateStakingKeyList();
cron.schedule("*/10 * * * *", updateStakingKeyList);

app.get("/keywords", (req, res) => {
  try {
    console.log("Request received:", req.query);
    const stakingKey = req.query;
    console.log("Staking Key:", stakingKey.key);
    if (!stakingKey || !stakingKeyList[stakingKey.key]) {
      console.log("Invalid stakingKey provided:", stakingKey);
      return res.status(400).send(`Valid stakingKey is required or Not found, please run task ${process.env.TASK_ID} first.`);
    }

    let keyword;

    if (pendingRequests.length > 0) {
      keyword = pendingRequests.shift(); // Get keyword from pendingRequests and remove it
      console.log("Keyword from pendingRequests:", keyword);
    } else {
      keyword = defaultKeyword;
      if (!keyword) {
        console.log(
          "No Keywords from pending list, loading local keywords.json"
        );
        const wordsList = require("./keywords.json");
        const randomIndex = Math.floor(Math.random() * wordsList.length);
        keyword = wordsList[randomIndex]; // Load local JSON data
        console.log("Keyword from json:", keyword);
      }
    }

    res.send(keyword);
  } catch (error) {
    console.log("Error processing request:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to add pending keywords
app.post("/add-pending-keywords", (req, res) => {
  try {
    const { keywords } = req.body;

    if (!keywords || !Array.isArray(keywords)) {
      return res
        .status(400)
        .send("Invalid input, array of keywords is required");
    }

    pendingRequests = pendingRequests.concat(keywords);
    console.log("Pending requests updated:", pendingRequests);

    res.send("Keywords added to pending requests");
  } catch (error) {
    console.log("Error processing request:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get taskstate from running task
app.get("/taskstate", async (req, res) => {
  try {
    const taskID = process.env.TASK_ID;
    const round = 0;
    const taskData = await getTaskData(taskID, round);
    res.json({ taskData });
  } catch (error) {
    console.error("Error fetching task data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
