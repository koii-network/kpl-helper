const dataFromCid = require('../helpers/dataFromCid');

async function testDataFromCid() {
  const cid = 'bafybeieuhjtch4diltzkh3twb2xxj55nnegumkxzbqxced6r6rz6xlmdlm';
  const fileName = 'dataList.json';
  try {
    const data = await dataFromCid(cid, fileName);
    console.log('Retrieved data:', data);
  } catch (error) {
    console.error('Error retrieving data:', error);
  }
}

testDataFromCid();