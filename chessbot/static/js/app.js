/**
 * Main application logic for the Chess Bot Platform dashboard
 */

// ==================== STATE ====================
let allBots = [];
let allMatches = [];
let allTournaments = [];
let currentMatchPage = 1;
const MATCHES_PER_PAGE = 6;

// ==================== INITIALIZATION ====================
async function initialize() {
  try {
    await loadBots();
    await loadLeaderboard();
    await loadRecentMatches();
    await loadTournaments();
    await loadMatches();
    
    attachEventListeners();
    updateStats();
  } catch (error) {
    console.error("Initialization error:", error);
    showNotification("Error loading data: " + error.message, "danger");
  }
}

// ==================== BOT MANAGEMENT ====================
async function loadBots() {
  try {
    allBots = await apiGet("/api/bots");
    renderBots();
    updateBotSelects();
  } catch (error) {
    console.error("Error loading bots:", error);
    showNotification("Failed to load bots", "danger");
  }
}

function renderBots() {
  const botsList = document.getElementById("bots-list");
  if (!botsList) return;
  
  if (allBots.length === 0) {
    botsList.innerHTML = '<p class="text-center text-muted" style="grid-column: 1/-1;">No bots registered yet.</p>';
    return;
  }
  
  botsList.innerHTML = allBots
    .map((bot) =>
      `<div class="card">
        <div class="card-header">
          🤖 ${bot.name}
          <span class="badge badge-primary">${bot.id.slice(0, 8)}...</span>
        </div>
        <div class="card-body">
          <div><strong>Command:</strong></div>
          <code style="font-size: 11px; word-break: break-all;">${bot.command.join(" ")}</code>
          <div style="margin-top: var(--spacing-md);">
            <strong>Registered:</strong> ${formatDate(bot.created_at)}
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-small btn-outline" data-bot-id="${bot.id}" onclick="viewBotStats('${bot.id}')">View Stats</button>
          <button class="btn btn-small btn-danger" data-bot-id="${bot.id}" onclick="deleteBot('${bot.id}')">Delete</button>
        </div>
      </div>`
    )
    .join("");
}

function updateBotSelects() {
  const selects = document.querySelectorAll("#quick-match-white, #quick-match-black, #tournament-bots-list");
  
  // Update quick match selects
  document.querySelectorAll("#quick-match-white, #quick-match-black").forEach((select) => {
    const currentValue = select.value;
    select.innerHTML = allBots
      .map((bot) => `<option value="${bot.id}">${bot.name}</option>`)
      .join("");
    if (currentValue) select.value = currentValue;
  });
  
  // Update tournament bot list
  const botsList = document.getElementById("tournament-bots-list");
  if (botsList) {
    botsList.innerHTML = allBots
      .map(
        (bot) =>
          `<label style="display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-sm); cursor: pointer; border-radius: var(--radius-md); transition: background 0.3s;">
            <input type="checkbox" class="tournament-bot-checkbox" value="${bot.id}">
            <span>${bot.name}</span>
          </label>`
      )
      .join("");
  }
}

async function registerBot() {
  const form = document.getElementById("register-bot-form");
  const name = document.getElementById("bot-name").value;
  const command = document.getElementById("bot-command").value.split(/\s+/);
  
  if (!name || command.length === 0) {
    showNotification("Please fill all fields", "warning");
    return;
  }
  
  try {
    showLoading(form.querySelector('button[type="submit"]'));
    await apiPost("/api/bots", { name, command });
    showNotification("Bot registered successfully!", "success");
    closeModal("register-bot-modal");
    resetForm(form);
    await loadBots();
  } catch (error) {
    showNotification("Error registering bot: " + error.message, "danger");
  } finally {
    hideLoading(form.querySelector('button[type="submit"]'));
  }
}

async function deleteBot(botId) {
  if (!confirm("Are you sure you want to delete this bot?")) return;
  
  try {
    // This endpoint doesn't exist yet, but we'll add it
    showNotification("Bot deletion will be available soon", "info");
  } catch (error) {
    showNotification("Error deleting bot: " + error.message, "danger");
  }
}

function viewBotStats(botId) {
  const bot = allBots.find((b) => b.id === botId);
  if (!bot) return;
  
  const stats = calculateBotStats(botId);
  showNotification(
    `${bot.name}: ${stats.wins}W - ${stats.losses}L - ${stats.draws}D | Win Rate: ${stats.winRate}%`,
    "info"
  );
}

// ==================== LEADERBOARD ====================
async function loadLeaderboard() {
  try {
    const standings = await apiGet("/api/leaderboard");
    renderLeaderboard(standings);
  } catch (error) {
    console.error("Error loading leaderboard:", error);
  }
}

function renderLeaderboard(standings) {
  const leaderboard = document.getElementById("leaderboard");
  if (!leaderboard) return;
  
  if (!standings || standings.length === 0) {
    leaderboard.innerHTML = '<tr class="text-center"><td colspan="7">No standings yet</td></tr>';
    return;
  }
  
  leaderboard.innerHTML = standings
    .map(
      (row, index) => `
    <tr>
      <td style="text-align: center; font-weight: 700; color: var(--color-primary);">
        ${index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
      </td>
      <td><strong>${row.name}</strong></td>
      <td style="text-align: center; color: var(--color-success);">${row.wins}</td>
      <td style="text-align: center; color: var(--color-danger);">${row.losses}</td>
      <td style="text-align: center; color: var(--color-warning);">${row.draws}</td>
      <td style="text-align: center; font-weight: bold; color: var(--color-primary);">${row.points}</td>
      <td style="text-align: center;">${((row.wins / (row.wins + row.losses + row.draws || 1)) * 100).toFixed(1)}%</td>
    </tr>
    `
    )
    .join("");
}

// ==================== MATCHES ====================
async function loadRecentMatches() {
  try {
    const matches = await apiGet("/api/leaderboard");
    // Placeholder - we'll add a dedicated endpoint
  } catch (error) {
    console.error("Error loading recent matches:", error);
  }
}

async function loadMatches() {
  try {
    // This would need a dedicated endpoint from the backend
    allMatches = [];
  } catch (error) {
    console.error("Error loading matches:", error);
  }
}

function renderMatches() {
  const matchesList = document.getElementById("matches-list");
  if (!matchesList) return;
  
  if (allMatches.length === 0) {
    matchesList.innerHTML = '<p class="text-center text-muted" style="grid-column: 1/-1;">No matches found.</p>';
    return;
  }
  
  const startIdx = (currentMatchPage - 1) * MATCHES_PER_PAGE;
  const endIdx = startIdx + MATCHES_PER_PAGE;
  const paginatedMatches = allMatches.slice(startIdx, endIdx);
  
  matchesList.innerHTML = paginatedMatches
    .map(
      (match) => `
    <div class="card">
      <div class="card-header">
        ${match.white_bot_id} vs ${match.black_bot_id}
        ${getResultBadge(match.result)}
      </div>
      <div class="card-body">
        <div><strong>Moves:</strong> ${match.moves.length}</div>
        <div><strong>Duration:</strong> ${formatDuration(match.duration_s)}</div>
        <div><strong>Date:</strong> ${formatDate(match.created_at)}</div>
      </div>
      <div class="card-footer">
        <a href="/matches/${match.id}" class="btn btn-small btn-outline">View Match</a>
      </div>
    </div>
    `
    )
    .join("");
  
  const totalPages = Math.ceil(allMatches.length / MATCHES_PER_PAGE);
  renderPagination(currentMatchPage, totalPages, (page) => {
    currentMatchPage = page;
    renderMatches();
  });
}

async function runQuickMatch() {
  const form = document.getElementById("quick-match-form");
  const whiteBotId = document.getElementById("quick-match-white").value;
  const blackBotId = document.getElementById("quick-match-black").value;
  const moveTimeout = parseFloat(document.getElementById("quick-match-timeout").value);
  const maxMoves = parseInt(document.getElementById("quick-match-maxmoves").value);
  
  if (whiteBotId === blackBotId) {
    showNotification("White and Black bots must be different", "warning");
    return;
  }
  
  try {
    showLoading(form.querySelector('button[type="submit"]'));
    const match = await apiPost("/api/matches", {
      white_bot_id: whiteBotId,
      black_bot_id: blackBotId,
      move_timeout_s: moveTimeout,
      max_moves: maxMoves,
    });
    
    showNotification("Match completed! Redirecting...", "success");
    setTimeout(() => {
      window.location.href = `/matches/${match.id}`;
    }, 1500);
  } catch (error) {
    showNotification("Error running match: " + error.message, "danger");
  } finally {
    hideLoading(form.querySelector('button[type="submit"]'));
  }
}

// ==================== TOURNAMENTS ====================
async function loadTournaments() {
  try {
    // This needs a dedicated API endpoint
    allTournaments = [];
    renderTournaments();
  } catch (error) {
    console.error("Error loading tournaments:", error);
  }
}

function renderTournaments() {
  const tournamentsList = document.getElementById("tournaments-list");
  if (!tournamentsList) return;
  
  if (allTournaments.length === 0) {
    tournamentsList.innerHTML = '<p class="text-center text-muted" style="grid-column: 1/-1;">No tournaments yet. Create one to get started!</p>';
    return;
  }
  
  tournamentsList.innerHTML = allTournaments
    .map(
      (tournament) => `
    <div class="card">
      <div class="card-header">
        🏆 ${tournament.name}
        <span class="badge badge-info">${tournament.rounds} rounds</span>
      </div>
      <div class="card-body">
        <div><strong>Bots:</strong> ${tournament.bot_ids.length}</div>
        <div><strong>Matches:</strong> ${tournament.matches.length}</div>
        <div><strong>Created:</strong> ${formatDate(tournament.created_at)}</div>
      </div>
      <div class="card-footer">
        <a href="/tournaments/${tournament.id}" class="btn btn-small btn-outline">View Tournament</a>
      </div>
    </div>
    `
    )
    .join("");
}

async function createTournament() {
  const form = document.getElementById("create-tournament-form");
  const name = document.getElementById("tournament-name").value;
  const rounds = parseInt(document.getElementById("tournament-rounds").value);
  const timeout = parseFloat(document.getElementById("tournament-timeout").value);
  
  const botCheckboxes = document.querySelectorAll(".tournament-bot-checkbox:checked");
  const bot_ids = Array.from(botCheckboxes).map((cb) => cb.value);
  
  if (!name || bot_ids.length < 2) {
    showNotification("Please enter tournament name and select at least 2 bots", "warning");
    return;
  }
  
  try {
    showLoading(form.querySelector('button[type="submit"]'));
    await apiPost("/api/tournaments", {
      name,
      bot_ids,
      rounds,
      move_timeout_s: timeout,
      max_moves: 200,
    });
    
    showNotification("Tournament created! It will run in the background.", "success");
    closeModal("create-tournament-modal");
    resetForm(form);
    await loadTournaments();
  } catch (error) {
    showNotification("Error creating tournament: " + error.message, "danger");
  } finally {
    hideLoading(form.querySelector('button[type="submit"]'));
  }
}

// ==================== SEARCH & FILTER ====================
function setupSearch() {
  // Bot search
  const botSearch = document.getElementById("bot-search");
  if (botSearch) {
    botSearch.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const botCards = document.querySelectorAll("#bots-list .card");
      botCards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(term) ? "" : "none";
      });
    });
  }
  
  // Tournament search
  const tournamentSearch = document.getElementById("tournament-search");
  if (tournamentSearch) {
    tournamentSearch.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const tournamentCards = document.querySelectorAll("#tournaments-list .card");
      tournamentCards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(term) ? "" : "none";
      });
    });
  }
  
  // Match filter
  const matchFilter = document.getElementById("match-filter-result");
  if (matchFilter) {
    matchFilter.addEventListener("change", (e) => {
      const result = e.target.value;
      const matchCards = document.querySelectorAll("#matches-list .card");
      matchCards.forEach((card) => {
        if (!result || card.textContent.includes(result)) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  }
}

// ==================== STATS ====================
function updateStats() {
  const stats = {
    matches: 0, // Would come from API
    bots: allBots.length,
    tournaments: allTournaments.length,
    avgMoves: 0, // Would calculate from matches
  };
  
  document.getElementById("stats-matches").textContent = stats.matches;
  document.getElementById("stats-bots").textContent = stats.bots;
  document.getElementById("stats-tournaments").textContent = stats.tournaments;
  document.getElementById("stats-avg-moves").textContent = stats.avgMoves || "—";
}

function calculateBotStats(botId) {
  // This would calculate from match history
  return { wins: 0, losses: 0, draws: 0, winRate: 0 };
}

// ==================== EVENT LISTENERS ====================
function attachEventListeners() {
  // Modal buttons
  document.getElementById("register-bot-btn")?.addEventListener("click", () => {
    openModal("register-bot-modal");
  });
  
  document.getElementById("create-tournament-btn")?.addEventListener("click", () => {
    openModal("create-tournament-modal");
  });
  
  // Forms
  document.getElementById("register-bot-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    registerBot();
  });
  
  document.getElementById("create-tournament-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    createTournament();
  });
  
  document.getElementById("quick-match-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    runQuickMatch();
  });
  
  // Search & Filter
  setupSearch();
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", initialize);

