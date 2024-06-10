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

//receive data from task
let storedData = []; 
app.post('/api/getdata', async (req, res) => {
  const data = req.body; 
  console.log('Received data from Twitter crawler:', data);
  storedData.push(data); 
  try {
      // assume have a function can process data from task or other logic
      // await saveTweetsToMongoDB(data);
      res.status(200).json({ message: 'Data received successfully' });
  } catch (error) {
      console.error('Error processing data:', error);
      res.status(500).json({ error: 'Failed to process data' });
  }
});

// GET endpoint to display the data recevved from task
app.get('/api/getdata', (req, res) => {
  res.status(200).json(storedData);
});


app.post('/task/configure', async (req, res) => {
  const newConfig = req.body;
  try {
      // Logic to update task configuration
      res.json({ message: 'Task configuration updated successfully', config: newConfig });
  } catch (error) {
      console.error('Error updating task configuration:', error);
      res.status(500).json({ error: 'Failed to update configuration' });
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
