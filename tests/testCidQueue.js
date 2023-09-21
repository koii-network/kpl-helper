const dataFromCid = require("../helpers/dataFromCid");
const { Queue } = require("async-await-queue");

let cidDataRawList = [
  {
    id: "https://twitter.com/maarrgg/status/1688522337837023232",
    round: 157,
    cid: "bafybeid6kdh2ircgrbska3rl3kzk2cn6m46q4rsdmjnkdn5j36wuj6dkzm",
    _id: "JUwtPRHKf8EBRje2",
  },
  {
    id: "https://twitter.com/Aonmini_1998/status/1688522378173669376",
    round: 157,
    cid: "bafybeihyckxrlgljhlkskbqukck6n33vkp6ieqdo6ytnq6jjr64z5nczpy",
    _id: "K5TcO0qTzaLbWaqm",
  },
  {
    id: "https://twitter.com/pond0xevent/status/1688662652375994368",
    round: 157,
    cid: "bafybeidizt4ivgmgqyb2eqyudssk4nes6s7p7rhj6eeruqpmbsvv6rdm4q",
    _id: "KCAxol3vKGm34ZFX",
  },
  {
    id: "https://twitter.com/MaridelsaA/status/1683294800873947138",
    round: 157,
    cid: "bafybeie3wl47vyniaekwcrxmqy5htzjva4dsdtjeo5bsmngeultd2api3a",
    _id: "KHcxj4I58uOl4C2L",
  },
  {
    id: "https://twitter.com/MaridelsaA/status/1683294800873947138",
    round: 157,
    cid: "bafybeie3wl47vyniaekwcrxmqy5htzjva4dsdtjeo5bsmngeultd2api3a",
    _id: "KJPd2PswGsP61xcf",
  },
  {
    id: "https://twitter.com/dizzzy_eth/status/1688625311066247168",
    round: 157,
    cid: "bafybeidcbv2s5kafixnlsusbig6cazfhjk5auvbpyrdmpymad32uoo7uta",
    _id: "KQKcRVxdsHn6nzZF",
  },
  {
    id: "https://twitter.com/WiradinataYudha/status/1688522421790457856",
    round: 157,
    cid: "bafybeid4nagi4y5wghnqol7pxjdrzgqmayfpvvhir7cjrgyi5xkvog2p44",
    _id: "LMRNOCcBbH8quzWh",
  },
  {
    id: "https://twitter.com/GlobalTradeFin/status/1688556757264547840",
    round: 157,
    cid: "bafybeiahcsfolxazowuyuebdrxen2a64mx44csqlronegldcdsy5zu4zzu",
    _id: "LdI8Bpdpga1csUR2",
  },
  {
    id: "https://twitter.com/ivyluvxo/status/1688339992014450688",
    round: 157,
    cid: "bafybeidl7p4quiuokpsinuiykicqbz4gk2qvlnqkb5xbuo4l6nizass2a4",
    _id: "LgP5dFmlGf441PaI",
  },
  {
    id: "https://twitter.com/KasahunYal16375/status/1688607794541252608",
    round: 157,
    cid: "bafybeiayv3ou5hhllf6mcalnxrg5uz74i3747svfn2he3e4dyzlycyer44",
    _id: "Li4AuyiNRueXrkDH",
  },
  {
    id: "https://twitter.com/ava_blonde/status/1688613007427780608",
    round: 157,
    cid: "bafybeibbmpau6uriimh2mggrfkpmezhfq2khxjzhtrdvkzadxiowmvolxu",
    _id: "LwW0GCufEqGruf7D",
  },
  {
    id: "https://twitter.com/kensiebb/status/1688615429223362561",
    round: 157,
    cid: "bafybeih73z7l63oypzs4ikzoba6eaqridtukphswe47k3fx7nht55kxpv4",
    _id: "MC8Qqxh1Y5BU9XnZ",
  },
  {
    id: "https://twitter.com/ZeroIsNowHere/status/1688366774104752128",
    round: 157,
    cid: "bafybeifs4tfavvvhskyfr4xntahxmuvw4jazz2erywdljwjczrf5mvm63y",
    _id: "NAS8xcSFu9n1m3Ec",
  },
  {
    id: "https://twitter.com/dizzzy_eth/status/1688555157628325888",
    round: 157,
    cid: "bafybeic2vyespx6arekhhfiefvdwa5w3mnbkskxm4dpwlb3zlhgsheumwm",
    _id: "Ob40lFilagm0J4Na",
  },
  {
    id: "https://twitter.com/dizzzy_eth/status/1688607023816945664",
    round: 157,
    cid: "bafybeifvn7ygv7vcgdhqvrmuoseu3zvpiwboih5nxgtgrmsytchtvupncu",
    _id: "OsdUVuHtQJdcZwI8",
  },
  {
    id: "https://twitter.com/lemoncrha5gn_1/status/1688522356535234560",
    round: 157,
    cid: "bafybeibe6dsoijdjk7nccw4iblyjmnqnjemvpxoyl6hdwdh7lwrwwstjtm",
    _id: "P1su7k6Km2Ww06XZ",
  },
  {
    id: "https://twitter.com/maddieallen69/status/1688641254597312512",
    round: 157,
    cid: "bafybeie2pkedtj7d4afws5itsyusonufgjmm3pjwlxj4gkrdmluajrh6lu",
    _id: "P7S3hVAu7P7GtwYN",
  },
  {
    id: "https://twitter.com/Taniaak65370929/status/1688575995325108224",
    round: 157,
    cid: "bafybeic3ii5rwbbfldo4tueoq325l4doqvlh4mvkpw6osot5z734qrxq7u",
    _id: "PLLqu6FBilNKyKEO",
  },
  {
    id: "https://twitter.com/dizzzy_eth/status/1688658113933578241",
    round: 157,
    cid: "bafybeigcbslxqlh2dq5d3sllpej6exwu4yknc5k46regmwcagya26g5sge",
    _id: "PUc4Ha6aM3KjJtPA",
  },
  {
    id: "https://twitter.com/Mashsteruk/status/1688556465437777921",
    round: 157,
    cid: "bafybeieyvkwvhumj7rexh6ewpo7gu6dx4qqjt4b3ujcbff3e2htbezv75u",
    _id: "Pn8T1PrmZIkgTwcz",
  },
  {
    id: "https://twitter.com/dizzzy_eth/status/1688660629924499456",
    round: 157,
    cid: "bafybeieb5yesj6exdmfhbd4jpxyndux3oarhynwkynpanwslabpx72sfxe",
    _id: "PubNjAuVHfFfmq1H",
  },
  {
    id: "https://twitter.com/WiradinataYudha/status/1688522421790457856",
    round: 157,
    cid: "bafybeidfcwsot23truau5jzuewtx3apygeo4xqx4tnzjn27yi5d4tlmmhq",
    _id: "Q7EVSgzuqRqBFkuQ",
  },
  {
    id: "https://twitter.com/maarrgg/status/1688522337837023232",
    round: 157,
    cid: "bafybeicg4v6iug2f6uztucfwkjtu5zfb6ea6hv72nka4ieavmegwsos3xq",
    _id: "QOEBfceswvTHJQUN",
  },
  {
    id: "https://twitter.com/dizzzy_eth/status/1688555157628325888",
    round: 157,
    cid: "bafybeiddwwv3tgeuq3dn3nyjskfvzlaqn6uflerlpnlecifdnm2lcqj55i",
    _id: "RCEAzgC09nBxr1yr",
  },
  {
    id: "https://twitter.com/pepemar98431626/status/1688518546496565248",
    round: 157,
    cid: "bafybeiezbagfrotoqo2hqperucnjb5ufomzv2pjafuaokfjxneal3c7w5e",
    _id: "RED1Bse0uj9uYJIT",
  },
  {
    id: "https://twitter.com/Tompokhakim/status/1688522376093577216",
    round: 157,
    cid: "bafybeiduqt23wudvvb3xs7spa3rmodut2tdcalnc3xcew5zs4movqimqy4",
    _id: "RQXoVyX82vGzUZA5",
  },
  {
    id: "https://twitter.com/dizzzy_eth/status/1688625311066247168",
    round: 157,
    cid: "bafybeihtmaaeqeyf7qnhswfjmzo755jwin7juqifkxzhakd35g3g6dqusq",
    _id: "RTjX9TH3gTAFsb9b",
  },
  {
    id: "https://twitter.com/ksyushkaa230/status/1688522423375663104",
    round: 157,
    cid: "bafybeifzle7z5dnzj2wf67r5nn66j7hlautnqikoo4v4xbz4nqnounwepq",
    _id: "RYeGTFLSHmm0N1kX",
  },
  {
    id: "https://twitter.com/Meacon2023/status/1688625740332310528",
    round: 157,
    cid: "bafybeihtyuz6gtnlbcduh5mkf5pmbunkyxo74dxpqeeljl525ktudlr6fa",
    _id: "SLI1bydJGkqsR6pn",
  },
  {
    id: "https://twitter.com/woodpecker0x/status/1688588057249824778",
    round: 157,
    cid: "bafybeidhoanvm4b2kpwogerzhfgrllaw26i6iey7dkauhfuk7fxuz5i6vm",
    _id: "SMSwuigZ0RpYUfJh",
  },
];

async function queueCID() {
    // Create a queue with a concurrency of 10
    const cidQ = new Queue(10, 1);
    // Create an array to store promises
    let promises = [];
  
    for (let data of cidDataRawList) {
      // Add tasks to the queue and store the promises
      promises.push(
        cidQ.run(async () => {
          try {
            return await readCID(data);
          } catch (e) {
            console.error(e);
            return null; // Return null if an error occurs
          }
        })
      );
    }
  
    // Wait for all promises to resolve
    const tweetList = await Promise.all(promises);
  
    // Filter out any null values (from errors) and flatten the list if needed
    const flatTweetList = tweetList.filter(Boolean).flat();

    console.log(flatTweetList);
  
    return flatTweetList;
  }
  

async function readCID(data) {
  // console.log(data);
  let tweetDataRaw = await dataFromCid(data.cid);
  return tweetDataRaw.data;
}

queueCID();
