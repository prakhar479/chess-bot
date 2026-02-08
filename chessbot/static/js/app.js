const botList = document.getElementById("bot-list");
const whiteSelect = document.getElementById("white-select");
const blackSelect = document.getElementById("black-select");
const matchResult = document.getElementById("match-result");
const leaderboard = document.getElementById("leaderboard");

async function fetchBots() {
  const response = await fetch("/api/bots");
  return response.json();
}

function renderBots(bots) {
  botList.innerHTML = bots.map(bot => `<p>${bot.name} (${bot.id})</p>`).join("");
  [whiteSelect, blackSelect].forEach(select => {
    select.innerHTML = bots
      .map(bot => `<option value="${bot.id}">${bot.name}</option>`)
      .join("");
  });
}

function renderLeaderboard(standings) {
  if (!standings || standings.length === 0) {
    leaderboard.innerHTML = "<p>No standings yet.</p>";
    return;
  }
  leaderboard.innerHTML = `
    <table>
      <thead>
        <tr><th>Bot</th><th>W</th><th>L</th><th>D</th><th>Pts</th></tr>
      </thead>
      <tbody>
        ${standings
          .map(
            row =>
              `<tr><td>${row.name}</td><td>${row.wins}</td><td>${row.losses}</td><td>${row.draws}</td><td>${row.points}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
}

async function runMatch() {
  matchResult.textContent = "Running match...";
  const response = await fetch("/api/matches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      white_bot_id: whiteSelect.value,
      black_bot_id: blackSelect.value,
      move_timeout_s: 2,
      max_moves: 80,
    }),
  });
  const match = await response.json();
  matchResult.innerHTML = `
    <p>Result: ${match.result}</p>
    <p><a href="/matches/${match.id}">View match</a></p>
  `;
  const standings = await fetch("/api/leaderboard").then(res => res.json());
  renderLeaderboard(standings);
}

async function load() {
  const bots = await fetchBots();
  renderBots(bots);
  const standings = await fetch("/api/leaderboard").then(res => res.json());
  renderLeaderboard(standings);
  document.getElementById("run-match").addEventListener("click", runMatch);
}

load();
