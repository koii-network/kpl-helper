const express = require('express');
const axios = require('axios');
const getTaskData = require('./helpers/getTaskData'); 
require('dotenv').config();
const app = express();
const port = 3000;

app.use(express.json()); 

const keywords = require('./keywords.json');
app.get('/keywords', (req, res) => {
  res.json({ keywords });
});

app.get('/keyword', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3000/keywords');
    const wordsList = response.data.keywords;
    const randomIndex = Math.floor(Math.random() * wordsList.length);
    res.json({ keyword: wordsList[randomIndex] });
  } catch (error) {
    console.log(
      'No Keywords from middle server, loading local keywords.json',
    );
    const wordsList = require('./keywords.json');
    const randomIndex = Math.floor(Math.random() * wordsList.length);
    res.json({ keyword:wordsList[randomIndex]});
  }
});

app.post('/add-keyword', (req, res) => {
  const { keyword } = req.body;
  if (keyword && !keywords.includes(keyword)) {
    keywords.push(keyword);
    console.log(keywords); 
    res.status(201).json({ message: 'Keyword added', keywords });
  } else {
    res.status(400).json({ error: 'Invalid or existing keyword' });
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

app.post('/request-update', async (req, res) => {
  try {
      const response = await axios.get('http://example');
      res.json({ message: 'Update requested successfully', updateData: response.data });
  } catch (error) {
      console.error('Error requesting update:', error);
      res.status(500).json({ error: 'Failed to request update' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
