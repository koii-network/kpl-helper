const { queueCID } = require('../queue');

// const submissionList = [
//     "bafybeibmr2eic42jt6krmgdqhioeeibx263bfe2xkedtkdydcsfuhkqmki",
//     "bafybeic7vdsjmct4dld44smlhujckkdja7hqv4dewzy2a36euecpgfxpf4"
// ]; 

// async function testQueueCID() {
//   try {
//     const tweetList = await queueCID(submissionList);
//     // console.log('Returned tweet list:', tweetList);

//     if (Array.isArray(tweetList) && tweetList.length > 0) {
//       console.log('Test passed: queueCID returns a non-empty array.');
//     } else {
//       console.error('Test failed: queueCID does not return a non-empty array.');
//     }

    
//   } catch (error) {
//     console.error('Test failed with error:', error);
//   }
// }

// module.exports = {
//     submissionList,  
//     testQueueCID 
// };

// testQueueCID();

const batch = [
  "bafybeibmr2eic42jt6krmgdqhioeeibx263bfe2xkedtkdydcsfuhkqmki",
  "bafybeic7vdsjmct4dld44smlhujckkdja7hqv4dewzy2a36euecpgfxpf4"
]; 

// Test function to simulate queueCID usage
async function testQueueCID() {

  const batchNumber = 0;
  const totalBatches = 1;

  try {
      const results = await queueCID(batch, batchNumber, totalBatches);
      console.log('Test results:', results);
  } catch (error) {
      console.error('Test failed:', error);
  }
}

module.exports = {
  batch,
  testQueueCID
}
testQueueCID();