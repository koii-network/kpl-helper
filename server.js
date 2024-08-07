const express = require('express');
const axios = require('axios');
const getTaskData = require('./helpers/getTaskData'); 
require('dotenv').config();
const app = express();
const port = 3000;

app.use(express.json()); 

//Custom keywords or randomly selected
const defaultKeyword = process.env.KEY_WORD;

app.get('/keywords', (req, res) => {
  try {
    let keyword = defaultKeyword;

    if (!keyword) {
      console.log(
        'No Keywords from middle server, loading local keywords.json',
      );
      const wordsList = require('./keywords.json');
      const randomIndex = Math.floor(Math.random() * wordsList.length);
      keyword = wordsList[randomIndex]; // Load local JSON data
      console.log("keywordfromjson",keyword);
    }
    
    res.send(keyword);
    
  } catch (error) {
    console.log('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

//get taskstate from running task
app.get('/taskstate', async (req, res) => {
  try {
    const taskID = process.env.TASK_ID;
    const round = 0;
    const taskData = await getTaskData(taskID, round);
    res.json({ taskData });
  } catch (error) {
    console.error('Error fetching task data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
