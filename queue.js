const { Queue } = require("async-await-queue");
const sendTweet = require("./api/sendTweet");
const dataFromCid = require("./helpers/dataFromCid");

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

async function queueCID(submissionList) {
  console.log("submissionList,fromquue",submissionList);
  // Helper function to process items in a queue
  async function processInQueue(queue, items, processFunc) {
    let iterationNumber = 0;
    let promises = [];
    /*     console.log(items); */
    for (let item of items) {
      promises.push(
        queue.run(async () => {
          try {
            iterationNumber++;
            console.log(iterationNumber, "out of", items.length, "processing CID:", item);
            return await processFunc(item);
          } catch (e) {
            console.error("Error processing item:", item, "Error:", e);
            return null; // Return null if an error occurs
          }
        })
      );
    }
    return Promise.all(promises);
  }

  console.log("Extracting submission data...");
  if (submissionList && Array.isArray(submissionList)) {
    console.log("Latest round has", submissionList.length, "submissions.");
    // ...
  } else {
    console.error("submissionList is not a valid array:", submissionList);
    return [];
  }
  // console.log("Latest round has", submissionList.length, "submissions.");

  const submissionQ = new Queue(5, 100);

  // Use queue to process each CID submission
  const tweetDataArrays = await processInQueue(
    submissionQ,
    submissionList,
    readSubmission
  );

  // Filter out any null values (from errors) and flatten the list if needed
  const flatTweetList = tweetDataArrays.filter(Boolean).flat();

  console.log(`Data wait to be extracted and POST: ${flatTweetList.length}`);
  console.log("Extracting tweets data");

  // const cidQ = new Queue(40, 30);

  // const tweetList = await processInQueue(cidQ, cidDataRawList, readCID);

  return flatTweetList;
}

async function readSubmission(cid) {
  // console.log(cid);
  let tweetData = await dataFromCid(cid);
  return tweetData;
}

// async function readSubmission(submission) {
//   // console.log(submission);
//   let tweetData = await dataFromCid(submission.cid);
//   console.log(tweetData);
//   return tweetData.data;
// }

module.exports = { queuePost, queueCID };
