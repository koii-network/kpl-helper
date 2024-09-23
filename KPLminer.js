const getTaskData = require("./helpers/getTaskData");
const transferKPL = require("./helpers/transferKPL");

async function main() {
  const listOfKPLs = [
    "us8mD4jGkFWnUuAHB8V5ZcrAosEqi2h1Zcyca68QA1G", // BIRD
    "9UcQaSsBTeXowhMBgSbTEeQubGHxXDNJRjz4s7uxibTP", // BB
    "FJG2aEPtertCXoedgteCCMmgngSZo1Zd715oNBzR7xpR", // FIRE
    "BmdvRw51zhCKfkBmw6jmLawJafimTMtZ2eVwT3fL2WM6", // RATs
  ];
  const taskData = await getTaskData(
    "DLfP5RCAdYiirmn8cigptQusg8ds75JzFXSrHc8ydyeu",
    0
  );
//   console.log(taskData);

  const randomKPL = listOfKPLs[Math.floor(Math.random() * listOfKPLs.length)];

  // Split 500 KPL among all submission addresses
  const totalKPL = 500;
  const addresses = taskData.submissions;
  let kplPerSubmission = totalKPL / addresses.length;

  kplPerSubmission = parseFloat(kplPerSubmission.toFixed(2)); 

  console.log("Random KPL: ", randomKPL);
  console.log("Total KPL: ", totalKPL);
  console.log("KPL per submission: ", kplPerSubmission);
  console.log("Addresses: ", addresses.length);

//   for (let i = 0; i < addresses.length; i++) {
//     const address = addresses[i];
//     submission.kpl = kplPerSubmission;
//     await transferKPL(randomKPL, address, kplPerSubmission);
//   }
}

main();
