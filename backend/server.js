const express = require("express");
const env = require('dotenv').config();

const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
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

app.get('/my-collections', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = decoded.id;

    const sql = "SELECT * FROM collection WHERE userId = ?";
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error occurred while fetching collections' });
      } else {
        res.json(results);
      }
    });
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
app.get('/users-with-collections', (req, res) => {
  const sql = "SELECT u.id AS userId, u.username, u.admin, c.id AS collectionId, c.name AS collectionName FROM user u LEFT JOIN collection c ON u.id = c.userId";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching users with collections:", err);
      return res.status(500).json({ error: "Error fetching users with collections" });
    }
   
    const usersWithCollections = {};
    result.forEach(row => {
      const { userId, username, admin, collectionId, collectionName } = row;
      if (!usersWithCollections[userId]) {
        usersWithCollections[userId] = { userId, username, admin, collections: [] };
      }
      if (collectionId) {
        usersWithCollections[userId].collections.push({ collectionId, collectionName });
      }
    });
    res.json(Object.values(usersWithCollections));
  });
});


app.put('/users/:userId/admin', async (req, res) => {
  const userId = req.params.userId;
  const { admin } = req.body;

  console.log("Request Body:", req.body);

  const token = req.headers.authorization;
  console.log("Authorization Header:", token);

  if (!token) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }

  const tokenValue = tokenParts[1];
  jwt.verify(tokenValue, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log("Decoded Token:", decoded);

    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Only admin users can perform this action' });
    }

    try {
      const sql = "UPDATE user SET admin = ? WHERE id = ?";
      const values = [admin, userId]; 
      const [result] = await db.promise().execute(sql, values);

      if (result.affectedRows > 0) {
        return res.json({ success: true, message: `User ${userId} admin status updated successfully` }); // Change 'id' to 'userId'
      } else {
        return res.status(404).json({ error: `User with ID ${userId} not found` }); // Change 'id' to 'userId'
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      return res.status(500).json({ error: 'Failed to update admin status' });
    }
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
    const isAdmin = decoded.isAdmin;

    // Function to create a collection
    const createCollection = (name, description, categoryId, image, userId) => {
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
    };

    // Check if the user is an admin or the owner of the collection
    if (isAdmin) {
      // Admins can create collections for any user
      createCollection(name, description, categoryId, image, userId);
    } else {
      // Check if the user is the owner of the collection
      const providedUserId = req.body.userId; // Assuming userId is provided in the request body
      if (userId !== providedUserId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // User is the owner, allow them to create the collection
      createCollection(name, description, categoryId, image, userId);
    }
  });
});


function createCollection(name, description, categoryId, image, userId, res) {
  const sql = "INSERT INTO collection (name, description, categoryId, image, userId) VALUES (?, ?, ?, ?, ?)";
  const values = [name, description, categoryId, image, userId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error occurred while adding collection:", err);
      return res.status(500).json({ error: 'Error occurred while adding collection' });
    }
    res.send("Collection created successfully");
  });
}



app.get('/categories', (req, res) => {
  const sql = 'SELECT * FROM category';
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
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

app.post('/collection/:collectionId/items', (req, res) => {
    const collectionId = req.params.collectionId;
    const { name, tags, customFields } = req.body;
    const token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = decoded.id;

        // Check if the user is an admin
        if (decoded.isAdmin) {
            // User is an admin, proceed with item creation
            createItem(collectionId, name, tags, customFields, res);
        } else {
            // User is not an admin, check if the user is the owner of the collection
            const checkOwnerSql = `SELECT userId FROM collection WHERE id = ?`;
            db.query(checkOwnerSql, [collectionId], (err, result) => {
                if (err) {
                    console.error("Error checking collection owner:", err);
                    return res.status(500).json({ error: "Failed to check collection owner" });
                }

                if (result.length === 0 || result[0].userId !== userId) {
                    return res.status(403).json({ error: 'Forbidden' });
                }

                // User is authorized, proceed with item creation
                createItem(collectionId, name, tags, customFields, res);
            });
        }
    });
});

function createItem(collectionId, name, tags, customFields, res) {
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
}



app.delete('/items/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    const token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Error verifying token:', err);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Logging decoded token for debugging
        console.log('Decoded token:', decoded);

        // Extract userId from the decoded token
        const userId = decoded.id;

        // Check if the user is an admin
        const isAdmin = decoded.isAdmin;

        // Logging user information for debugging
        console.log('User ID:', userId);
        console.log('Is Admin:', isAdmin);

        // If the user is not an admin, they must be the owner of the item to delete it
        if (!isAdmin) {
            const sql = "SELECT userId FROM item WHERE id = ?";
            const values = [itemId];

            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error checking item ownership:', err);
                    return res.status(500).json({ error: 'Error occurred while checking item ownership' });
                } else {
                    // If the item is not found or the user is not the owner, return an error
                    if (result.length === 0 || result[0].userId !== userId) {
                        console.log('User is not the owner of the item.');
                        return res.status(403).json({ error: 'Forbidden: You are not authorized to delete this item' });
                    } else {
                        console.log('User is the owner of the item.');
                        // If the user is the owner, delete the item
                        deleteItem(itemId, res);
                    }
                }
            });
        } else {
            // If the user is an admin, they can delete any item
            deleteItem(itemId, res);
        }
    });
});

function deleteItem(itemId, res) {
    const sql = "DELETE FROM item WHERE id = ?";
    const values = [itemId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error deleting item:', err);
            return res.status(500).json({ error: 'Error occurred while deleting item', details: err.message });
        } else {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Item not found' });
            } else {
                return res.status(200).json({ message: 'Item deleted successfully' });
            }
        }
    });
}




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





app.get('/collection/:id', (req, res) => {
  const collectionId = req.params.id;
  const sql = "SELECT * FROM collection WHERE id = ?";
  db.query(sql, [collectionId], (err, result) => {
    if (err) {
      console.error("Error fetching collection:", err);
      return res.status(500).json({ error: "Error fetching collection" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.json(result[0]);
  });
});





app.delete('/collection/:id', (req, res) => {
  const collectionId = req.params.id;

  const sql = "DELETE FROM collection WHERE id = ?";
  db.query(sql, [collectionId], (err, result) => {
    if (err) {
      console.error("Error deleting collection:", err);
      return res.status(500).json({ error: "Error deleting collection" });
    }
    res.json({ success: true, message: "Collection deleted successfully" });
  });
});








app.listen(8081, () => {
  console.log("Server is running on port 8081");
});
module.exports = db;