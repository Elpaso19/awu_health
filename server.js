// File: app.js

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'health_records'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});
// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/home.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/register.html'));
});

app.get('/enter-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/enter-details.html'));
});

app.get('/get-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/get-details.html'));
});



// Registration route
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, password], (err, result) => {
        if (err) throw err;
        res.send('User registered successfully');
    });
});



// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.send('Login successful');
        } else {
            res.status(401).send('Invalid login credentials');
        }
    });
});

// Add a new patient
app.post('/patients', (req, res) => {
    const { name, age, gender, diagnosis, treatment } = req.body;
    const sql = 'INSERT INTO patients (name, age, gender, diagnosis, treatment) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, age, gender, diagnosis, treatment], (err, result) => {
        if (err) throw err;
        res.send('Patient record added');
    });
});

// Get patient details
app.get('/patients', (req, res) => {
    const sql = 'SELECT * FROM patients';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});