const express = require('express');
require('dotenv').config();
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser'); // For handling cookies
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser()); // Use cookie-parser to handle cookies
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

// Helper function to verify if user is logged in
function isAuthenticated(req, res, next) {
    if (req.cookies.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Registration route with bcrypt for password hashing
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    // Hash the password using bcrypt
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;
        const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(sql, [name, email, hash], (err, result) => {
            if (err) throw err;
            res.send('User registered successfully');
        });
    });
});

// Login route with bcrypt for password verification and cookie for session management
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            const user = result[0];
            // Compare the entered password with the stored hashed password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    // Set a cookie to track the session
                    res.cookie('loggedIn', true, { httpOnly: true });
                    res.send('Login successful');
                } else {
                    res.status(401).send('Invalid login credentials');
                }
            });
        } else {
            res.status(401).send('Invalid login credentials');
        }
    });
});

// Logout route to clear the cookie
app.get('/logout', (req, res) => {
    res.clearCookie('loggedIn');
    res.redirect('/login');
});

// Add Patient route (requires authentication)
app.post('/patients', isAuthenticated, (req, res) => {
    const { name, age, gender, diagnosis, treatment } = req.body;
    const sql = 'INSERT INTO patients (name, age, gender, diagnosis, treatment) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, age, gender, diagnosis, treatment], (err, result) => {
        if (err) throw err;
        res.send('Patient record added');
    });
});

// Get Patient Records route with Search functionality (requires authentication)
app.get('/patients', isAuthenticated, (req, res) => {
    const searchQuery = req.query.q || ''; // Get the search query from URL (for search bar)
    const sql = `SELECT * FROM patients WHERE name LIKE ? OR diagnosis LIKE ?`;
    db.query(sql, [`%${searchQuery}%`, `%${searchQuery}%`], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Serve pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/views/home.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/views/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/views/register.html')));
app.get('/enter-details', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'public/views/enter-details.html')));
app.get('/get-details', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'public/views/get-details.html')));

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));