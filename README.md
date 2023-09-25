# Koii Task Middleman

This project is an example solution that converts the data produced by Koii Nodes into a ready-to-use standartized JSON format.

![Task Middleman](https://i.imgur.com/05misSU.png)

## Steps:

- Reads submissions from a Koii Task.
- Extracts the referred data from IPFS using a submission list.
- Posts the extracted data to a specified server.

It uses a queuing system to manage concurrency and ensure efficient processing.

## Structure

- **index.js**: Main entry point that orchestrates the fetching and posting processes.
- **queue.js**: Contains the logic for queuing the tasks, such as sending tweets and handling CID data.

## Dependencies

- **async-await-queue**: For managing task concurrency.
- **axios**: For making HTTP requests.

## Usage

1. Install Dependencies
   Before running the project, make sure to install the required dependencies:

```bash
npm install
```

2. Configure Server and Tokens
   Ensure that the server URL and any required tokens or headers are properly configured in the sendTweet function inside the api directory. To extract the data from IPFS, you need to provide the `SECRET_WEB3_STORAGE_KEY` in .env file. To post the data to the server, you need to provide the `USER_TOKEN` in .env file.

3. Run the Project
   You can run the project by executing the following command:

```bash
npm run start
```

This will start the process of fetching tweets and posting them to the configured server.

To test the project, you can use the following command:

```bash
npm run server
```

This will start a server that listen on localhost:3333 will receive the tweets and log them to the console. Then in `api/sendTweet.js` file, change the server url to locahost:3333.

## Functions

- **queuePost(tweetList, i)**
  - Parameters:
    - **tweetList**: An array of tweet data.
    - **i**: An index used for tracking the process.
  - Description: Handles the queuing and sending of tweets to the server.
- **queueCID(submissionList)**
  - Parameters:
    - **submissionList**: An array of submission data including CIDs.
  - Description: Extracts tweet data from IPFS using the provided CIDs.

## Note

Make sure that the server is configured to receive the data in the expected format and that all necessary headers, tokens, and timeouts are properly set.
