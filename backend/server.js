const express = require("express");
const env = require('dotenv').config();
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
 
  host: 'localhost',
  user: 'root',
  password: 'rootpass#$',
  database: 'itransition',
});
db.query("SELECT 1", (err, result) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Database connection successful");
  }
});

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  const sql = "INSERT INTO `user` (`username`, `email`, `password`) VALUES (?, ?, ?)";
  const values = [username, email, password];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error in database query:", err);
      if (err.errno === 1062) {
        return res.status(400).json({ error: "User already exists" });
      }
	   return res.status(500).json({ error: "Error occurred while adding user" });
    }
    return res.json({ success: true, message: "User added successfully" });
  });
});

app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT `id`, `password`, `admin` FROM `user` WHERE `email` = ?";
  const values = [email];

  db.query(sql, values, async (err, result) => {
    if (err) {
      console.error("Error in database query:", err);
      return res.status(500).json({ error: "An error occurred during sign-in" });
    }
    if (result.length > 0) {
      const user = result[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ id: user.id, isAdmin: user.admin === 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ success: true, message: "User signed in successfully", token: token, isAdmin: user.admin === 1  });
      } else {
        return res.status(401).json({ error: "Invalid email or password" });
      }
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  });
});

app.get('/collection', (req, res) => {
  const sql = "SELECT * FROM collection";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching data from collection:", err);
      return res.status(500).json({ error: "Error fetching data from collection" });
    }
    res.json(result);
  });
});

app.get('/collection/:id/items', (req, res) => {
  const collectionId = req.params.id;
  const sql = "SELECT * FROM item WHERE collectionId = ?";
  db.query(sql, [collectionId], (err, result) => {
    if (err) {
      console.error("Error in database query:", err);
      return res.status(500).json({ error: "Error occurred while fetching items" });
    }
    return res.json(result);
  });
});

app.listen(8081, () => {
  console.log("Server is running on port 8081");
});
module.exports = db;