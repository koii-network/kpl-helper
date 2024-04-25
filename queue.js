const { Queue } = require("async-await-queue");
const sendTweet = require("./api/sendTweet");
const dataFromCid = require("./helpers/dataFromCid");

// const BATCH_SIZE = 10;


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
  await Promise.all(count);
  return true;
}


async function queueCID(batch, batchNumber, totalBatches) {
  if (!batch || !Array.isArray(batch)) {
      console.error("Invalid batch data provided:", batch);
      return [];
  }

  const submissionQ = new Queue(5, 100);
  console.log(`Last round has ${totalBatches} submisssion`);
  console.log(`Processing batch ${batchNumber + 1} of ${totalBatches} with ${batch.length} submissions.`);
  const results = await processInQueue(submissionQ, batch, readSubmission, batchNumber, batch.length, totalBatches);
  return results.flat().filter(Boolean); ; // Filter out null values due to errors
}


// Helper function to process items in a queue with additional context for logging
async function processInQueue(queue, items, processFunc, batchNumber, totalItemsInBatch, totalBatches) {
  return Promise.all(items.map((item, index) => queue.run(async () => {
      const orderNumber = batchNumber * totalItemsInBatch + index + 1;
      console.log(`${orderNumber} out of total ${totalBatches * totalItemsInBatch} in batch No. ${batchNumber + 1} processing CID: ${item}`);
      try {
          const data = await processFunc(item);
          console.log(`Successfully processed CID: ${item}`);
          return data;
      } catch (e) {
          console.error(`Error processing CID ${item}: ${e}`);
          return null;
      }
  })));
}


async function readSubmission(cid) {
  console.log(`Starting to fetch data from CID: ${cid}`);
  try {
    let tweetData = await dataFromCid(cid);
    console.log(`Data fetched successfully`);
    return tweetData;
  } catch (e) {
    console.error(`Failed to fetch data`);
    return null;
  }
}


// async function readSubmission(submission) {
//   // console.log(submission);
//   let tweetData = await dataFromCid(submission.cid);
//   console.log(tweetData);
//   return tweetData.data;
// }

module.exports = { queuePost, queueCID };
