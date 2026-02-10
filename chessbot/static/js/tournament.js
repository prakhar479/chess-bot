/**
 * Tournament details page logic
 */

let tournamentData = null;

async function initializeTournament() {
  try {
    await loadTournament();
    renderTournamentInfo();
    attachTournamentListeners();
  } catch (error) {
    console.error("Error initializing tournament:", error);
    showNotification("Error loading tournament: " + error.message, "danger");
  }
}

async function loadTournament() {
  const tournamentId = window.location.pathname.split("/").pop();
  
  try {
    tournamentData = await apiGet(`/api/tournaments/${tournamentId}`);
  } catch (error) {
    throw error;
  }
}

function renderTournamentInfo() {
  if (!tournamentData) return;
  
  document.getElementById("tournament-title").textContent = tournamentData.name;
  document.getElementById("tournament-name").textContent = tournamentData.name;
  document.getElementById("tournament-bot-count").textContent = tournamentData.bot_ids.length;
  document.getElementById("tournament-rounds").textContent = tournamentData.rounds;
  document.getElementById("tournament-created").textContent = formatDate(tournamentData.created_at);
  document.getElementById("tournament-timeout").textContent = tournamentData.move_timeout_s + "s";
  document.getElementById("tournament-max-moves").textContent = tournamentData.max_moves;
  document.getElementById("tournament-total-matches").textContent = tournamentData.matches.length;
  
  // Render standings
  if (tournamentData.standings && tournamentData.standings.length > 0) {
    renderStandings();
  }
  
  // Render participants
  renderParticipants();
  
  // Render matches
  renderTournamentMatches();
}

function renderStandings() {
  const tbody = document.getElementById("standings-body");
  if (!tbody) return;
  
  tbody.innerHTML = tournamentData.standings
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

function renderParticipants() {
  const container = document.getElementById("tournament-participants");
  if (!container) return;
  
  if (!tournamentData.bot_ids || tournamentData.bot_ids.length === 0) {
    container.innerHTML = '<div class="text-center text-muted" style="grid-column: 1/-1;">No participants</div>';
    return;
  }
  
  container.innerHTML = tournamentData.bot_ids
    .map(
      (botId) => {
        const standing = tournamentData.standings.find((s) => s.bot_id === botId);
        return `
      <div class="card">
        <div class="card-header">
          🤖 ${standing?.name || "Unknown"}
          <span class="badge badge-info">${botId.slice(0, 8)}...</span>
        </div>
        <div class="card-body">
          <div class="flex-between mb-md">
            <span>Wins</span>
            <strong style="color: var(--color-success);">${standing?.wins || 0}</strong>
          </div>
          <div class="flex-between mb-md">
            <span>Losses</span>
            <strong style="color: var(--color-danger);">${standing?.losses || 0}</strong>
          </div>
          <div class="flex-between">
            <span>Draws</span>
            <strong style="color: var(--color-warning);">${standing?.draws || 0}</strong>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-small btn-outline" onclick="viewBotMatches('${botId}')">View Matches</button>
        </div>
      </div>
      `;
      }
    )
    .join("");
}

function renderTournamentMatches() {
  const container = document.getElementById("tournament-matches");
  if (!container) return;
  
  if (!tournamentData.matches || tournamentData.matches.length === 0) {
    container.innerHTML = '<div class="text-center text-muted" style="grid-column: 1/-1;">No matches played yet</div>';
    return;
  }
  
  // Show placeholder - in a real implementation, we'd fetch match details
  container.innerHTML = `
    <div class="text-center text-muted" style="grid-column: 1/-1;">
      <p>${tournamentData.matches.length} matches in this tournament</p>
      <p class="text-small">Match details will be available soon</p>
    </div>
  `;
}

function viewBotMatches(botId) {
  showNotification(`Viewing matches for bot ${botId.slice(0, 8)}...`, "info");
}

function exportTournamentData() {
  const data = JSON.stringify(tournamentData, null, 2);
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
  element.setAttribute("download", `tournament-${tournamentData.id}.json`);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  
  showNotification("Tournament data exported successfully!", "success");
}

function attachTournamentListeners() {
  // Panel switching
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tabName = btn.getAttribute("data-tab");
      
      // Remove active from all
      document.querySelectorAll(".tab-btn").forEach((b) => {
        b.classList.remove("active");
        b.style.borderBottomColor = "transparent";
        b.style.color = "var(--text-secondary)";
      });
      document.querySelectorAll(".tab-content").forEach((t) => {
        t.classList.remove("active");
        t.style.display = "none";
      });
      
      // Add active to selected
      btn.classList.add("active");
      btn.style.borderBottomColor = "var(--color-primary)";
      btn.style.color = "var(--color-primary)";
      document.getElementById(`${tabName}-tab`).classList.add("active");
      document.getElementById(`${tabName}-tab`).style.display = "block";
    });
  });
}

document.addEventListener("DOMContentLoaded", initializeTournament);
