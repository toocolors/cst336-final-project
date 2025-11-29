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
// Root
// Author: Noah deFer
app.get('/', (req, res) => {
    // Render login page
    res.render('login');
}); // Root

// post login
// Checks if username and password from user are valid.
// Rerenders login page if either are invalid.
// TODO: Redirects to main menu of both are valid.
// Author: Noah deFer
app.post('/login', async (req, res) => {
    // Get username and password
    let username = req.body.username;
    let password = req.body.password;

    // Check if username is empty or too long,
    //  or if password is empty
    if (username == '' || username.length > username_max || password == '') {
        // Render login page with message
        res.render('login', {
            'loginMessage': 'Invalid username or password.'
        });
        return;
    }

    // Get user from database
    let user = await getUserByUsername(username);

    // Check if user exists
    if (user.length == 0) {
        // Render login page with message
        res.render('login', {
            'loginMessage': 'Username does not exist.'
        });
        return;
    }

    // Check stored hash and passwordHash
    let match = await bcrypt.compare(password, user[0].password);
    if (match) {
        // Update session information
        req.session.authenticated = true;
        req.session.user = user[0].user_id;
        // Placeholder until Main Menu is ready
        // JIAN: Change render call to main menu redirect: <-------------------------------------------------
        res.render('login', {
            'loginMessage': 'Login Successful'
        });
    } else {
        // Rerender login page with message
        res.render('login', {
            'loginMessage': 'Password does not match.'
        });
    }
}); // post login

// logout
// Author: Noah deFer
app.get('/logout', (req, res) => {
    // Clear session data
    req.session.destroy();

    // Redirect to login
    res.redirect('/');
}); // logout

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
        FROM users
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