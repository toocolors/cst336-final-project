// Add Event Listeners
document.querySelector('#searchBtn').addEventListener('click', displayGameDetails);

// Functions
async function displayGameDetails() {
    // Get Game Details
    let game = await getGameDetails();

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
}

async function getGameDetails() {
    // Get game name
    let name = document.querySelector("#search").value.trim();

    // Check Local Storage

    // Check API
    let response = await fetch(`/api/game/${name}`);
    let data = await response.json();

    // Build JSON with desired details

    // Store Game Details in Local Storage

    // Return Game Details
    return data;
}