const { queueCID } = require('../queue');

const submissionList = [
    "bafybeibmr2eic42jt6krmgdqhioeeibx263bfe2xkedtkdydcsfuhkqmki"
]; 

async function testQueueCID() {
  try {
    const tweetList = await queueCID(submissionList);
    console.log('Returned tweet list:', tweetList);

    if (Array.isArray(tweetList) && tweetList.length > 0) {
      console.log('Test passed: queueCID returns a non-empty array.');
    } else {
      console.error('Test failed: queueCID does not return a non-empty array.');
    }

    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

module.exports = {
    submissionList,  
    testQueueCID 
};

testQueueCID();
