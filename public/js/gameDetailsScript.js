// Add Event Listeners
document.querySelector('#searchBtn').addEventListener('click', displayGameDetails);

// Functions
async function displayGameDetails() {
    // Get Game Details
    let game = await getGameDetails();

    // Display game details
    // Image
    let img = document.querySelector('#gameImgContainer');
    img.innerHTML = `<img
        id='gameImg' 
        src='${game.background_image}' 
        alt='${game.name}'>`;

    // Description

    // Release Date

    // Ratings

    // Developer

    // Genres
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