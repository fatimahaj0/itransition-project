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
  password: '12345',
  database: 'itransition',
});
db.query("SELECT 1", (err, result) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Database connection successful");
  }
});



const validateCustomFields = (customFields) => {
    const fieldTypes = {
        int: 0,
        string: 0,
        multilineText: 0,
        boolean: 0,
        date: 0
    };

    for (const field of customFields) {
        fieldTypes[field.type]++;
        if (fieldTypes[field.type] > 3) {
            return false;
        }
    }

    return true;
};
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

app.post('/create', (req, res) => {
  const { name, description, categoryId, image } = req.body;

  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = decoded.id;

    const sql = "INSERT INTO collection (name, description, categoryId, image, userId) VALUES (?, ?, ?, ?, ?)";
    const values = [name, description, categoryId, image, userId];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error occurred while adding collection' });
      } else {
        res.send("Data added");
      }
    });
  });
});

app.get('/categories', (req, res) => {
  const sql = 'SELECT * FROM category';
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post('/collection/:collectionId/items', (req, res) => {
    const collectionId = req.params.collectionId;
    const { name, tags, customFields } = req.body;

    if (!validateCustomFields(customFields)) {
        return res.status(400).json({ error: "Maximum of three fields allowed for each type" });
    }

    console.log("Received request to create item:", { name, tags, collectionId });

    const sql = "INSERT INTO item (name, tags, collectionId, customFields) VALUES (?, ?, ?, ?)";
    const values = [name, JSON.stringify(tags), collectionId, JSON.stringify(customFields)]; 

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error creating item:", err);
            return res.status(500).json({ error: "Failed to create item", details: err.message });
        }

        const newItemId = result.insertId;
        const fetchSql = "SELECT * FROM item WHERE id = ?";
        db.query(fetchSql, [newItemId], (err, fetchResult) => {
            if (err) {
                console.error("Error fetching new item:", err);
                return res.status(500).json({ error: "Failed to fetch new item", details: err.message });
            }

            return res.json(fetchResult[0]);
        });
    });
});

app.get('/tags', (req, res) => {
    const { query } = req.query;
console.log("Received request for tags with query:", query);

const tags = query.split(',').map(tag => tag.trim());
const placeholders = tags.map(() => '?').join(','); 
const sql = `SELECT DISTINCT tags FROM item WHERE tags IN (${placeholders})`; 
const values = tags;


    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error fetching tags:", err);
            return res.status(500).json({ error: "Error fetching tags" });
        }
        const fetchedTags = result.map(item => item.tags);
        console.log("Fetched tags:", fetchedTags);
        res.json(fetchedTags);
    });
});









app.listen(8081, () => {
  console.log("Server is running on port 8081");
});
module.exports = db;