const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const asyncHandler = require("express-async-handler");
const app = express();
const port = 3333;

// Middleware to parse JSON request bodies
app.use(express.json());

// Open a database connection
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to SQLite database");

    // Create a table if it doesn't exist
    db.run(
      `
      CREATE TABLE IF NOT EXISTS data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT,
        tweets_url TEXT,
        tweets_content TEXT,
        comment TEXT,
        like TEXT,
        share TEXT,
        view TEXT,
        date TEXT,
        IP TEXT
      )
    `,
      (err) => {
        if (err) {
          console.error("Error creating table", err.message);
        }
      }
    );
  }
});

// POST endpoint to receive and save the data
app.post(
  "/receive",
  asyncHandler(async (req, res) => {
    console.log(req.body); // Print the received data

    const data = req.body.data;

    // Map the received data to database fields
    db.run(
      `
      INSERT INTO data (
        user_name, tweets_url, tweets_content, comment, like, share, view, date, IP
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        data.user, // user_name
        data.url, // tweets_url
        data.content, // tweets_content
        data.comment, // comment
        data.like || null, // like
        data.share || null, // share
        data.view || null, // view
        req.body.date,
        req.body.IP,
      ],
      (err) => {
        if (err) {
          console.error("Error saving data:", err);
          return res.status(500).send("Internal Server Error");
        }
        res.status(200).send("Data received and saved");
      }
    );
  })
);

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Gracefully close the database connection on app termination
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Close the database connection.");
  });
  process.exit(0);
});
