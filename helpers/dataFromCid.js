const axios = require("axios");
const { KoiiStorageClient } = require("@_koii/storage-task-sdk");
const storageClient = new KoiiStorageClient(undefined, undefined, false);

async function fetchCidFromGetFile(cid, fileName) {
  try {
    const blob = await storageClient.getFile(cid, fileName);
    console.log(blob);
    const text = await blob.text(); // Convert Blob to text
    const data = JSON.parse(text); // Parse text to JSON
    // console.log(data);
    return data;
  } catch (error) {
    console.log(`Failed for CID ${cid}: ${error.message}`);
    return null;
  }
}

async function directFetchCid(cid, fileName) {
  try {
    const response = await axios.get(
      `https://ipfs-gateway.koii.live/ipfs/${cid}/${fileName}`,
      {
        timeout: 530000,
      }
    );
    if (response.status === 200 || response.status === 304) {
      console.log();
      return response.data.map((item) => item.data);
    } else {
      console.log(`Received status ${response.status} for URL ${url}`);
    }
  } catch (error) {
    console.log(`Failed for CID ${cid}: ${error.message}`);
  }
  return null;
}

module.exports = async (cid, fileName, maxRetries = 2, retryDelay = 3000) => {
  // Get data from IPFS through Koii Storage getCID function
  const data = await fetchCidFromGetFile(cid, fileName);
  if (data) {
    return data;
  }

  // Get data from IPFS through our direct fetch from IPFS Gateway [Not Recommended]
  const dataDirect = await directFetchCid(cid, fileName);
  if (dataDirect) {
    return dataDirect;
  }
};
