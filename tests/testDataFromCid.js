const dataFromCid = require('../helpers/dataFromCid');

async function testDataFromCid() {
  const cid = 'bafybeiasctreqp3a7obt5oh6h3lm4dmh2hdahu5lrnohgd4o4d4tpnsdgm';

  try {
    const data = await dataFromCid(cid);
    console.log('Retrieved data:', data);
  } catch (error) {
    console.error('Error retrieving data:', error);
  }
}

testDataFromCid();