/**
 * Admin panel logic
 */

let adminBots = [];
let adminMatches = [];
let adminTournaments = [];

async function initializeAdmin() {
  try {
    await loadAdminBots();
    await loadAdminMatches();
    await loadAdminTournaments();
    attachAdminEventListeners();
    updateAdminStats();
    startActivityMonitoring();
  } catch (error) {
    console.error("Admin initialization error:", error);
    showNotification("Error loading admin data: " + error.message, "danger");
  }
}

// ==================== BOTS MANAGEMENT ====================
async function loadAdminBots() {
  try {
    adminBots = await apiGet("/api/bots");
    renderAdminBots();
  } catch (error) {
    console.error("Error loading bots:", error);
    showNotification("Failed to load bots", "danger");
  }
}

function renderAdminBots() {
  const botsList = document.getElementById("admin-bots-list");
  if (!botsList) return;
  
  if (adminBots.length === 0) {
    botsList.innerHTML = '<tr class="text-center"><td colspan="5">No bots registered</td></tr>';
    return;
  }
  
  botsList.innerHTML = adminBots
    .map(
      (bot) => `
    <tr>
      <td><strong>${bot.name}</strong></td>
      <td><code style="font-size: 11px;">${bot.command.join(" ")}</code></td>
      <td>${formatDate(bot.created_at)}</td>
      <td>
        <span class="badge badge-info">Calculating...</span>
      </td>
      <td>
        <button class="btn btn-small btn-outline" onclick="viewAdminBotDetails('${bot.id}')">Details</button>
        <button class="btn btn-small btn-danger" onclick="deleteAdminBot('${bot.id}')">Delete</button>
      </td>
    </tr>
    `
    )
    .join("");
}

async function registerAdminBot() {
  const form = document.getElementById("admin-register-bot-form");
  const name = document.getElementById("admin-bot-name").value;
  const command = document.getElementById("admin-bot-command").value.split(/\s+/);
  
  if (!name || command.length === 0) {
    showNotification("Please fill all fields", "warning");
    return;
  }
  
  try {
    showLoading(form.querySelector('button[type="submit"]'));
    await apiPost("/api/bots", { name, command });
    showNotification("Bot registered successfully!", "success");
    closeModal("admin-register-bot-modal");
    resetForm(form);
    await loadAdminBots();
    addLog(`Bot "${name}" registered`);
  } catch (error) {
    showNotification("Error: " + error.message, "danger");
  } finally {
    hideLoading(form.querySelector('button[type="submit"]'));
  }
}

async function deleteAdminBot(botId) {
  if (!confirm("Are you sure you want to delete this bot?")) return;
  
  const bot = adminBots.find((b) => b.id === botId);
  showNotification("Bot deletion will be added in future versions", "info");
  addLog(`Attempted to delete bot: ${bot?.name || botId}`);
}

function viewAdminBotDetails(botId) {
  const bot = adminBots.find((b) => b.id === botId);
  if (!bot) return;
  
  showNotification(
    `Bot: ${bot.name}\nCommand: ${bot.command.join(" ")}\nID: ${botId}`,
    "info"
  );
}

// ==================== MATCHES MANAGEMENT ====================
async function loadAdminMatches() {
  try {
    // This would need a dedicated endpoint
    adminMatches = [];
    renderAdminMatches();
  } catch (error) {
    console.error("Error loading matches:", error);
  }
}

function renderAdminMatches() {
  const matchesList = document.getElementById("admin-matches-list");
  if (!matchesList) return;
  
  if (adminMatches.length === 0) {
    matchesList.innerHTML = '<tr class="text-center"><td colspan="7">No matches yet</td></tr>';
    return;
  }
  
  matchesList.innerHTML = adminMatches
    .map(
      (match) => `
    <tr>
      <td>${match.white_bot_id.slice(0, 8)}...</td>
      <td>${match.black_bot_id.slice(0, 8)}...</td>
      <td>${getResultBadge(match.result)}</td>
      <td>${match.moves.length}</td>
      <td>${formatDuration(match.duration_s)}</td>
      <td>${formatDate(match.created_at)}</td>
      <td>
        <a href="/matches/${match.id}" class="btn btn-small btn-outline">View</a>
      </td>
    </tr>
    `
    )
    .join("");
}

// ==================== TOURNAMENTS MANAGEMENT ====================
async function loadAdminTournaments() {
  try {
    // This would need a dedicated endpoint
    adminTournaments = [];
    renderAdminTournaments();
  } catch (error) {
    console.error("Error loading tournaments:", error);
  }
}

function renderAdminTournaments() {
  const tournamentsList = document.getElementById("admin-tournaments-list");
  if (!tournamentsList) return;
  
  if (adminTournaments.length === 0) {
    tournamentsList.innerHTML = '<div class="text-center text-muted">No tournaments created yet</div>';
    return;
  }
  
  tournamentsList.innerHTML = adminTournaments
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
        <button class="btn btn-small btn-outline" onclick="viewAdminTournament('${tournament.id}')">View Details</button>
        <button class="btn btn-small btn-danger" onclick="deleteAdminTournament('${tournament.id}')">Delete</button>
      </div>
    </div>
    `
    )
    .join("");
}

function viewAdminTournament(tournamentId) {
  const tournament = adminTournaments.find((t) => t.id === tournamentId);
  if (!tournament) return;
  
  showNotification(
    `Tournament: ${tournament.name}\nBots: ${tournament.bot_ids.length}\nMatches: ${tournament.matches.length}`,
    "info"
  );
}

async function deleteAdminTournament(tournamentId) {
  if (!confirm("Are you sure you want to delete this tournament?")) return;
  
  showNotification("Tournament deletion will be added in future versions", "info");
  addLog(`Attempted to delete tournament: ${tournamentId.slice(0, 8)}`);
}

// ==================== STATS ====================
function updateAdminStats() {
  document.getElementById("admin-total-bots").textContent = adminBots.length;
  document.getElementById("admin-total-matches").textContent = adminMatches.length;
  document.getElementById("admin-active-tournaments").textContent = adminTournaments.length;
  
  if (adminMatches.length > 0) {
    const avgMoves = (
      adminMatches.reduce((sum, m) => sum + m.moves.length, 0) / adminMatches.length
    ).toFixed(1);
    document.getElementById("admin-avg-moves").textContent = avgMoves;
  }
}

// ==================== ACTIVITY LOG ====================
const activityLog = [];

function addLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  activityLog.unshift(`[${timestamp}] ${message}`);
  
  // Keep only last 50 logs
  if (activityLog.length > 50) {
    activityLog.pop();
  }
  
  updateActivityLog();
}

function updateActivityLog() {
  const logContainer = document.getElementById("admin-activity-log");
  if (!logContainer) return;
  
  if (activityLog.length === 0) {
    logContainer.innerHTML = "<p class='text-muted'>No activity yet</p>";
    return;
  }
  
  logContainer.innerHTML = activityLog.map((log) => `<div>${log}</div>`).join("");
  logContainer.scrollTop = logContainer.scrollHeight;
}

function startActivityMonitoring() {
  // Add initial logs
  addLog("Admin panel started");
  addLog(`Loaded ${adminBots.length} bots`);
  addLog(`Loaded ${adminMatches.length} matches`);
  addLog(`Loaded ${adminTournaments.length} tournaments`);
  
  // Periodically refresh data
  setInterval(async () => {
    try {
      const newBots = await apiGet("/api/bots");
      if (newBots.length !== adminBots.length) {
        adminBots = newBots;
        renderAdminBots();
        updateAdminStats();
        addLog(`Bot count updated: ${adminBots.length}`);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, 5000);
}

// ==================== SETTINGS ====================
function loadAdminSettings() {
  const settings = JSON.parse(localStorage.getItem("adminSettings") || "{}");
  
  if (settings.defaultTimeout) {
    document.getElementById("admin-timeout-setting").value = settings.defaultTimeout;
  }
  if (settings.defaultMaxMoves) {
    document.getElementById("admin-max-moves-setting").value = settings.defaultMaxMoves;
  }
  if (settings.pollInterval) {
    document.getElementById("admin-poll-interval").value = settings.pollInterval;
  }
}

function saveAdminSettings() {
  const settings = {
    defaultTimeout: document.getElementById("admin-timeout-setting").value,
    defaultMaxMoves: document.getElementById("admin-max-moves-setting").value,
    pollInterval: document.getElementById("admin-poll-interval").value,
  };
  
  localStorage.setItem("adminSettings", JSON.stringify(settings));
  showNotification("Settings saved successfully!", "success");
  addLog("Admin settings updated");
}

// ==================== MAINTENANCE ====================
function clearMatchHistory() {
  if (!confirm("Are you sure you want to clear all match history? This cannot be undone!")) return;
  
  showNotification("Match history clearing will be available in future versions", "info");
  addLog("Attempted to clear match history");
}

function clearAllData() {
  if (!confirm("⚠ Are you absolutely sure you want to clear ALL data? This includes bots, matches, and tournaments!")) return;
  
  showNotification("Data clearing will be available in future versions", "info");
  addLog("Attempted to clear all data");
}

async function runDiagnostics() {
  try {
    addLog("Running diagnostics...");
    
    // Check API health
    const health = await apiGet("/api/health");
    addLog("✓ API health check passed");
    
    // Check bot count
    const bots = await apiGet("/api/bots");
    addLog(`✓ Found ${bots.length} bots`);
    
    // Check leaderboard
    const standings = await apiGet("/api/leaderboard");
    addLog(`✓ Leaderboard generated with ${standings.length} entries`);
    
    showNotification("Diagnostics completed successfully!", "success");
    addLog("Diagnostics completed");
  } catch (error) {
    showNotification("Diagnostics failed: " + error.message, "danger");
    addLog(`✗ Diagnostics failed: ${error.message}`);
  }
}

// ==================== EVENT LISTENERS ====================
function attachAdminEventListeners() {
  // Modal buttons
  document.getElementById("admin-register-bot")?.addEventListener("click", () => {
    openModal("admin-register-bot-modal");
  });
  
  document.getElementById("admin-create-tournament")?.addEventListener("click", () => {
    showNotification("Tournament creation will be available soon", "info");
  });
  
  // Forms
  document.getElementById("admin-register-bot-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    registerAdminBot();
  });
  
  // Search
  document.getElementById("admin-bot-search")?.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll("#admin-bots-table tbody tr").forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(term) ? "" : "none";
    });
  });
  
  document.getElementById("admin-match-search")?.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll("#admin-matches-table tbody tr").forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(term) ? "" : "none";
    });
  });
  
  // Load settings
  loadAdminSettings();
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", initializeAdmin);
