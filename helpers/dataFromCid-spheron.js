//IMPORTS
require("dotenv").config();
const axios = require("axios");
// const { Web3Storage } = require("web3.storage");
const { SpheronClient, ProtocolEnum } = require("@spheron/storage");


const SPHERON_GET_STORAGE_KEYS = [
 "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlLZXkiOiI0NzVhZDFjYjJmNWI3ODkzOTZjZDA2ZTllMWEyYmVmZGNkYjllYmQzODQxOTYwY2RjMjY0NTUxOTdlNTI1NDE2YTUyZTEyNjY5NGU1ZjkwMjIzOWUwNzA2YzUxNDBkMThiYmFlNjBmZDdjZjNjNDdjOTkzM2QwN2Y3YWVhYzY3ZiIsInR5cGUiOjAsImlhdCI6MTcxMzU1MDQ1OSwiaXNzIjoid3d3LnNwaGVyb24ubmV0d29yayJ9.KPCxYa1bgne7JzBl_did5ov39tamxpO4MpMK1XhhrXA",
 "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlLZXkiOiI0NzVhZDFjYjJmNWI3ODkzOTZjZDA2ZTllMWEyYmVmZGNkYjllYmQzODQxOTYwY2RjMjY0NTUxOTdlNTI1NDE2YTUyZTEyNjY5NGU1ZjkwMjIzOWUwNzA2YzUxNDBkMThiYmFlNjBmZDdjZjNjNDdjOTkzM2QwN2Y3YWVhYzY3ZiIsInR5cGUiOjAsImlhdCI6MTcxMzU1MDQ1OSwiaXNzIjoid3d3LnNwaGVyb24ubmV0d29yayJ9.KPCxYa1bgne7JzBl_did5ov39tamxpO4MpMK1XhhrXA" 
 
];

let storageClients = [];

console.log(`SpheronClient: ${SpheronClient}`);
console.log(typeof SpheronClient);

Object.keys(SpheronClient).forEach(key => {
  const token = SpheronClient[key];
  storageClients.push(new SpheronClient({ token }));

});

// SpheronClient.forEach((token, index) => {
//   storageClients.push(new SpheronClient({ token }));
// });

module.exports = async (cid) => {
  // Check if CID is provided
  if (!cid) throw new Error("CID is required");

  // Randomly select a client from the storageClients array
  const selectedClient =
    storageClients[Math.floor(Math.random() * storageClients.length)];

  // Fetch file metadata from the selected Web3 storage
  const res = await selectedClient.get(cid);

  if (!res.ok) return false;

  // Get file info
  const file = await res.files();

  // const url = `https://${file[0].cid}.ipfs.4everland.io/#x-ipfs-companion-no-redirect`;
  const url = `https://${file[0].cid}.${file[0].cid}.ipfs.4everland.io/data.json`;
  console.log(url);

  /* 
  const txtResponse = await axios.get(url_txt);
  const txtContent = txtResponse.data; */

  try {
    // Fetch file content
    const output = await axios.get(url);
    output.data.cid = cid;

    /*     const dataToFetch = `https://${cid}.ipfs.w3s.link/data.txt`; */

    /*     try {
      const response = await axios.get(dataToFetch);
      const content = response.data;
      output.data.pagedata = content;
    } catch (error) {
      console.error("Error fetching content:", error);
    } */

    return output;
  } catch (error) {
    console.error("ERROR", error);
    throw error; // Re-throw error to handle it in a higher-level function if needed
  }
};