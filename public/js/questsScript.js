/**
 * questsScript.js - Client-side JavaScript for Quests page
 * Author: Jian Mitchell
 */

let allQuests = [];

document.addEventListener('DOMContentLoaded', function() {
  loadQuests();
  setupEventListeners();
});

/**
 * Sets up event listeners
 */
function setupEventListeners() {
  // Filter listeners - status filters
  const statusFilters = document.querySelectorAll('.status-filter');
  for (let i = 0; i < statusFilters.length; i++) {
    statusFilters[i].addEventListener('change', filterQuests);
  }

  // Filter listeners - difficulty filters
  const difficultyFilters = document.querySelectorAll('.difficulty-filter');
  for (let i = 0; i < difficultyFilters.length; i++) {
    difficultyFilters[i].addEventListener('change', filterQuests);
  }

  document.getElementById('sortBy').addEventListener('change', filterQuests);
}

/**
 * Loads all user quests
 */
async function loadQuests() {
  try {
    const response = await fetch('/api/user-quests');
    const data = await response.json();
    //console.log(data);

    allQuests = data;
    displayQuests(data);
  } catch (error) {
    console.error('Error loading quests:', error);
    document.getElementById('questsList').innerHTML = '<p class="error">Failed to load quests.</p>';
  }
}

/**
 * Displays quests in the UI
 */
function displayQuests(quests) {
  const questsList = document.getElementById('questsList');

  if (quests.length === 0) {
    questsList.innerHTML = '<p class="no-quests">No quests found. Create your first quest!</p>';
    return;
  }

  let html = '<div class="quests-grid">';

  for (let i = 0; i < quests.length; i++) {
    const quest = quests[i];

    let statusClass = '';
    if (quest.status === 'not_started') {
      statusClass = 'not-started';
    } else if (quest.status === 'in_progress') {
      statusClass = 'in-progress';
    } else {
      statusClass = quest.status;
    }

    const difficultyClass = quest.difficulty;

    html += `
      <div class="quest-card ${statusClass} ${difficultyClass}" data-quest-id="${quest.quest_id}">
        <div class="quest-header">
          <h3>${quest.quest_name}</h3>
          <span class="difficulty-badge ${difficultyClass}">
            ${capitalize(quest.difficulty)}
          </span>
        </div>

        <p class="quest-game"><strong>Game:</strong> ${quest.game_name || 'Unknown'}</p>
        <p class="quest-desc">${quest.quest_desc}</p>

        <div class="quest-footer">
          <span class="status-badge ${statusClass}">
            ${formatStatus(quest.status)}
          </span>
          <a href="/quest/${quest.quest_id}" class="edit-btn">Edit</a>
        </div>

        <div class="quest-dates">
          <small>Created: ${formatDate(quest.created_at)}</small>
          ${quest.started_at ? `<small>Started: ${formatDate(quest.started_at)}</small>` : ''}
          ${quest.ended_at ? `<small>Completed: ${formatDate(quest.ended_at)}</small>` : ''}
        </div>
      </div>
    `;
  }

  questsList.innerHTML = html;
}

/**
 * Filters and sorts quests based on user selections
 * The following was inspired by stackoverflow's way of getting checkboxes into an array
 * link: https://stackoverflow.com/questions/590018/getting-all-selected-checkboxes-in-an-array
 */
function filterQuests() {
  if (!allQuests || allQuests.length === 0) return;

  const selectedStatuses = [];
  const statusCheckboxes = document.querySelectorAll('.status-filter:checked');
  for (let i = 0; i < statusCheckboxes.length; i++) {
    selectedStatuses[selectedStatuses.length] = statusCheckboxes[i].value;
  }

  const selectedDifficulties = [];
  const difficultyCheckboxes = document.querySelectorAll('.difficulty-filter:checked');
  for (let i = 0; i < difficultyCheckboxes.length; i++) {
    selectedDifficulties[selectedDifficulties.length] = difficultyCheckboxes[i].value;
  }

  const filtered = [];
  for (let i = 0; i < allQuests.length; i++) {
    const quest = allQuests[i];

    let statusMatch = false;
    for (let j = 0; j < selectedStatuses.length; j++) {
      if (quest.status === selectedStatuses[j]) {
        statusMatch = true;
        break;
      }
    }

    let difficultyMatch = false;
    for (let j = 0; j < selectedDifficulties.length; j++) {
      if (quest.difficulty === selectedDifficulties[j]) {
        difficultyMatch = true;
        break;
      }
    }

    if (statusMatch && difficultyMatch) {
      filtered[filtered.length] = quest;
    }
  }

  const sortBy = document.getElementById('sortBy').value;
  const sorted = sortQuests(filtered, sortBy);

  displayQuests(sorted);
}

/**
 * Sorts quests array
 * The following was inspired by GeeksforGeeks Bubble sort
 * link: https://www.geeksforgeeks.org/bubble-sort/
 */
function sortQuests(quests, sortBy) {
  const sorted = [];

  for (let i = 0; i < quests.length; i++) {
    sorted[i] = quests[i];
  }

  if (sortBy === 'created_desc') {
    // Bubble sort - newest first
    for (let i = 0; i < sorted.length - 1; i++) {
      for (let j = 0; j < sorted.length - i - 1; j++) {
        const date1 = new Date(sorted[j].created_at);
        const date2 = new Date(sorted[j + 1].created_at);
        if (date1 < date2) {
          const temp = sorted[j];
          sorted[j] = sorted[j + 1];
          sorted[j + 1] = temp;
        }
      }
    }
  } else if (sortBy === 'created_asc') {
    // Bubble sort - oldest first
    for (let i = 0; i < sorted.length - 1; i++) {
      for (let j = 0; j < sorted.length - i - 1; j++) {
        const date1 = new Date(sorted[j].created_at);
        const date2 = new Date(sorted[j + 1].created_at);
        if (date1 > date2) {
          const temp = sorted[j];
          sorted[j] = sorted[j + 1];
          sorted[j + 1] = temp;
        }
      }
    }
  } else if (sortBy === 'name_asc') {
    // Bubble sort - A to Z
    for (let i = 0; i < sorted.length - 1; i++) {
      for (let j = 0; j < sorted.length - i - 1; j++) {
        if (sorted[j].quest_name > sorted[j + 1].quest_name) {
          const temp = sorted[j];
          sorted[j] = sorted[j + 1];
          sorted[j + 1] = temp;
        }
      }
    }
  } else if (sortBy === 'name_desc') {
    // Bubble sort - Z to A
    for (let i = 0; i < sorted.length - 1; i++) {
      for (let j = 0; j < sorted.length - i - 1; j++) {
        if (sorted[j].quest_name < sorted[j + 1].quest_name) {
          const temp = sorted[j];
          sorted[j] = sorted[j + 1];
          sorted[j + 1] = temp;
        }
      }
    }
  } else if (sortBy === 'difficulty') {
    // Bubble sort by difficulty
    for (let i = 0; i < sorted.length - 1; i++) {
      for (let j = 0; j < sorted.length - i - 1; j++) {
        const diff1 = getDifficultyValue(sorted[j].difficulty);
        const diff2 = getDifficultyValue(sorted[j + 1].difficulty);
        if (diff1 > diff2) {
          const temp = sorted[j];
          sorted[j] = sorted[j + 1];
          sorted[j + 1] = temp;
        }
      }
    }
  }

  return sorted;
}

function getDifficultyValue(difficulty) {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'medium') return 2;
  if (difficulty === 'hard') return 3;
  return 0;
}

function formatStatus(status) {
  if (status === 'not_started') {
    return 'Not Started';
  } else if (status === 'in_progress') {
    return 'In Progress';
  } else if (status === 'completed') {
    return 'Completed';
  }
  return status;
}

function capitalize(str) {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}