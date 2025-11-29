// Imports
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

// Global Constants
const username_max = 8;

// Setup app
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

// Setting session settings
app.set('trust proxy', 1);
app.use(session({
    secret: 'Call me Ishmael.',
    resave: false,
    saveUninitialized: true
}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "de1tmi3t63foh7fa.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "krs27vqnztytj1gz",
    password: "xtlq3v6f4j3phnh1",
    database: "ckj1pakovapc7kr2",
    connectionLimit: 10,
    waitForConnections: true
});
const conn = await pool.getConnection();

// Setup Routes
// GAME ROUTES

// LOGIN / LOGOUT ROUTES
// get login
app.get('/', (req, res) => {
    // Render login page
    res.render('login');
}); // get login

// post login
app.post('/login', (req, res) => {
    // Get username and password

    // Check if username is empty or too long

    // Check if password is empty

    // Get user from database

    // Execute SQL


    // Redirect to main page
    res.redirect('/');
}); // post login

// MAIN MENU ROUTES

// QUEST ROUTES

// REVIEW ROUTES

// SIGNUP ROUTES

// API ROUTES

// TEST ROUTES
// dbTest
app.get('/dbTest', async (req, res) => {
    // Get SQL Test Data
    // Build SQL Statement
    let sql = `
        SELECT *
        FROM test`;

    // Execute SQL
    const [rows] = await conn.query(sql);

    // Send SQL Test Data
    res.send(rows);
});

// Listen on port 3000
app.listen(3000, () => {
   console.log('server started');
});

// Functions
/**
 * Gets the information of a user from the database,
 *  based on the passed in ID.
 * Author: Noah deFer
 * @param {Number} id The ID of a user.
 * @returns The response from the SQL server.
 */
async function getUserById(id) {
    // Build SQL Statement
    let sql = `
        SELECT *
        FORM users
        WHERE user_id = ?`;

    // Execute SQL
    const [rows] = await conn.query(sql, [id]);

    // Return result
    return rows;
} // getUserById

/**
 * Gets the information of a user from the database,
 *  based on the passed in username.
 * Author: Noah deFer
 * @param {String} username The username of a user.
 * @returns The response from the SQL Server.
 */
async function getUserByUsername(username) {
    // Build SQL Statement
    let sql = `
        SELECT *
        FORM users
        WHERE username LIKE ?`;

    // Execute SQL
    const [rows] = await conn.query(sql, [username]);

    // Return result
    return rows;
} // getUserByUsername

/**
 * Checks if the current session is authenticated.
 *  Redirects the user if it is not.
 *  Goes to next function if it is.
 * Author: Noah deFer
 * @param {*} req 
 * @param {*} res 
 * @param {*} next The next function to be called.
 */
function isAuthenticated(req, res, next) {
    if(!req.session.authenticated) {
        res.redirect('/');
    } else {
        next();
    }
} // isAuthenticated