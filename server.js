const express = require('express');
const axios = require('axios');
const getTaskData = require('./helpers/getTaskData'); 
require('dotenv').config();
const app = express();
const port = 3000;

app.use(express.json()); 

const defaultKeyword = 'halifax';


app.get('/keywords', (req, res) => {
  const keyword = req.query.keyword || defaultKeyword;
  res.send(keyword);
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

//
app.post('/api/getdata', async (req, res) => {
  const data = req.body; 
  console.log('Received data from Twitter crawler:', data);
  res.send(data)

  try {
      // assume have a function can process data from task
      // await saveTweetsToMongoDB(data);
      res.status(200).json({ message: 'Data received successfully' });
  } catch (error) {
      console.error('Error processing data:', error);
      res.status(500).json({ error: 'Failed to process data' });
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
