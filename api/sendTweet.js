require("dotenv").config();
const axios = require("axios");
const os = require("os");

// Function to send a single tweet as a POST request
async function sendTweet(tweetBatch) {
  // const url = "http://koii-external.a.site/post_twitter_data";
  const url = "http://koii-external.a.site/post_twitter_data";

  const headers = {
    "Content-Type": "application/json",
    keep_alive: "False",
    token: process.env.USER_TOKEN,
  };
  const timeout = 5000;
  const date = new Date().toISOString(); // Current date and time
  const IP = getMyIP(); // Your IP address

  try {
    const data = {
      data: tweetBatch,
      date: date,
      IP: IP,
    };
    console.log("Sending batch data:", data);
    const response = await axios.post(url, data, {
      headers: headers,
      timeout: timeout,
    });
    console.log("Batch data sent successfully:", response.data);
    return true;
  } catch (error) {
    console.error("An error occurred while sending the batch data:", error);
    return false;
  }
}

// Function to get the first non-internal IP address
function getMyIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "0.0.0.0"; // Default IP if none found
}

module.exports = sendTweet;
