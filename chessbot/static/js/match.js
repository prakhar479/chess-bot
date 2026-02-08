const boardEl = document.getElementById("board");
const moveList = document.getElementById("move-list");
const matchTitle = document.getElementById("match-title");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");

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

function fenToBoard(fen) {
  const [position] = fen.split(" ");
  const rows = position.split("/");
  const squares = [];
  rows.forEach(row => {
    row.split("").forEach(char => {
      if (Number.isInteger(parseInt(char, 10))) {
        for (let i = 0; i < parseInt(char, 10); i += 1) {
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
  const squares = fenToBoard(fen);
  boardEl.innerHTML = "";
  squares.forEach((piece, index) => {
    const square = document.createElement("div");
    const row = Math.floor(index / 8);
    const col = index % 8;
    square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
    square.textContent = piece;
    boardEl.appendChild(square);
  });
}

function renderMoves(moves) {
  moveList.innerHTML = "";
  moves.forEach(move => {
    const item = document.createElement("li");
    item.textContent = move;
    moveList.appendChild(item);
  });
}

async function loadMatch() {
  const matchId = window.location.pathname.split("/").pop();
  const response = await fetch(`/api/matches/${matchId}`);
  const match = await response.json();
  matchTitle.textContent = `${match.white_bot_id} vs ${match.black_bot_id}`;
  renderMoves(match.moves);
  let index = 0;
  renderBoard(match.fen_history[index]);

  prevButton.onclick = () => {
    if (index > 0) {
      index -= 1;
      renderBoard(match.fen_history[index]);
    }
  };
  nextButton.onclick = () => {
    if (index < match.fen_history.length - 1) {
      index += 1;
      renderBoard(match.fen_history[index]);
    }
  };
}

loadMatch();
