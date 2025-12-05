/**
 * homeScript.js - Client-side JavaScript for the Home page
 * Author: Jian Mitchell
 */

document.addEventListener('DOMContentLoaded', () => {
  loadFunFact();
  loadRecentActivity();
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
async function loadRecentActivity() {
  const recentGamesContainer = document.getElementById('recentGames');

  try {
    recentGamesContainer.innerHTML = '<p class="loading">Loading recent games...</p>';

    const response = await fetch('/api/current-user');
    const data = await response.json();
    const userId = data.user_id;
    // console.log('Get games:', data);

    const storageKey = 'GameQuest/RecentActivity/' + userId;
    const recentGamesData = localStorage.getItem(storageKey);

    if (recentGamesData) {
      const recentGames = JSON.parse(recentGamesData);

      if (recentGames.length > 0) {
        displayRecentGames(recentGames);
      } else {
        recentGamesContainer.innerHTML = '<p>No recent activity. Start viewing games to see them here!</p>';
      }
    } else {
      recentGamesContainer.innerHTML = '<p>No recent activity. Start viewing games to see them here!</p>';
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
    const activity = games[i];
    const timeAgo = formatLastViewedTime(activity.viewed_at);


    html += `
    <div class="home-game-item">
      <div>
        <strong>${activity.game_name}</strong> <br>
        <small class="home-time-ago">${timeAgo}</small>
      </div>
      <a href="/game/${activity.game_id}" class="home-view-btn">View</a>
    </div>
    `;
  }

  recentGamesContainer.innerHTML = html;
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