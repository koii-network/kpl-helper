const dataFromCid = require('../helpers/dataFromCid');

async function testDataFromCid() {
  const cid = 'bafybeibmr2eic42jt6krmgdqhioeeibx263bfe2xkedtkdydcsfuhkqmki';

  try {
    const data = await dataFromCid(cid);
    console.log('Retrieved data:', data);
  } catch (error) {
    console.error('Error retrieving data:', error);
  }
}

testDataFromCid();