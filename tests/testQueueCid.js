const { queueCID } = require('../queue');


async function testQueueCID() {
  const submissionList = [
      "bafybeihbyadzr3bth45xu4r3i4ivrax3lp3v5d2adkwrnsnld2fmf4jmri",
      "bafybeiccwiwkkbj7vxonpj4ahphoaipn22ohe3vqe2qhe7t7uhtlzz2gbe",
      "bafybeiglpjh7ks42hxrqwkhlc52mriruvdu5tnwoezdsvken6izulcwbka",
      "bafybeihxpjh5s6jkya6hqkreqvnqe44pzsujhohjqlo3pyerzsrrsua7o4"
  ]; 

  try {
      const tweetData = await queueCID(submissionList);
      console.log('Test tweetData:', tweetData);
      console.log("length", tweetData.length);

  } catch (error) {
      console.error('Test Failed:', error);
  }
}


testQueueCID();
