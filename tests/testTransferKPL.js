const { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } = require('@solana/spl-token');

async function transferKPL() {
    // Connect to cluster
    const connection = new Connection("https://testnet.koii.network", 'confirmed');

    // Generate a new wallet keypair and airdrop SOL
    const fromWallet = Keypair.fromSecretKey(new Uint8Array([89,180,83,123,109,152,95,35,191,113,240,237,32,235,71,190,31,209,172,124,7,171,141,66,241,110,173,36,209,2,99,139,219,165,158,9,212,226,167,98,140,242,193,62,137,195,114,131,47,50,38,242,70,90,136,46,112,98,197,110,161,78,198,242])); // Replace with your own secret key
    
    console.log(fromWallet.publicKey.toBase58());

    // Generate a new wallet to receive newly minted token
    const toWallet = new PublicKey('H2j8Cz7zKCeuDTs73vtjDtBmtytQX1JyaQqvYwwQWE6p'); // Replace with target wallet address

    // Create new token mint
    const mint = new PublicKey('us8mD4jGkFWnUuAHB8V5ZcrAosEqi2h1Zcyca68QA1G'); // Replace with your own token mint address

    // Get the token account of the fromWallet address, and if it does not exist, create it
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    );

    // Get the token account of the toWallet address, and if it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet);

    // Mint 1 new token to the "fromTokenAccount" account we just created

    const transferAmount = 50;


    // Transfer the new token to the "toTokenAccount" we just created
    signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        transferAmount * 1000000000
    );
    console.log(signature);
};

transferKPL();

// export default transferKPL;