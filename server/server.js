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
      screen_name TEXT,
      user_url TEXT,
      user_img TEXT,
      tweets_id TEXT UNIQUE,
      tweets_url TEXT,
      tweets_content TEXT,
      time_post INTEGER,
      time_read INTEGER,
      comment TEXT,
      like TEXT,
      share TEXT,
      view TEXT,
      outer_media_url TEXT,
      outer_media_short_url TEXT,
      url TEXT,
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
    console.log(req.body); // Print the received batch data

    const batchData = req.body.data;

    // Begin transaction
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      const stmt = db.prepare(`
        INSERT INTO data (
          user_name, screen_name, user_url, user_img, tweets_id, tweets_url, tweets_content, 
          time_post, time_read, comment, like, share, view, outer_media_url, 
          outer_media_short_url, url, date, IP
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (let data of batchData) {
        stmt.run(
          [
            data.user_name,
            data.screen_name,
            data.user_url,
            data.user_img,
            data.tweets_id,
            data.tweets_url,
            data.tweets_content,
            data.time_post,
            data.time_read,
            data.comment,
            data.like,
            data.share,
            data.view,
            JSON.stringify(data.outer_media_url),
            JSON.stringify(data.outer_media_short_url),
            data.url,
            req.body.date,
            req.body.IP,
          ],
          (err) => {
            if (err) {
              if (err.code === "SQLITE_CONSTRAINT") {
                console.warn("Duplicate tweets_id detected:", data.tweets_id);
              } else {
                console.error("Error saving data:", err);
              }
              // Rollback if an error occurs
              db.run("ROLLBACK");
              return res.status(500).send("Internal Server Error");
            }
          }
        );
      }

      // Finalize the statement and commit
      stmt.finalize(() => {
        db.run("COMMIT", (commitErr) => {
          if (commitErr) {
            return res.status(500).send("Failed to commit the transaction.");
          }
          res.status(200).send("Batch data received and saved");
        });
      });
    });
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
