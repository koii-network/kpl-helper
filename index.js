const getSubmissionList = require("./helpers/getSubmissionList");
const { queuePost, queueCID } = require("./queue");
require("dotenv").config();
let round = 0;

async function main() {
  // Get submission list from task state
  const submissionList = await getSubmissionList();

  if (round < submissionList[1]) {
    round = submissionList[1];
    // Extract tweets from IPFS
    const tweetList = await queueCID(submissionList[0]);

    console.log(tweetList);

    console.log(tweetList.length);

    //Before posting, clean data

    // POST data to server
    let i = 0;
    let result = await queuePost(tweetList, i);
    console.log(result); // should return true
    console.log("ALL IS DONE");
    main();
  } else {
    console.log("No new round... Checking again in 10 Minutes");
    setTimeout(main, 600000);
  }
}

main();
