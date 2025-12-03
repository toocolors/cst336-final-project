/**
 * homeScript.js - Client-side JavaScript for the Home page
 * Author: Jian Mitchell
 */

document.addEventListener('DOMContentLoaded', () => {
  loadFunFact();
  loadRecentGames();
  displayLastViewedGame();

  setupEventListeners();
});

/**
 * Sets up event listeners for interactive elements
 */
function setupEventListeners() {
  const newFactBtn = document.getElementById('newFactBtn');
  if (newFactBtn) {
    newFactBtn.addEventListener('click', loadFunFact);
  }
}

/**
 * Fetches and displays a random fun fact from the API
 * API: https://uselessfacts.jsph.pl/api/v2/facts/random?language=en
 */
async function loadFunFact() {
  const factContainer = document.getElementById('factContainer');

  try {
    factContainer.innerHMl = '<p class="loading">Loading fun fact...</p>';

    const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
    const data = await response.json();

    //console.log('Fetching data:', data);

    if (!response.ok) {
      console.error('Failed to fetch fun fact');
    }

    if (data && data.text) {
      factContainer.innerHTML = `<p>${data.text}</p>`;
    } else {
      console.error('Invalid data');
    }

  } catch (error) {
    console.error('Error loading fun fact:', error);
    factContainer.innerHTML = '<p class="error">Could not load fun fact!</p>';
  }
}

/**
 * Loads recent games from the server
 * This will be populated from the database via an API endpoint
 */
async function loadRecentGames() {
  const recentGamesContainer = document.getElementById('recentGames');

  try {
    recentGamesContainer.innerHTML = '<p class="loading">Loading recent games...</p>';

    const response = await fetch('/api/recent-games');
    const data = await response.json();
    // console.log('Get games:', data);

    if (!response.ok) {
      console.error('Failed to fetch recent games');
    }

    if (data && data.length > 0) {
      displayRecentGames(data);
    } else {
      recentGamesContainer.innerHTML = '<p>No recent games to display. Add games to your collection!</p>'
    }

  } catch (error) {
    console.error('Error loading recent games:', error);
    recentGamesContainer.innerHTML = '<p class="error">Could not load recent games.</p>';
  }
}

/**
 * Displays recent games in the UI
 * @param {Array} games - Array of game objects from the database
 */
function displayRecentGames(games) {
  const recentGamesContainer = document.getElementById('recentGames');

  let html = '';

  for (let i = 0; i < games.length; i++) {
    html += `
    <div class="home-game-item">
      <strong>${games[i].game_name}</strong>
      <button class="home-view-btn" onclick="viewGame(${games[i].game_id}, '${games[i].game_name}')">View</button>
    </div>
    `;
  }

  recentGamesContainer.innerHTML = html;
}

/**
 * Handles viewing a game (stores it as last viewed)
 * @param {number} gameId - The game's ID
 * @param {string} gameName - The game's name
 */
function viewGame(gameId, gameName) {
  const game = {
    game_id: gameId,
    game_name: gameName,
    viewed_at: new Date().toISOString()
  }

  storeLastViewedGame(game);

  displayLastViewedGame();

  const messageContainer = document.getElementById('homeMessage');

  if (messageContainer) {
    messageContainer.innerHTML = `Marked "${gameName}" as last viewed!`;
    messageContainer.className = 'home-message-container show success';

    setTimeout(() => {
      messageContainer.className = 'home-message-container'
    }, 3000);
  }
}

/**
 * Displays the last viewed game from localStorage
 */
function displayLastViewedGame() {
 const lastGame = getLastViewedGame();
 const recentActivitySection = document.querySelector('.home-recent-activity');

 const existingSection = document.getElementById('lastViewedSection');
 if (existingSection) {
   existingSection.remove();
 }

 if (lastGame) {
   const lastViewedHTML = `
   <div id="lastViewedSection" class="home-last-viewed">
        <h4 class="home-last-viewed-title">Continue Where You Left Off:</h4>
        <div class="home-last-viewed-game">
            <strong>${lastGame.game_name}</strong>
            <span class="home-last-viewed-time">Viewed: ${formatLastViewedTime(lastGame.viewed_at)}</span>
            <button class="home-clear-btn" onclick="clearLastViewedGame()">Clear</button>
        </div> 
   </div>
   `;

   recentActivitySection.innerHTML = lastViewedHTML + recentActivitySection.innerHTML;
 }
}

/**
 * Clears the last viewed game from localStorage
 */
function clearLastViewedGame() {
  try {
    localStorage.removeItem('lastViewedGame');
    displayLastViewedGame();
  } catch (error) {
    console.error('Error clearing last viewed game:', error);
  }
}

/**
 * Stores the last viewed game in localStorage
 * @param {Object} game - Game object to store
 */
function storeLastViewedGame(game) {
  try {
    localStorage.setItem('lastViewedGame', JSON.stringify(game));
  } catch (error) {
    console.error('Error storing last viewed game:', error);
  }
}

function formatLastViewedTime(isoString) {
  const viewedDate = new Date(isoString);
  const now = new Date();
  const diffMs = now - viewedDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return viewedDate.toLocaleDateString();
  }
}

/**
 * Retrieves the last viewed game from localStorage
 * @returns {Object|null} - Last viewed game object or null
 */
function getLastViewedGame() {
  try {
    const game = localStorage = localStorage.getItem('lastViewedGame');
    return game ? JSON.parse(game) : null;
  } catch (error) {
    console.error('Error retrieving last viewed game:', error);
    return null;
  }
}


// The following code below is for a form that may or may not get added

/**
 * Validates form input
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {boolean} - True if valid, false otherwise
 */
function validateInput(value, minLength = 1, maxLength = 255) {
  if (!value || value.trim().length < minLength) {
    return false;
  }

  if (value.length > maxLength) {
    return false;
  }

  return true;
}

/**
 * Displays an error message to the user
 * @param {string} message - Error message to display
 * @param {HTMLElement} container - Container element to display message in
 */
function displayError(message, container) {
  if (container) {
    container.innerHTML = `<p class="home-error">${message}</p>`;
  }
}

/**
 * Displays a success message to the user
 * @param {string} message - Success message to display
 * @param {HTMLElement} container - Container element to display message in
 */
function displaySuccess(message, container) {
  if (container) {
    container.innerHTML = `<p class="home-success">${message}</p>`;
  }
}

/**
 * Validates and displays a user input form (example usage)
 * @param {string} inputValue - The input to validate
 * @param {HTMLElement} messageContainer - Where to show messages
 * @returns {boolean} - Whether validation passed
 */

function validateAndDisplayMessage(inputValue, messageContainer) {
  if (!validateInput(inputValue, 3, 100)) {
    displayError('Input must be between 3-100 characters', messageContainer);
    return false;
  }

  displaySuccess('Input is valid!', messageContainer);
  return true;
}