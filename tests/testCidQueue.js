// const dataFromCid = require("../helpers/dataFromCid");
const { Queue } = require("async-await-queue");


let tweetsList = [
    {
        "id": "1781396297876181182",
        "round": 327,
        "data": {
          "user_name": "Solana is ₳ Beach (AMP/ANVIL)",
          "screen_name": "@SolanaIsABeach",
          "user_url": "https://twitter.com/SolanaIsABeach",
          "user_img": "https://pbs.twimg.com/profile_images/1778600570385043457/nry5iLv0_normal.jpg",
          "tweets_id": "1781396297876181182",
          "tweets_content": "This thesis is pretty much what hooked me into the promise of @FlexaHQ and $AMP in Feb 2021",
          "time_post": 1713552948,
          "time_read": 1713940223552,
          "comment": "3",
          "like": "3",
          "share": "45",
          "view": "1 mil",
          "outer_media_url": [
            "/FlexaHQ"
          ],
          "outer_media_short_url": [
            "@FlexaHQ"
          ],
          "keyword": "FlexaHQ"
        },
        "_id": "06XWa1D2pAGTsTeT"
      },
      {
        "id": "1782587870064128373",
        "round": 327,
        "data": {
          "user_name": "Ge₳lousy",
          "screen_name": "@Gealousy",
          "user_url": "https://twitter.com/Gealousy",
          "user_img": "https://pbs.twimg.com/profile_images/1689144150799888384/DNZ9eXCU_normal.jpg",
          "tweets_id": "1782587870064128373",
          "tweets_content": "Nothing like @FlexaHQ . More like a glorified cashapp. $Amp",
          "time_post": 1713837041,
          "time_read": 1713938991074,
          "comment": "4",
          "like": "",
          "share": "3",
          "view": "152",
          "outer_media_url": [
            "/FlexaHQ"
          ],
          "outer_media_short_url": [
            "@FlexaHQ"
          ],
          "keyword": "FlexaHQ"
        },
        "_id": "0fi2LpJS9lTJxj7s"
      },
      {
        "id": "1781437301505048663",
        "round": 327,
        "data": {
          "user_name": "tosiezateguje",
          "screen_name": "@ooo_panie",
          "user_url": "https://twitter.com/ooo_panie",
          "user_img": "https://pbs.twimg.com/profile_images/1500981787216035846/F_ru5gEy_normal.jpg",
          "tweets_id": "1781437301505048663",
          "tweets_content": "I was talking about wallets, SDK, yes its basic stuff.  And if they didin`t deliver it you think that \"Developing a digital payment network that is going to scale up to support trillions of value exchange\" will happen?",
          "time_post": 1713562724,
          "time_read": 1713940009183,
          "comment": "1",
          "like": "",
          "share": "",
          "view": "75",
          "outer_media_url": [
            
          ],
          "outer_media_short_url": [
            
          ],
          "keyword": "FlexaHQ"
        },
        "_id": "0iwNKG9MV8RzZktC"
      },
      {
        "id": "1781406225533391182",
        "round": 327,
        "data": {
          "user_name": "₳MPed2M₳X",
          "screen_name": "@AmpedTo",
          "user_url": "https://twitter.com/AmpedTo",
          "user_img": "https://pbs.twimg.com/profile_images/1568932967615021058/GhOUTZGx_normal.jpg",
          "tweets_id": "1781406225533391182",
          "tweets_content": "You asked about a 3rd party wallet being shipped,  Nighthawk has the SDK for integration, but you'll hate no matter what.",
          "time_post": 1713555315,
          "time_read": 1713940216477,
          "comment": "1",
          "like": "",
          "share": "1",
          "view": "66",
          "outer_media_url": [
            
          ],
          "outer_media_short_url": [
            
          ],
          "keyword": "FlexaHQ"
        },
        "_id": "100uLJr63SNZGTVF"
      },
      {
        "id": "1782865649062076630",
        "round": 327,
        "data": {
          "user_name": "idrrisbb59",
          "screen_name": "@idrisb59",
          "user_url": "https://twitter.com/idrisb59",
          "user_img": "https://pbs.twimg.com/profile_images/1072520082889281538/CIMg_GK1_normal.jpg",
          "tweets_id": "1782865649062076630",
          "tweets_content": "Welcome to $AMP.  is your thinking based on something technical?<br>your first mention of $AMP<br>Mar 12<br>Replying to<br>@Ashcryptoreal<br>$AMP         @flexahq @ampera_xyz  are masters in their game. Don't fade them. okay?",
          "time_post": 1713903269,
          "time_read": 1713938958751,
          "comment": "1",
          "like": "",
          "share": "1",
          "view": "208",
          "outer_media_url": [
            "/Ashcryptoreal",
            "/FlexaHQ",
            "/ampera_xyz"
          ],
          "outer_media_short_url": [
            "@Ashcryptoreal",
            "@flexahq",
            "@ampera_xyz"
          ],
          "keyword": "FlexaHQ"
        },
        "_id": "1hG81xDUqlt5I5ZY"
      },
      {
        "id": "1781439276049174727",
        "round": 327,
        "data": {
          "user_name": "Milan Karna",
          "screen_name": "@Milan_Karna",
          "user_url": "https://twitter.com/Milan_Karna",
          "user_img": "https://pbs.twimg.com/profile_images/1679602763230052355/i9iC5zVd_normal.jpg",
          "tweets_id": "1781439276049174727",
          "tweets_content": "Your handle should be astroturf247",
          "time_post": 1713563195,
          "time_read": 1713940005155,
          "comment": "1",
          "like": "",
          "share": "1",
          "view": "91",
          "outer_media_url": [
            
          ],
          "outer_media_short_url": [
            
          ],
          "keyword": "FlexaHQ"
        },
        "_id": "1roBYeBwMrr7xn3I"
      },
      {
        "id": "1782481436978635111",
        "round": 327,
        "data": {
          "user_name": "tosiezateguje",
          "screen_name": "@ooo_panie",
          "user_url": "https://twitter.com/ooo_panie",
          "user_img": "https://pbs.twimg.com/profile_images/1500981787216035846/F_ru5gEy_normal.jpg",
          "tweets_id": "1782481436978635111",
          "tweets_content": "Pool says that",
          "time_post": 1713811666,
          "time_read": 1713939169324,
          "comment": "1",
          "like": "",
          "share": "",
          "view": "44",
          "outer_media_url": [
            
          ],
          "outer_media_short_url": [
            
          ],
          "keyword": "FlexaHQ"
        },
        "_id": "20SEgSom2FxP6kiZ"
      }
];

async function processTweets(tweetsList) {
    // Create a queue with a concurrency of 10
    const dataQ = new Queue(10, 1);
    // Create an array to store promises
    let results = [];

    console.log("Processing tweets. Total:", tweetsList.length);

  
    for (let tweet of tweetsList) {
      // Add tasks to the queue and store the promises
      results.push(
        dataQ.run(async () => tweet.data)
      );
    }
  
    // Wait for all promises to resolve
    const processedData = await Promise.all(results);

    console.log("All tweets processed.");

  
    return processedData;
  }
  

  processTweets(tweetsList).then(processedData => {
    console.log("Processed Data:", processedData);
}).catch(error => {
    console.error("Error processing tweets:", error);
});
