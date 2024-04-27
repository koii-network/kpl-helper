const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.post('/login', (req, res) => {
  axios.post('https://api.example.com/login', {
      username: 'your_username',
      password: 'your_password'
  })
  .then(response => {
      const session = response.data.session;
      console.log('Session obtained:', session);
      res.json({ session }); 
  })
  .catch(error => {
      console.error('Login failed:', error);
      res.status(500).send('Login failed'); 
  });
});

app.post('/search', (req, res) => {
  const { session, query } = req.body;
  axios.post('https://api.example.com/search', {
      session,
      query
  })
  .then(response => {
      const searchResults = response.data.results;
      console.log('Search results:', searchResults);
      res.json({ searchResults }); 
  })
  .catch(error => {
      console.error('Error searching:', error);
      res.status(500).send('Error searching'); 
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
