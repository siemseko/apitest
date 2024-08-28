const express = require('express');
const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 7100; 

app.get('/', (req, res) => {
    // Sample query to test MySQL connection
    connection.query('SELECT * FROM your_table', (err, results, fields) => {
        if (err) {
            res.status(500).send('Error fetching data from MySQL');
            console.error(err);
            return;
        }
        res.json(results); // Send the results as a JSON response
    });
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Connect to the SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('./products.db', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        // Create the product table if it doesn't exist
        db.run(`
      CREATE TABLE IF NOT EXISTS product (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        qty INTEGER NOT NULL
      )
    `);
        console.log('Connected to the SQLite database');
    }
});

// POST route to handle name, price, and qty and save to the database
app.post('/submit-product', (req, res) => {
    const { name, price, qty } = req.body;

    // Validate that all fields are provided
    if (!name || !price || !qty) {
        return res.status(400).send('Name, price, and quantity are required');
    }

    // Insert the data into the product table
    const insertQuery = `INSERT INTO product (name, price, qty) VALUES (?, ?, ?)`;
    db.run(insertQuery, [name, price, qty], function (err) {
        if (err) {
            return res.status(500).send('Failed to save the product to the database');
        }

        // Send a success response back to the client
        res.status(200).send(`Product ${name} added with ID ${this.lastID}`);
    });
});


// GET route to fetch all products
app.get('/products', (req, res) => {
    const selectQuery = `SELECT * FROM product`;

    db.all(selectQuery, [], (err, rows) => {
        if (err) {
            return res.status(500).send('Failed to retrieve products from the database');
        }

        // Send the retrieved products as JSON
        res.status(200).json({
            data: rows
        });
    });
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
