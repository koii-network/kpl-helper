# KPL Token Transfer Script

This project handles automated KPL (Koii Payment Layer) token transfers between wallets. It connects to a MongoDB database to track transfers and uses a cron scheduler for periodic execution.

## Prerequisites

Before running the script, ensure you have the following:

1. **Node.js**: Make sure Node.js is installed. You can download it from [here](https://nodejs.org/).
2. **MongoDB**: Ensure you have access to a MongoDB instance, either locally or using a cloud provider like MongoDB Atlas.
3. **Solana Web3.js**: This project interacts with the Solana blockchain, so you will need an active Solana testnet or mainnet endpoint.

### Required Environment Variables

In the `.env` file, set the following:

- `SECRET_KEY`: Your private key for the Solana wallet, in JSON format.
- `DB_KEY`: MongoDB connection string for your database.

Example `.env`:

```bash
SECRET_KEY=[1,2,3,4,...]  # Replace with your actual secret key
DB_KEY=mongodb+srv://<user>:<password>@cluster0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Add your `.env` file with the required environment variables.

## Functionality

### Main Components

- **transferKPL**: Transfers a specified amount of KPL tokens from a source wallet to a target wallet.
- **MongoDB Integration**:
  - Stores records of token transfers.
  - Checks if a wallet already received a token to avoid duplicate transfers.
- **Scheduling**: The script uses `node-cron` to schedule transfers at specific times.
  
### Core Functions

- `transferKPL(mintToken, targetWallet, amount)`: Handles the token transfer process for a specific `mintToken` and `targetWallet`.
  
- `getStakingKey(stakingID)`: Retrieves staking-related information by a task ID.

- `getStakingAccountInfo(walletAddress)`: Returns account info for a specific staking account.

- `checkExistingTransfer(mintToken, targetWallet, client)`: Checks if a transfer has already been made to avoid duplicates.

- `insertTransferRecord(mintToken, targetWallet, amount, client)`: Inserts the transfer details into the MongoDB collection.

- `timeUntilNextJob(hour, minute)`: Logs how long until the next cron job is scheduled to run.

### MongoDB Database Structure

The MongoDB collection `userKPLtransfer` stores the transfer records with the following structure:

```json
{
  "targetWallet": "<wallet_address>",
  "mintToken": {
    "<mint_token>": <amount>
  },
  "timestamp": "<timestamp>"
}
```

## Running the Script

1. **Manual Run**:
   
   Run the script manually with:

   ```bash
   node <script.js>
   ```

2. **Automated Job**:

   The script uses `node-cron` to schedule token transfers. Example cron job running at 8 PM daily:

   ```js
   cron.schedule("0 20 * * *", async () => {
     main();
   });
   ```

To calculate the time until the next scheduled job, use:

```js
timeUntilNextJob(20, 0);  // Example: next job at 8 PM
```

## Notes

- **Retry Logic**: The transfer function includes retry logic that attempts to transfer tokens up to three times if an error occurs.
- **Delay**: The script includes a 200 ms delay between consecutive transfers to avoid hitting rate limits.

## License

This project is licensed under the MIT License.
