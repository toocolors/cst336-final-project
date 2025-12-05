// Imports
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

// Global Constants
const username_max = 8;
const rawg_key = '72b5dccc903f4bb58b7a00204ba16857';
const rawg_url = 'https://api.rawg.io/api/';

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
// instead of using this line, it is simpler to just use the pool directly - jian
// const conn = await pool.getConnection();

// Setup Routes
// COLLECTION ROUTES
// Author: Noah deFer
app.post('/collect', isAuthenticated, async (req, res) => {
    // Get game & user ID
    let gameId = req.body.gameId
    let userId = req.session.user;

    // Add game to collection
    // Build SQL
    let sql = `
        INSERT INTO collections (user_id, game_id)
        VALUES (?, ?)`

    // Execute SQL
    const [rows] = await pool.query(sql, [userId, gameId]);

    // Get game name
    let name = await getGameById(gameId);
    
    // Redirect to Game Details
    res.redirect(`/game/${name[0].game_name}`);
});

// Author: Noah deFer
app.post('/uncollect', isAuthenticated, async (req, res) => {
    // Get game & user ID
    let gameId = req.body.gameId
    let userId = req.session.user;

    // Remove game from collection
    // Build SQL
    let sql = `
        DELETE FROM collections
        WHERE user_id = ? AND game_id = ?`;

    // Execute SQL
    const [rows] = await pool.query(sql, [userId, gameId]);
    
    // Get game name
    let name = await getGameById(gameId);
    
    // Redirect to Game Details
    res.redirect(`/game/${name[0].game_name}`);
});

// GAME ROUTES
// Author: Noah deFer
app.get('/game', isAuthenticated, async (req, res) => {
    // Get input
    let game = req.query.gameId;

    // Try to get game data from database
    // Build SQL
    let sql = `
        SELECT *
        FROM games
        WHERE (game_id = ? OR game_name = ?) AND game_id != 0`;

    // Execute SQL
    const [rows] = await pool.query(sql, [game, game]);

    // Redirect to game/:id
    if (rows.length > 0) {
        res.redirect(`/game/${rows[0].game_name}`);
    } else {
        res.redirect(`/game/${game}`);
    }
});

// Author: Noah deFer
app.get('/game/:id', isAuthenticated, (req, res) => {
    // Render gameDetails page
    res.render('gameDetails', {
        'gameId': req.params.id
    });
});

// Author: Noah deFer
app.get('/games', isAuthenticated, async (req, res) => {
    // Render games page
    res.render('games');
});

// FAVORITE ROUTES
// Author: Noah deFer
app.post('/favorite', isAuthenticated, async (req, res) => {
    // Get game & user ID
    let gameId = req.body.gameId
    let userId = req.session.user;

    // Get date
    let date = new Date();
    let today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    // Add game to favorites
    // Build SQL
    let sql = `
        INSERT INTO favorites (user_id, game_id, favorited_at)
        VALUES (?, ?, ?)`

    // Execute SQL
    const [rows] = await pool.query(sql, [userId, gameId, today]);
    
    // Get game name
    let name = await getGameById(gameId);
    
    // Redirect to Game Details
    res.redirect(`/game/${name[0].game_name}`);
});

// Author: Noah deFer
app.post('/unfavorite', isAuthenticated, async (req, res) => {
    // Get game & user ID
    let gameId = req.body.gameId
    let userId = req.session.user;

    //Remove game from favorites
    // Build SQL
    let sql = `
        DELETE FROM favorites
        WHERE user_id = ? AND game_id = ?`;

    // Execute SQL
    const [rows] = await pool.query(sql, [userId, gameId]);
    
    // Get game name
    let name = await getGameById(gameId);
    
    // Redirect to Game Details
    res.redirect(`/game/${name[0].game_name}`);
});

// Author: Suhaib Peracha
// FAVORITES PAGE
app.get('/favorites', isAuthenticated, async (req, res) => {
    const userId = req.session.user;

    let sql = `
        SELECT favorites.game_id, games.game_name
        FROM favorites
        INNER JOIN games ON favorites.game_id = games.game_id
        WHERE favorites.user_id = ?
        ORDER BY games.game_name;
    `;

    const [rows] = await pool.query(sql, [userId]);

    res.render('favorites', { favorites: rows });
});


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
        req.session.username = user[0].username;

        res.redirect('/home');
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
// Author: Jian Mitchell
app.get('/home', isAuthenticated, async (req, res) => {
   try {
       const username = req.session.username || 'Guest';

       res.render('home', {
          username: username
       });
   }  catch (error) {
       console.error('Error loading home page:', error);
       res.redirect('/');
   }
}); // home

// QUEST ROUTES
// Author: Jian Mitchell
app.get('/quests', isAuthenticated, async (req, res) => {
   res.render('quests');
});

// Author: Jian Mitchell
app.get('/quest/:id', isAuthenticated, async (req, res) => {
   let questId = req.params.id;

   let sql = `
        SELECT * FROM quests
        WHERE quest_id = ? AND user_id = ?`;

   const [rows] = await pool.query(sql, [questId, req.session.user]);

   if (rows.length === 0) {
       res.redirect('/quests');
       return;
   }

   res.render('questDetails', {quest: rows[0]});
});

// Author: Jian Mitchell
app.post('/quest/create', isAuthenticated, async (req, res) => {
   let userId = req.session.user;
   let gameId = req.body.gameId;
   let questName = req.body.questName;
   let questDesc = req.body.questDesc;
   let difficulty = req.body.difficulty;
   let status = req.body.status || 'not_started';
   let createdAt = new Date().toISOString().split('T')[0];

   let sql = `
        INSERT INTO quests (user_id, game_id, quest_name, quest_desc, difficulty, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
   `;

   const [rows] = await pool.query(sql, [userId, gameId, questName, questDesc, difficulty, status, createdAt]);

   res.redirect('/quests');
});

// Author: Jian Mitchell
app.post('/quest/update/:id', isAuthenticated, async (req, res) => {
   let questId = req.params.id;
   let userId = req.session.user;
   let questName = req.body.questName;
   let questDesc = req.body.questDesc;
   let difficulty = req.body.difficulty;
   let status = req.body.status;
   let startedAt = req.body.startedAt || null;
   let endedAt = req.body.endedAt || null;

   let sql = `
        UPDATE quests
        SET quest_name = ?,
            quest_desc = ?,
            difficulty = ?,
            status = ?,
            started_at = ?,
            ended_at = ?
        WHERE quest_id = ? AND user_id = ?
   `;

   const [rows] = await pool.query(sql, [questName, questDesc, difficulty, status, startedAt, endedAt, questId, userId]);

   res.redirect(`/quest/${questId}`);
});

// Author: Jian Mitchell
app.post('/quest/delete/:id', isAuthenticated, async (req, res) => {
   let questId = req.params.id;
   let userId = req.session.user;

   let sql = `
        DELETE FROM quests WHERE quest_id = ? AND user_id = ?
   `;

   const [rows] = await pool.query(sql, [questId, userId]);

   res.redirect('/quests');
});

// REVIEW ROUTES
// show reviews page for a specific game
app.get('/reviews/:gameId', isAuthenticated, async (req, res) => {
    const gameId = req.params.gameId;
    res.render('reviews', { gameId });
});

// get list of reviews for a game (JSON)
app.get('/api/reviews/:gameId', isAuthenticated, async (req, res) => {
    const gameId = req.params.gameId;

    const sql = `
        SELECT reviews.review_id, reviews.rating, reviews.review_text, reviews.created_at,
               users.username
        FROM reviews
        INNER JOIN users ON reviews.user_id = users.user_id
        WHERE game_id = ?
        ORDER BY created_at DESC
    `;

    const [rows] = await pool.query(sql, [gameId]);
    res.json(rows);
});

app.post('/reviews', isAuthenticated, async (req, res) => {
    const userId = req.session.user;
    const { gameId, rating, review_text } = req.body;

    if (!rating || rating < 1 || rating > 10) {
        return res.status(400).send('Invalid rating.');
    }

    const sql = `
        INSERT INTO reviews (user_id, game_id, rating, review_text)
        VALUES (?, ?, ?, ?)
    `;

    await pool.query(sql, [userId, gameId, rating, review_text]);

    res.redirect(`/reviews/${gameId}`);
});

// REVIEWS HUB PAGE
app.get('/reviews', isAuthenticated, async (req, res) => {
    const userId = req.session.user;

    const sql = `
        SELECT r.review_id, r.rating, r.review_text, r.created_at,
               g.game_id, g.game_name,
               u.username
        FROM reviews r
        JOIN games g ON r.game_id = g.game_id
        JOIN users u ON r.user_id = u.user_id
        ORDER BY r.created_at DESC
        LIMIT 20;
    `;

    const [rows] = await pool.query(sql);

    res.render('reviewsHome', { reviews: rows });
});


// SIGNUP ROUTES
// Author: Suhaib Peracha
// simple signup page
app.get('/signup', (req, res) => {
    res.render('signup', { signupMessage: '' })
})

// handle signup submit
app.post('/signup', async (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let confirm = req.body.confirm

    // basic checks
    if (!username || username.length > username_max || !password || password !== confirm) {
        return res.render('signup', {
            signupMessage: 'Invalid info'
        })
    }

    // check username exists
    let existing = await getUserByUsername(username)
    if (existing.length > 0) {
        return res.render('signup', {
            signupMessage: 'Username taken'
        })
    }

    // hash pass
    let hash = await bcrypt.hash(password, 10)

    // insert user
    await createUser(username, hash)

    // go back to login
    res.redirect('/')
})


// API ROUTES
// Author: Noah deFer
app.get('/api/game/:id', isAuthenticated, async (req, res) => {
    // Get params
    let id = req.params.id;

    // Get game details
    let url = `${rawg_url}games/${id}?key=${rawg_key}`;
    let response = await fetch(url);
    let data = await response.json();

    // Insert game into games table
    let sql = `
        INSERT IGNORE INTO games (game_id, game_name)
        VALUES (?, ?)`;
    const [rows] = await pool.query(sql, [data.id, data.name]);
    
    // Send game details
    res.send(data);
});

// Author: Noah deFer
app.get('/api/is-collected/:id', isAuthenticated, async (req, res) => {
    // Get params
    let gameId = req.params.id;
    let userId = req.session.user;

    // Check SQL favorites table
    let sql = `
        SELECT *
        FROM collections
        WHERE user_id = ? AND game_id = ?`;
    const [rows] = await pool.query(sql, [userId, gameId]);

    // Send result (true, false)
    res.send(rows);
});

// Author: Noah deFer
app.get('/api/is-favorite/:id', isAuthenticated, async (req, res) => {
    // Get params
    let gameId = req.params.id;
    let userId = req.session.user;

    // Check SQL favorites table
    let sql = `
        SELECT *
        FROM favorites
        WHERE user_id = ? AND game_id = ?`;
    const [rows] = await pool.query(sql, [userId, gameId]);

    // Send result (true, false)
    res.send(rows);
});

// Author: Jian Mitchell
app.get('/api/recent-games', isAuthenticated, async (req, res) => {
   try {
       let sql = `
            SELECT game_id, game_name
            FROM games
            ORDER BY game_id DESC
            LIMIT 5`;

       const [rows] = await pool.query(sql);
       res.json(rows);
   } catch (error) {
       console.error('Error fetching recent games:', error);
   }
});

// Author: Jian Mitchell
app.get('/api/user-quests', isAuthenticated, async (req, res) => {
   let sql = `
        SELECT q.*, g.game_name
        FROM quests q
        LEFT JOIN games g ON q.game_id = g.game_id
        WHERE q.user_id = ?
        ORDER BY q.created_at DESC
   `;

   const [rows] = await pool.query(sql, [req.session.user]);

   res.json(rows);
});

// Author: Jian Mitchell
app.get('/api/quest/:id', isAuthenticated, async (req, res) => {
   let sql = `
        SELECT q.*, g.game_name
        FROM quests q
        LEFT JOIN games g ON q.game_id = g.game_id
        WHERE q.quest_id = ? AND q.user_id = ?
   `;

   const [rows] = await pool.query(sql, [req.params.id, req.session.user]);

   res.json(rows[0] || {});
});

// Author: Jian Mitchell
app.get('/api/user-games', isAuthenticated, async (req, res) => {
   let sql = `
        SELECT DISTINCT g.game_id, g.game_name
        FROM games g 
        INNER JOIN collections c ON g.game_id = c.game_id
        WHERE c.user_id = ?
        ORDER BY g.game_name
   `;

   const [rows] = await pool.query(sql, [req.session.user]);

   res.json(rows);
});

// Author: Jian Mitchell
app.get('/api/current-user', isAuthenticated, (req, res) => {
  res.json({
    user_id: req.session.user,
    username: req.session.username
  });
});

// Author: Noah deFer
app.get('/api/user-collection', isAuthenticated, async (req, res) => {
    // Build SQL statement
    let sql = `
        SELECT collections.game_id, game_name
        FROM collections
        INNER JOIN games ON collections.game_id = games.game_id
        WHERE user_id = ?
        ORDER BY game_name`;

    // Execute SQL
    const [rows] = await pool.query(sql, [req.session.user]);

    // Return result
    res.send(rows);
})

// TEST ROUTES
// dbTest
app.get('/dbTest', async (req, res) => {
    // Get SQL Test Data
    // Build SQL Statement
    let sql = `
        SELECT *
        FROM test`;

    // Execute SQL
    const [rows] = await pool.query(sql);

    // Send SQL Test Data
    res.send(rows);
});

// Listen on port 3000
app.listen(3000, () => {
   console.log('server started');
});

// Functions
/**
 * Gets the information of a game from the database
 *  based on the passed in ID.
 * Author: Noah deFer
 * @param {Integer} id The ID of a game.
 * @returns The response from the SQL server.
 */
async function getGameById(id) {
    // Build SQL Statement
    let sql = `
        SELECT *
        FROM games
        WHERE game_id = ?`;

    // Execute SQL
    const [rows] = await pool.query(sql, [id]);

    // Return result
    return rows;
} // getGameById

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
        FROM users
        WHERE user_id = ?`;

    // Execute SQL
    const [rows] = await pool.query(sql, [id]);

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
    const [rows] = await pool.query(sql, [username]);

    // Return result
    return rows;
} // getUserByUsername

// create new user
// Author: Suhaib Peracha
async function createUser(username, hash) {
    let sql = `
        INSERT INTO users (username, password)
        VALUES (?, ?)
    `
    const [result] = await pool.query(sql, [username, hash])
    return result;
}

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
