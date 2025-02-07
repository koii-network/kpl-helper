const {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    Keypair,
    sendAndConfirmTransaction,
  } = require("@_koii/web3.js");

const transferKOII = async (connection, recipient, amount) => {
  try {
    const SECRET_KEY = JSON.parse(process.env.SECRET_KEY);
    const sender = Keypair.fromSecretKey(new Uint8Array(SECRET_KEY));
    const recipientWallet = new PublicKey(recipient);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: recipientWallet,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
    
    const signature = await connection.sendTransaction(transaction, [sender]);
    await connection.confirmTransaction(signature);
    console.log(`Successfully transferred ${amount} KOII to ${recipient}`);

    return {
      success: true,
      signature,
      message: `Successfully transferred ${amount} KOII`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = transferKOII;
