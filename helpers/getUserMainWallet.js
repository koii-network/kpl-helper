require('dotenv').config();
const { MongoClient } = require("mongodb");

const uri = process.env.MAIN_DB_KEY;
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function getUserMainWallet(userAddress) {
    await client.connect();
    const dbName = process.env.MAIN_DB_NAME;
    const collectionName = process.env.MAIN_COLLECTION_NAME;
    const collection = client.db(dbName).collection(collectionName);
    const mainWallet = await collection.findOne({ publicKey: userAddress });
    // console.log(mainWallet);
    if (!mainWallet || mainWallet.mainWallet === "") {
        console.log(`Main wallet not found for ${userAddress}`);
        return null;
    } else {
        console.log(`Main wallet found for ${userAddress}`);
        return mainWallet.mainWallet;
    }
}

// getUserMainWallet("AwQj7Y9wCNFxt3PFTuxWcHQfztqb9PsQtbqN8GQwFD9y");
module.exports = getUserMainWallet;