const { Queue } = require("async-await-queue");
const sendTweet = require("./api/sendTweet");
const dataFromCid = require("./helpers/dataFromCid");
const saveTweetsToMongoDB = require("./api/saveTweetsToMongoDB");
require("dotenv").config();

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 10) || 10; // Default to 10 if not set

async function queuePost(tweetList, i) {
  // Create a queue with a concurrency of 5
  const postQ = new Queue(5, 100);
  let count = [];

  // Set to keep track of sent tweet URLs
  let sentTweetUrls = new Set();

  // Iterate through the tweetList and send each tweet
  for (let tweet of tweetList) {
    if (sentTweetUrls.has(tweet.url)) {
      // This tweet is a duplicate, skip it
      console.log("Duplicate tweet detected, skipping.");
      continue;
    }

    // Process each tweet with controlled concurrency  
    count.push(
      postQ.run(() =>
        sendTweet(tweet, i++).catch((e) => {
          console.error(e);
          // If sending fails, remove from the sent tweets set so it can be retried later
          sentTweetUrls.delete(tweet.url);
        })
      )
    );

    // Add the tweet's URL to the sent tweets set
    sentTweetUrls.add(tweet.url);
  }

  // Wait for all tweet postings to finish
  await Promise.all(count);
  return true;
}

//process submissions from CID in batches
async function queueCID(submissionList,batchSize = BATCH_SIZE) {
  console.log("Extracting submission data...");
  if (submissionList && Array.isArray(submissionList)) {
    console.log("Latest round has", submissionList.length, "submissions.");
  } else {
    console.error("Invalid submission list provided:", submissionList);
    return [];
  }

  // Helper function to process items in a queue
  async function processInQueue(queue, items, processFunc,totalItems) {
    let iterationNumber = 0;
    let promises = [];
    
    // Iterate over each item in the provided list
    for (let item of items) {
      // Add to the queue the processing of each item wrapped in an async function
      promises.push(
        queue.run(async () => {
          try {
            iterationNumber++;
            console.log(`${totalProcessedItems + iterationNumber} out of ${totalItems}`);
            const result = await processFunc(item);
            if (result === null) {
              console.error(`Processing failed for item with CID: ${item}`);
            }
            return result;
          } catch (e) {
            console.error("Error processing item:", item, "Error:", e);
            return null; 
          }
        })
      );
    }
    // Wait for all promises to resolve and return the results
    return Promise.all(promises);
  }



  const submissionQ = new Queue(1, 2000);
  const results = [];
  let totalProcessedItems = 0;


  while (totalProcessedItems < submissionList.length) {
    const remainingItems = submissionList.slice(totalProcessedItems, totalProcessedItems + batchSize);
    const batchResults = await processInQueue(submissionQ, remainingItems, readSubmission, submissionList.length);
    const filteredResults = batchResults.filter(Boolean).flat();

    results.push(...filteredResults);
    totalProcessedItems += remainingItems.length;
    console.log("Total items processed:", totalProcessedItems, "out of", submissionList.length);
  }

  console.log(`Total tweets extracted and saved: ${results.length}`);
  console.log("Extracting tweets data");

  return results;

}

//Read Twitter data based on CID
async function readSubmission(cid) {
  try {
    const fileName = 'dataList.json'
    let tweetData = await dataFromCid(cid,fileName);
        await saveTweetsToMongoDB(tweetData);
    return tweetData;
  } catch (e) {
    console.error("Error processing CID:", cid, "Error:", e);
    return null;
  }
}


module.exports = {
  queuePost,
  queueCID
};