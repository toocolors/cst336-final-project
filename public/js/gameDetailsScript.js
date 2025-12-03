// Add Event Listeners
document.querySelector('#searchBtn').addEventListener('click', displayGameDetails);

// Check if search bar was loaded with text
if (document.querySelector('#search').value != '') {
    // Get and Trim text
    let text = document.querySelector('#search').value;
    text = text.trim();

    // Update Search Bar Text
    document.querySelector('#search').value = text;

    // Attempt to display game
    displayGameDetails();
}

// Functions
/**
 * Takes a JSON object from RAWG API and
 *  makes a JSON object with the values to be used on this page.
 * Author: Noah deFer
 * @param {JSON} data A JSON object representing a game.
 * @returns The constructed, simplifyed JSON object.
 */
function buildGameObject(data) {
    // Build JSON with desired details
    let game = {
        'id': data.id,
        'name': data.name,
        'description': data.description,
        'esrb_rating': data.esrb_rating,
        'released': data.released,
        'background_image': data.background_image,
        'background_image_additional': data.background_image_additional,
        'ratings': data.ratings,
        'developers': data.developers,
        'publishers': data.publishers,
        'genres': data.genres
    };
    return game;
} // buildGameObject

/**
 * Gets game information from local storage or the API,
 *  and updates page information using the game information.
 * Author: Noah deFer
 * @returns 
 */
async function displayGameDetails() {
    // Get Game Details
    let game = await getGameDetails();

    // Check if game was found
    if (!game) {
        document.querySelector('#searchError').textContent = `
        Could not find game.`;
        return;
    }

    // Display game details
    // Name
    let name = document.querySelector('#gameName');
    name.innerHTML = game.name;

    // Favorite Button
    let favoriteBtn = document.querySelector('#favoriteBtn');
    let favoriteForm = document.querySelector('#favoriteForm');
    document.querySelector('#favoriteId').value = game.id;
    if (await isFavorite(game.id)) {
        favoriteBtn.textContent = 'Remove from Favorites';
        favoriteForm.action = '/unfavorite';
    } else {
        favoriteBtn.textContent = 'Add to Favorites'
        favoriteForm.action = '/favorite';
    }

    // Collection Button
    let collectionBtn = document.querySelector('#collectionBtn');
    let collectionForm = document.querySelector('#collectionForm');
    document.querySelector('#collectionId').value = game.id;
    if (await isCollected(game.id)) {
        collectionBtn.textContent = 'Remove from Collection';
        collectionForm.action = '/uncollect';
    } else {
        collectionBtn.textContent = 'Add to Collection'
        collectionForm.action = '/collect';
    }

    // Quests Button
    let questsForm = document.querySelector('#questsForm');
    document.querySelector('#questsId').value = game.id;
    // Update action when quests page is ready.
    // questsForm.action = '/???';

    // Review Button
    let reviewsForm = document.querySelector('#reviewsForm');
    document.querySelector('#reviewsId').value = game.id;
    // Update action when reviews page is ready.
    // reviewsForm.action = '/???';

    // Image
    let img = document.querySelector('#gameImgContainer');
    img.innerHTML = `<img
        id='gameImg' 
        src='${game.background_image}' 
        alt='${game.name}'>`;

    // Description
    let desc = document.querySelector('#gameDesc');
    desc.innerHTML = game.description;

    // Release Date
    let release = document.querySelector('#release');
    release.innerHTML = `<h3>Release Date</h3> ${game.released}`;

    // Ratings
    // Fill and sort ratings array
    let titles = ['exceptional', 'recommended', 'meh', 'skip'];
    let ratings = ['Exceptional', 'Recommended', 'Meh', 'Skip'];
    for (let i = 0; i < game.ratings.length; i++) {
        // Get Rating
        let rating = game.ratings[i];

        // Get rating index
        let index = titles.indexOf(rating.title);

        // Update rating array
        ratings[index] += `: ${rating.count} (${rating.percent}%)`;
    }

    // Update ratingsContainer
    let ratingsContainer = document.querySelector('#ratings');
    ratingsContainer.innerHTML = '<h3>Ratings</h3>';
    if (game.ratings.length == 0) {
        ratingsContainer.innerHTML += 'None';
    } else {
        for (let i = 0; i < ratings.length; i++) {
            ratingsContainer.innerHTML += `
                ${ratings[i]}
                <br>`;
        }
    }

    // Developers
    let developers = document.querySelector('#developers');
    developers.innerHTML = '<h3>Developers</h3>';
    if (game.developers.length == 0) {
        developers.innerHTML += 'None';
    } else {
        for (let i = 0; i < game.developers.length; i++) {
            let developer = game.developers[i];
            developers.innerHTML += `${developer.name}<br>`;
        }
    }

    // Publishers
    let publishers = document.querySelector('#publishers');
    publishers.innerHTML = '<h3>Publishers</h3>';
    if (game.publishers.length == 0) {
        publishers.innerHTML += 'None';
    } else {
        for (let i = 0; i < game.publishers.length; i++) {
            let publisher = game.publishers[i];
            publishers.innerHTML += `${publisher.name}<br>`;
        }
    }
    
    // Genres
    let genres = document.querySelector('#genres');
    genres.innerHTML = '<h3>Genres</h3>';
    if (game.genres.length == 0) {
        genres.innerHTML += 'None';
    } else {
        for (let i = 0; i < game.genres.length; i++) {
            let genre = game.genres[i];
            genres.innerHTML += `${genre.name}<br>`
        }
    }
    
} // displayGameDetails

/**
 * Looks for game information in local storage,
 *  then from the API if no game was found.
 * Author: Noah deFer
 * @returns A JSON of game information (or false if the game was not found.)
 */
async function getGameDetails() {
    // Get game name
    let name = document.querySelector("#search").value.trim();

    // Check Local Storage
    let data = await getGameFromStorage(name);

    // Check API, build JSON from response, store JSON in local storage.
    if(!data) {
        let json = await getGameFromAPI(name);
        // Check if game was found.
        if (typeof json.detail !== 'undefined' && json.detail == 'Not found.') {
            console.log(`${name} not found.`)
            return false;
        } 
        // Build JSON and store it in local storage.
        data = buildGameObject(json);
        storeGame(data);
    } 
    else {
        console.log(`Found ${name} in local storage!`);
    }

    // Return Game Details
    return data;
} // getGameDetails

/**
 * Fetches game data from the website API.
 * Author: Noah deFer
 * @param {String} name The name of a game.
 * @returns A JSON of game data (or false if game was not found.)
 */
async function getGameFromAPI(name) {
    // Print message
    console.log(`Getting ${name} from API...`);

    // Slugify name
    name = slugify(name);

    // Fetch game
    let response = await fetch(`/api/game/${name}`);
    data = await response.json();

    return data;
} // getGameFromAPI

/**
 * Attempts to get game data from local storage.
 * Author: Noah deFer
 * @param {String} name The name of a game.
 * @returns A JSON of game data (or false if game was not found.)
 */
async function getGameFromStorage(name) {
    console.log(`Looking for ${name} in local storage...`);
    try {
        // Get and parse local storage data.
        let storage = localStorage.getItem(`GameQuest/Game/${name}`);
        let data = await JSON.parse(storage);

        // Return data.
        return data;
    } catch (err) {
        // Print error message and return.
        console.error(`Error getting ${name} from local storage.`, err);
        return false;
    }
}

/**
 * Checks if the passed in game id is in the user's collection.
 * Author: Noah deFer
 * @param {Integer} id The id of a game.
 * @returns True = in collection, False = not in collection
 */
async function isCollected(id) {
    // Check database
    let response = await fetch(`/api/is-collected/${id}`);
    let data = await response.json();

    // Check length of response
    if (data.length > 0) {
        return true;
    } else {
        return false;
    }
} // isCollected

/**
 * Checks if the passed in game id is favorited by the user.
 * Author: Noah deFer
 * @param {Integer} id The id of a game.
 * @returns True = favorited, False = not favorited
 */
async function isFavorite(id) {
    // Check database
    let response = await fetch(`/api/is-favorite/${id}`);
    let data = await response.json();

    // Check length of response
    if (data.length > 0) {
        return true;
    } else {
        return false;
    }
} // isFavorite

/**
 * Reformats the passed in string to match RAWG API formatting.
 * Author: Noah deFer
 * @param {String} str The string to be formated.
 * @returns A formatted string.
 */
function slugify(str) {
    // Convert str to lowercase
    str = str.toLowerCase();

    // Replace ' ' with '-'
    str = str.replace(/\s/g, '-');

    // Remove special characters
    str = str.replace(/[^\w-]/g, '');

    // Return str
    console.log(`Slug: ${str}`);
    return str;
} // slugify

/**
 * Stores a JSON of game data in local storage.
 * Author: Noah deFer
 * @param {JSON} game A JSON of game data.
 */
function storeGame(game) {
    // Store Game Details in Local Storage
    console.log(`Storing ${game.name} into local storage...`);
    localStorage.setItem(`GameQuest/Game/${game.name}`, JSON.stringify(game));
    console.log(`Stored ${game.name} in local storage!`);
} // storeGame