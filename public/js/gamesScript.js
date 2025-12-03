// Add Event Listeners

// Call functions
updateCollection();

// Functions
/**
 * Gets a list of games in the users collection.
 * Author: Noah deFer
 * @returns A JSON containing the games in the user's collecton.
 */
async function getCollection() {
    // Get user collection
    let response = await fetch('/api/user-collection');
    let data = await response.json();

    // Return data
    return data;
} // getCollection

/**
 * Populates the user's collection list.
 * Author: Noah deFer
 */
async function updateCollection() {
    // Get user collection
    let collection = await getCollection();
    
    // Update Collection container
    let collectionContainer = document.querySelector('#collection');
    for (let i = 0; i < collection.length; i++) {
        // Get game
        let game = collection[i];

        // Add game to collection container
        collectionContainer.innerHTML += `
            <a href='/game/${game.game_id}'>${game.game_name}</a>
            <br>`;
    }
} // updateCollection