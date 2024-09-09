const {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} = require("@solana/web3.js");
const {
  getOrCreateAssociatedTokenAccount,
  transfer,
} = require("@solana/spl-token");
require("dotenv").config({ path: "../.env" });

async function transferKPL(mintToken, targetWallet, amount) {
  // Connect to cluster
  const SECRET_KEY = JSON.parse(process.env.SECRET_KEY);
  const connection = new Connection(
    "https://testnet.koii.network",
    "confirmed"
  );

  // Generate a new wallet keypair and airdrop SOL
  const fromWallet = Keypair.fromSecretKey(new Uint8Array(SECRET_KEY)); // Replace with your own secret key

  const mint = new PublicKey(mintToken); // Replace with your own token mint address

  console.log(
    `Transfer ${mintToken} from wallet ${fromWallet.publicKey.toBase58()}`
  );

  // Generate a new wallet to receive newly minted token
  const toWallet = new PublicKey(targetWallet); // Replace with target wallet address

  // Create new token mint

  // Get the token account of the fromWallet address, and if it does not exist, create it
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    mint,
    fromWallet.publicKey
  );

  // Get the token account of the toWallet address, and if it does not exist, create it
  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    mint,
    toWallet
  );

  // Mint 1 new token to the "fromTokenAccount" account we just created

  const transferAmount = amount;

  // Transfer the new token to the "toTokenAccount" we just created
  signature = await transfer(
    connection,
    fromWallet,
    fromTokenAccount.address,
    toTokenAccount.address,
    fromWallet.publicKey,
    transferAmount * LAMPORTS_PER_SOL
  );
  console.log(signature);
}

// transferKPL();

module.exports = transferKPL;
