const transferKPL = require("./helpers/transferKPL");
const getStakingKey = require("./helpers/getStakingKey");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const mintToken = "us8mD4jGkFWnUuAHB8V5ZcrAosEqi2h1Zcyca68QA1G";
  const targetWalletList = [];

  const stakingList = await getStakingKey(
    "Aqr6jKpv7spkZ8TpLpEsLF5jvjNeHpaHaHPtkt4UTkn6"
  );
  // Populate targetWalletList with the addresses from stakingList
  for (let walletAddress of Object.keys(stakingList)) {
    targetWalletList.push(walletAddress);
  }

  console.log("Target Wallet Length:", targetWalletList.length);

//   for (let i = 0; i < targetWalletList.length; i++) {
//     await transferKPL(mintToken, targetWalletList[i]);
//     await delay(5000); // 5 seconds delay
//   }
}

main();
