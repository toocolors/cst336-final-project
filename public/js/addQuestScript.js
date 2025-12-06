/**
 * addQuestScript.js - Client-side JavaScript for Add Quest page
 * Author: Jian Mitchell
 */

document.addEventListener('DOMContentLoaded', function() {
  loadUserGames();
});

/**
 * Loads user's games into the dropdown
 */
async function loadUserGames() {
  try {
    const response = await fetch('/api/user-games');
    const data = await response.json();
    //console.log(data);

    const gameSelect = document.getElementById('gameId');
    let optionsHtml = '<option value="">-- Select a Game --</option>';

    for (let i = 0; i < data.length; i++) {
      optionsHtml += '<option value="' + data[i].game_id + '">' + data[i].game_name + '</option>';
    }

    gameSelect.innerHTML = optionsHtml;
  } catch (error) {
    console.error('Error loading games:', error);
  }
}