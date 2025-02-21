const { Connection, PublicKey } = require("@_koii/web3.js");
const transferKOII = require("./helpers/transferKOII");
const fs = require('fs').promises;
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.DB_KEY;
const DB_name = "mainnet_airdrop_middleman";
const collection_name = "247builderAirdrop";
const ANALYSIS_FILE = 'pr-analysis-2025-02-21T20-38-59-441Z.json';

// Create a single MongoDB client instance
let mongoClient = null;

async function connectToMongo() {
    if (!mongoClient) {
        mongoClient = new MongoClient(process.env.DB_KEY);
        await mongoClient.connect();
    }
    return mongoClient;
}

async function hasRoundTransferred(address) {
    try {
        const client = await connectToMongo();
        const db = client.db(DB_name);
        const collection = db.collection(collection_name);
        
        const result = await collection.findOne({ 
            stakingAddress: address 
        });
        return !!result;
    } catch (error) {
        console.error('Error checking round transfer:', error);
        return false;
    }
}

async function recordTransfer(stakingKey, pubKey, amount, signature) {
    try {
        const client = await connectToMongo();
        const db = client.db(DB_name);
        const collection = db.collection(collection_name);

        await collection.insertOne({
            stakingAddress: stakingKey,
            walletAddress: pubKey,
            amount: amount,
            signature: signature,
            timestamp: new Date(),
            type: '247builderAirdrop'
        });
    } catch (error) {
        console.error("Error recording transfer:", error);
    }
}

async function getPRRewardData() {
    try {
        const data = await fs.readFile(ANALYSIS_FILE, 'utf8');
        const analysisData = JSON.parse(data);
        
        // Filter only users with valid pubKeys, regardless of qualification
        const validUsers = analysisData.users.filter(user => 
            user.pubKey !== 'Not Found' && 
            user.pubKey !== 'Error'
        );

        console.log('\nReward Summary:');
        console.log('Total users with valid pubKeys:', validUsers.length);
        console.log('Total KOII to distribute:', validUsers.reduce((sum, user) => sum + user.koiiReward, 0));

        return validUsers.map(user => ({
            username: user.originalUsername,
            stakingKey: user.stakingKey,
            pubKey: user.pubKey,
            amount: user.koiiReward,
            prs: user.totalPRs,
            isQualified: user.isQualified
        }));
    } catch (error) {
        console.error('Error reading PR reward data:', error);
        return [];
    }
}

async function main() {
    try {
        const connection = new Connection("https://mainnet.koii.network");
        
        const rewardData = await getPRRewardData();
        if (rewardData.length === 0) {
            console.log('No users with valid pubKeys found');
            return;
        }

        console.log(`\nStarting KOII transfers for ${rewardData.length} users...`);

        // Process transfers in batches
        const batchSize = 10;
        for (let i = 0; i < rewardData.length; i += batchSize) {
            const batch = rewardData.slice(i, i + batchSize);
            console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(rewardData.length/batchSize)}`);
            
            const transferPromises = batch.map(async (user) => {
                try {
                    const checkTransferred = await hasRoundTransferred(user.stakingKey);
                    if (checkTransferred) {
                        console.log(`Already sent KOII to ${user.username} (${user.pubKey})`);
                        return null;
                    }

                    console.log(`Processing: ${user.username} (${user.prs} PRs)`);
                    console.log(`PubKey: ${user.pubKey}`);
                    console.log(`Amount: ${user.amount} KOII`);
                    
                    const transferResult = await transferKOII(
                        connection,
                        user.pubKey,
                        user.amount
                    );

                    if (transferResult && transferResult.success) {
                        console.log(`✓ Transfer successful`);
                        await recordTransfer(
                            user.stakingKey,
                            user.pubKey,
                            user.amount,
                            transferResult.signature
                        );
                        return transferResult;
                    }
                    console.log(`✗ Transfer failed`);
                    return null;
                } catch (error) {
                    console.error(`Error processing ${user.username}:`, error);
                    return null;
                }
            });

            await Promise.all(transferPromises);
            console.log(`Completed batch of ${batch.length} transfers`);
            
            // Delay between batches
            if (i + batchSize < rewardData.length) {
                console.log('Waiting 1 second before next batch...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    } catch (error) {
        console.error("Error in main function:", error);
    } finally {
        if (mongoClient) {
            await mongoClient.close();
            console.log('\nMongoDB connection closed');
        }
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down...');
    if (mongoClient) {
        await mongoClient.close();
    }
    process.exit(0);
});

main(); 