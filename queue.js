const { Queue } = require("async-await-queue");
const sendTweet = require("./api/sendTweet");
const dataFromCid = require("./helpers/dataFromCid");
const saveTweetsToMongoDB = require("./api/saveTweetsToMongoDB");

const BATCH_SIZE = 10;


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

//Read data from CID queue and process it
async function queueCID(submissionList,batchSize = BATCH_SIZE) {
  // console.log("submissionList",submissionList);
  
  // Helper function to process items in a queue
  async function processInQueue(queue, items, processFunc,totalItems) {
    let iterationNumber = 0;
    let promises = [];
    for (let item of items) {
      promises.push(
        queue.run(async () => {
          try {
            iterationNumber++;
            console.log(`${totalProcessedItems + iterationNumber} out of ${totalItems}`);
            const result = await processFunc(item);
            if (result === null) {
              // console.error(`Processing failed for item with CID: ${item}`);
            }
            return result;
          } catch (e) {
            console.error("Error processing item:", item, "Error:", e);
            return null; 
          }
        })
      );
    }
    return Promise.all(promises);
  }

  console.log("Extracting submission data...");
  if (submissionList && Array.isArray(submissionList)) {
    console.log("Latest round has", submissionList.length, "submissions.");
  } else {
    console.error("submissionList is not a valid array:", submissionList);
    return [];
  }

  const submissionQ = new Queue(5, 100);
  const results = [];
  let totalProcessedItems = 0;


  while (totalProcessedItems < submissionList.length) {
    const remainingItems = submissionList.slice(totalProcessedItems, totalProcessedItems + batchSize);
    const batchResults = await processInQueue(submissionQ, remainingItems, readSubmission, submissionList.length);
    const filteredResults = batchResults.filter(Boolean).flat();

    await saveTweetsToMongoDB(filteredResults);

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
  const fileName = 'dataList.json'
  let tweetData = await dataFromCid(cid,fileName);
  // console.log('Data for CID:', cid, tweetData); 
  return tweetData;
}


module.exports = {
  queuePost,
  queueCID
};