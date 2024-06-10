const axios = require('axios');
const getDataFromWeb3Storage = require('../helpers/dataFromCid-web3');

// fetch data from a given URL
async function fetchData(url) {
  try {
    const response = await axios.get(url, {
      timeout: 530000 
    });       if (response.status === 200 || response.status === 304) {
      return response.data.map(item => item.data); 
    } else {
      console.log(`Received status ${response.status} for URL ${url}`);
    }
  } catch (error) {
    // console.log(`Failed for URL ${url}: ${error.message}`);
  }
  return null;
}

// Main function to fetch data based on CID and filename
module.exports = async (cid, fileName, maxRetries = 2, retryDelay = 3000) => {
  const urls = [
    `https://cloudflare-ipfs.com/ipfs/${cid}/${fileName}`,
    `https://${cid}.ipfs.sphn.link/${fileName}`,
    `https://${cid}.ipfs.w3s.link/${fileName}`,
    `https://${cid}.ipfs.dweb.link/${fileName}`,
    `https://ipfs.io/ipfs/${cid}/${fileName}`,
  ];

  let attempts = 0;
  while (attempts < maxRetries) {
    let promises = urls.map(url => fetchData(url));
    let result = await Promise.race(promises.filter(p => p !== null));
    if (result) return result;
    attempts++;
    // console.log(`Attempt ${attempts}: Retrying after ${retryDelay / 1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }

  return null

  /* 
  //If all retries fail, not sure the file name, try getting data from the backup function
  console.log("All attempts failed, trying backup method...");
  return await getDataFromWeb3Storage(cid, fileName) || null; */
};
