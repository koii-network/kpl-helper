const express = require('express');
const axios = require('axios');
const getTaskData = require('../helpers/getTaskData'); 
require('dotenv').config();
const app = express();
const port = 3000;

app.use(express.json()); 


app.get('/keywords', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3000/keywords');
    res.json({ keyword: response.data.keyword });
  } catch (error) {
    console.log(
      'No Keywords from middle server, loading local keywords.json',
    );
    const wordsList = require('./keywords.json');
    const randomIndex = Math.floor(Math.random() * wordsList.length);
    res.json({ keyword:wordsList[randomIndex]});
  }
});

app.get('/get-current-task-data', async (req, res) => {
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
