// Add Event Listeners
document.querySelector('#searchBtn').addEventListener('click', displayGameDetails);

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

    // Ratings
    let ratings = document.querySelector('#ratings');
    ratings.innerHTML = '<h3>Ratings</h3>';
    for (let i = 0; i < game.ratings.length; i++) {
        let rating = game.ratings[i];
        ratings.innerHTML += `
            ${rating.title}: ${rating.count} (${rating.percent}%)
            <br>`
    }

    // Developers
    let developers = document.querySelector('#developers');
    developers.innerHTML = '<h3>Developers</h3>';
    for (let i = 0; i < game.developers.length; i++) {
        let developer = game.developers[i];
        developers.innerHTML += `${developer.name}<br>`;
    }

    // Publishers
    let publishers = document.querySelector('#publishers');
    publishers.innerHTML = '<h3>Publishers</h3>';
    for (let i = 0; i < game.publishers.length; i++) {
        let publisher = game.publishers[i];
        publishers.innerHTML += `${publisher.name}<br>`;
    }

    // Genres
    let genres = document.querySelector('#genres');
    genres.innerHTML = '<h3>Genres</h3>';
    for (let i = 0; i < game.genres.length; i++) {
        let genre = game.genres[i];
        genres.innerHTML += `${genre.name}<br>`
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
    console.log(`Getting ${name} from API...`);
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