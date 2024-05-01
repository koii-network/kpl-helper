const dataFromCid = require("../helpers/dataFromCid");
const { queuePost } = require("../queue");

async function main() {
  let tweetList = [];

  // Create an empty list to store the extracted tweets
  let data = {
    id: "https://twitter.com/rilbin_phegis/status/1688688400319074305",
    round: 156,
    cid: "bafybeicxfoyxhrydokjp4vpr5led4gy7yfvxchm4qi3ijgqbsvujlvnsgq",
    _id: "3SX4HaXHEyCU08Ar",
  };

  // Iterate through the submission list and extract the data

  let tweetDataRaw = await dataFromCid(data.cid);
  tweetList.push(tweetDataRaw.data);

  tweetList = tweetList.flat();
  // console.log(tweetList);
  let i = 0;
  // POST data to server
  let result = await queuePost(tweetList, i);
  console.log(result);
}

main();
