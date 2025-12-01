/**
 * homeScript.js - Client-side JavaScript for the Home page
 * Author: Jian Mitchell
 */

document.addEventListener('DOMContentLoaded', () => {
  loadFunFact();
  loadRecentGames();

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
    </div>
    `;
  }

  recentGamesContainer.innerHTML = html;
}

/**
 * Stores the last viewed game in localStorage (NOT IN USE)
 * @param {Object} game - Game object to store
 */
function storeLastViewedGame(game) {
  try {
    localStorage.setItem('lastViewedGame', JSON.stringify(game));
  } catch (error) {
    console.error('Error storing last viewed game:', error);
  }
}

/**
 * Retrieves the last viewed game from localStorage (NOT IN USE)
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

/**
 * Validates form input (NOT IN USE)
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
 * Displays a success message to the user (NOT IN USE)
 * @param {string} message - Success message to display
 * @param {HTMLElement} container - Container element to display message in
 */
function displaySuccess(message, container) {
  if (container) {
    container.innerHTML = `<p class="home-success">${message}</p>`;
  }
}