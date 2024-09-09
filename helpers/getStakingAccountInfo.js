const { Connection, PublicKey } = require("@_koii/web3.js");

async function getStakingAccountInfo(stakingKey) {
    const connection = new Connection("https://testnet.koii.network");
    const publicKey = new PublicKey(stakingKey);


    // Fetching transaction signatures for the given public key
    const response = await connection.getConfirmedSignaturesForAddress2(
        publicKey,
        {
            limit: 1,  // Only fetch the most recent transaction
            commitment: "confirmed"
        }
    );

    if (response && response.length > 0) {
        // Use the first transaction signature to get transaction details
        const transaction = await connection.getConfirmedTransaction(response[0].signature, "confirmed");
        
        if (transaction && transaction.transaction) {
            // console.log(transaction.transaction.signatures[0].publicKey.toString());
            return transaction.transaction.signatures[0].publicKey.toString();
        }else{
            return null;
        }
    } else {
        console.log(`No transactions found for ${stakingKey}`);
    }
}

module.exports = getStakingAccountInfo;