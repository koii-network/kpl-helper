const saveTweetsToMongoDB = require('../api/saveTweetsToMongoDB');
const { queueCID } = require('../queue');
const { batch } = require('../tests/testQueueCid');

async function testSaveTweets() {
  try {
    console.log('batch List from savetweet.js:', batch);

    const tweetList = await queueCID(batch);
    console.log('Retrieved tweet list:', tweetList);

    await saveTweetsToMongoDB(tweetList);
    console.log('Tweets saved to MongoDB.');
  } catch (error) {
    console.error('Error:', error);
  }
}

testSaveTweets();