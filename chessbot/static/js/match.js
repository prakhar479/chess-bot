/**
 * Match viewer logic
 */

const pieceMap = {
  p: "♟",
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  P: "♙",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔",
};

let matchData = null;
let currentMoveIndex = 0;

// ==================== INITIALIZATION ====================
async function initializeMatchViewer() {
  try {
    await loadMatch();
    attachMatchEventListeners();
    renderBoard(matchData.fen_history[0]);
    updateMoveCounter();
  } catch (error) {
    console.error("Error initializing match viewer:", error);
    showNotification("Error loading match: " + error.message, "danger");
  }
}

// ==================== LOAD MATCH DATA ====================
async function loadMatch() {
  const matchId = window.location.pathname.split("/").pop();
  
  try {
    matchData = await apiGet(`/api/matches/${matchId}`);
    renderMatchInfo();
  } catch (error) {
    throw error;
  }
}

function renderMatchInfo() {
  const botWhite = matchData.white_bot_id.slice(0, 8);
  const botBlack = matchData.black_bot_id.slice(0, 8);
  
  document.getElementById("match-title").textContent = `${botWhite}... vs ${botBlack}...`;
  document.getElementById("match-header").textContent = `${botWhite}... vs ${botBlack}...`;
  document.getElementById("white-bot-name").textContent = botWhite + "...";
  document.getElementById("black-bot-name").textContent = botBlack + "...";
  
  // Result badge
  const resultEl = document.getElementById("match-result");
  resultEl.innerHTML = getResultBadge(matchData.result);
  
  // Stats
  document.getElementById("match-duration").textContent = formatDuration(matchData.duration_s);
  document.getElementById("match-moves-count").textContent = matchData.moves.length;
  document.getElementById("match-created").textContent = formatDate(matchData.created_at);
  
  // Update slider
  const slider = document.getElementById("move-slider");
  slider.max = matchData.fen_history.length - 1;
  
  // Render moves list
  renderMovesList();
  
  // Render PGN
  document.getElementById("pgn-text").value = matchData.pgn || "PGN not available";
  
  // Render FEN history
  renderFENHistory();
}

// ==================== BOARD RENDERING ====================
function fenToBoard(fen) {
  const [position] = fen.split(" ");
  const rows = position.split("/");
  const squares = [];
  
  rows.forEach((row) => {
    row.split("").forEach((char) => {
      if (Number.isInteger(parseInt(char, 10))) {
        for (let i = 0; i < parseInt(char, 10); i++) {
          squares.push("");
        }
      } else {
        squares.push(pieceMap[char] || "");
      }
    });
  });
  
  return squares;
}

function renderBoard(fen) {
  const boardEl = document.getElementById("board");
  const squares = fenToBoard(fen);
  
  boardEl.innerHTML = "";
  
  squares.forEach((piece, index) => {
    const square = document.createElement("div");
    const row = Math.floor(index / 8);
    const col = index % 8;
    
    square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
    square.textContent = piece;
    
    // Add labels for coordinates
    if (col === 0) {
      square.style.position = "relative";
      const label = document.createElement("span");
      label.textContent = 8 - row;
      label.style.position = "absolute";
      label.style.left = "2px";
      label.style.top = "2px";
      label.style.fontSize = "10px";
      label.style.opacity = "0.5";
      square.appendChild(label);
    }
    
    boardEl.appendChild(square);
  });
  
  // Add file labels
  const fileLabels = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const container = document.querySelector(".board");
  if (container) {
    const labelContainer = document.createElement("div");
    labelContainer.style.display = "grid";
    labelContainer.style.gridTemplateColumns = "repeat(8, 50px)";
    labelContainer.style.gap = "0";
    labelContainer.style.marginTop = "4px";
    labelContainer.style.textAlign = "center";
    labelContainer.style.fontSize = "10px";
    labelContainer.style.opacity = "0.5";
    labelContainer.innerHTML = fileLabels
      .map((label) => `<div style="padding: 2px 0;">${label}</div>`)
      .join("");
    container.parentNode.insertBefore(labelContainer, container.nextSibling);
  }
}

// ==================== MOVES ====================
function renderMovesList() {
  const moveList = document.getElementById("move-list");
  moveList.innerHTML = "";
  
  matchData.moves.forEach((move, index) => {
    const li = document.createElement("li");
    li.className = index === currentMoveIndex ? "active" : "";
    li.style.padding = "var(--spacing-sm)";
    li.style.cursor = "pointer";
    li.style.borderRadius = "var(--radius-md)";
    li.style.transition = "all 0.3s ease";
    
    if (index === currentMoveIndex) {
      li.style.backgroundColor = "var(--color-primary)";
      li.style.color = "#fff";
    }
    
    li.textContent = `${index + 1}. ${move}`;
    li.addEventListener("click", () => goToMove(index + 1));
    li.addEventListener("mouseover", () => {
      if (index !== currentMoveIndex) {
        li.style.backgroundColor = "var(--bg-tertiary)";
      }
    });
    li.addEventListener("mouseout", () => {
      if (index !== currentMoveIndex) {
        li.style.backgroundColor = "transparent";
      }
    });
    
    moveList.appendChild(li);
  });
}

function renderFENHistory() {
  const fenHistoryDiv = document.getElementById("fen-history");
  fenHistoryDiv.innerHTML = "";
  
  matchData.fen_history.forEach((fen, index) => {
    const div = document.createElement("div");
    div.style.padding = "var(--spacing-sm)";
    div.style.marginBottom = "var(--spacing-sm)";
    div.style.backgroundColor = "var(--bg-secondary)";
    div.style.borderRadius = "var(--radius-md)";
    div.style.cursor = "pointer";
    div.style.transition = "all 0.3s ease";
    
    div.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 4px;">Move ${index}</div>
      <code style="font-size: 11px; word-break: break-all; color: var(--text-secondary);">${fen}</code>
    `;
    
    div.addEventListener("click", () => goToMove(index));
    div.addEventListener("mouseover", () => {
      div.style.backgroundColor = "var(--bg-tertiary)";
    });
    div.addEventListener("mouseout", () => {
      div.style.backgroundColor = "var(--bg-secondary)";
    });
    
    fenHistoryDiv.appendChild(div);
  });
}

// ==================== NAVIGATION ====================
function goToMove(index) {
  currentMoveIndex = Math.max(0, Math.min(index, matchData.fen_history.length - 1));
  updateDisplay();
}

function nextMove() {
  if (currentMoveIndex < matchData.fen_history.length - 1) {
    currentMoveIndex++;
    updateDisplay();
  }
}

function prevMove() {
  if (currentMoveIndex > 0) {
    currentMoveIndex--;
    updateDisplay();
  }
}

function firstMove() {
  currentMoveIndex = 0;
  updateDisplay();
}

function lastMove() {
  currentMoveIndex = matchData.fen_history.length - 1;
  updateDisplay();
}

function updateDisplay() {
  renderBoard(matchData.fen_history[currentMoveIndex]);
  renderMovesList();
  updateMoveCounter();
  
  // Update slider
  document.getElementById("move-slider").value = currentMoveIndex;
}

function updateMoveCounter() {
  const moveNumber = Math.floor(currentMoveIndex / 2) + 1;
  const color = currentMoveIndex % 2 === 0 ? "White" : "Black";
  document.getElementById("move-counter").textContent = `Move ${currentMoveIndex} (${color})`;
}

// ==================== PANEL SWITCHING ====================
function switchPanel(panelName) {
  // Hide all panels
  document.querySelectorAll(".tab-panel").forEach((p) => {
    p.style.display = "none";
  });
  
  // Remove active from all buttons
  document.querySelectorAll(".tabs-btn").forEach((btn) => {
    btn.classList.remove("active");
    btn.style.borderBottomColor = "transparent";
    btn.style.color = "var(--text-secondary)";
  });
  
  // Show selected panel and mark button as active
  const panel = document.getElementById(`${panelName}-panel`);
  if (panel) {
    panel.style.display = "block";
  }
  
  const btn = event.target;
  btn.classList.add("active");
  btn.style.borderBottomColor = "var(--color-primary)";
  btn.style.color = "var(--color-primary)";
}

// ==================== ACTIONS ====================
function downloadPGN() {
  const pgn = matchData.pgn || "PGN not available";
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(pgn));
  element.setAttribute("download", `match-${matchData.id}.pgn`);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  
  showNotification("PGN downloaded successfully!", "success");
}

function shareMatch() {
  const url = window.location.href;
  const text = `Check out this chess match: ${url}`;
  
  if (navigator.share) {
    navigator.share({
      title: "Chess Bot Match",
      text: text,
      url: url,
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(url);
    showNotification("Match URL copied to clipboard!", "success");
  }
}

// ==================== EVENT LISTENERS ====================
function attachMatchEventListeners() {
  // Navigation buttons
  document.getElementById("move-first")?.addEventListener("click", firstMove);
  document.getElementById("move-prev")?.addEventListener("click", prevMove);
  document.getElementById("move-next")?.addEventListener("click", nextMove);
  document.getElementById("move-last")?.addEventListener("click", lastMove);
  
  // Slider
  document.getElementById("move-slider")?.addEventListener("input", (e) => {
    goToMove(parseInt(e.target.value));
  });
  
  // Panel buttons
  document.querySelectorAll(".tabs-btn").forEach((btn) => {
    btn.addEventListener("click", switchPanel);
  });
  
  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevMove();
    if (e.key === "ArrowRight") nextMove();
  });
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", initializeMatchViewer);

