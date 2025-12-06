/**
 * questsDetailsScript.js - Client-side JavaScript for Quests page
 * Author: Jian Mitchell
 */

document.addEventListener('DOMContentLoaded', () => {
  loadGameName();
  setupEventListeners();
});

/**
 * Sets up event listeners
 */
function setupEventListeners() {
  const modal = document.getElementById('deleteModal');

  document.getElementById('deleteQuestBtn').addEventListener('click', function() {
    modal.style.display = 'flex';
  });

  document.getElementById('cancelDeleteBtn').addEventListener('click', function() {
    modal.style.display = 'none';
  });

  document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    document.getElementById('deleteForm').submit();
  });

  modal.addEventListener('click', function(e) {
    if (e.target.id === 'deleteModal') {
      modal.style.display = 'none';
    }
  });

  document.getElementById('status').addEventListener('change', (e) => {
    const status = e.target.value;
    const startedAt = document.getElementById('startedAt');
    const endedAt = document.getElementById('endedAt');
    const today = new Date().toISOString().split('T')[0];

    if (status === 'in_progress' && !startedAt.value) {
      startedAt.value = today;
    }

    if (status === 'completed' && !endedAt.value) {
      endedAt.value = today;
    }
  });
}

/**
 * Loads the game name
 */
async function loadGameName() {
  try {
    const response = await fetch(`/api/quest/${questId}`);
    const data = await response.json();
    //console.log(data);

    if (data && data.game_name) {
      document.getElementById('gameName').textContent = data.game_name;
    } else {
      document.getElementById('gameName').textContent = 'Unknown Game';
    }
  } catch (error) {
    console.error('Error loading game name:', error);
    document.getElementById('gameName').textContent = 'Error loading game';
  }
}