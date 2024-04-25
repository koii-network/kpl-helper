const saveTweetsToMongoDB = require('../api/saveTweetsToMongoDB');
const { queueCID } = require('../queue');
const { submissionList } = require('../tests/testQueueCid');

async function testSaveTweets() {
  try {
    console.log('Submission Listfrommogotest:', submissionList);

    const tweetList = await queueCID(submissionList);
    console.log('Retrieved tweet list:', tweetList);

    await saveTweetsToMongoDB(tweetList);
    console.log('Tweets saved to MongoDB.');
  } catch (error) {
    console.error('Error:', error);
  }
}

testSaveTweets();