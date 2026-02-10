# Quick Start Guide

Get up and running with the Chess Bot Platform in minutes!

## Installation

### Prerequisites
- Python 3.11 or higher
- Git (optional, for cloning the repository)

### Setup Steps

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone <repository-url>
   cd chess-bot
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv .venv
   ```

3. **Activate the virtual environment**
   
   **On Linux/macOS:**
   ```bash
   source .venv/bin/activate
   ```
   
   **On Windows:**
   ```bash
   .venv\Scripts\activate
   ```

4. **Install dependencies**
   ```bash
   pip install -e .
   ```

5. **Start the server**
   ```bash
   python -m chessbot.web.app
   ```

6. **Access the platform**
   - Dashboard: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin
   - API Docs: http://localhost:8000/docs

## First Steps

### Step 1: Register Your First Bot

1. Click the "Bots" tab in the dashboard
2. Click "+ Register Bot"
3. Enter bot name: `RandomBot`
4. Enter command: `python bots/random_bot.py`
5. Click "Register Bot"

Repeat this process to register multiple bots (e.g., GreedyBot).

### Step 2: Run a Quick Match

1. Return to the Dashboard tab
2. Click "⚡ Quick Match" button (or look for "Run Quick Match")
3. Select two different bots from the dropdowns
4. Click "Run Match"
5. After the match completes, click "View Match" to watch the game

### Step 3: Create a Tournament

1. Click the "Tournaments" tab
2. Click "+ New Tournament"
3. Enter tournament name: `Spring Championship`
4. Select 2 or more bots with checkboxes
5. Set number of rounds (e.g., 2)
6. Click "Create Tournament"

The tournament will run in the background and update automatically.

## Creating Your Own Bot

### Simple Random Bot (Python)

Create a file `my_bot.py`:

```python
#!/usr/bin/env python3
import sys
import random
import chess

def main():
    # Read the FEN string from stdin
    fen = sys.stdin.readline().strip()
    
    # Parse the position
    board = chess.Board(fen)
    
    # Get all legal moves
    legal_moves = list(board.legal_moves)
    
    if legal_moves:
        # Pick a random move
        move = random.choice(legal_moves)
        # Output the move in UCI format
        print(move.uci())
    
    sys.exit(0)

if __name__ == "__main__":
    main()
```

Register it:
1. Go to Bots tab
2. Click "+ Register Bot"
3. Name: `MyBot`
4. Command: `python my_bot.py`

### Bot Development Tips

- **Always respond quickly** - Your bot has `move_timeout_s` seconds (default: 2)
- **Handle invalid input gracefully** - Validate the FEN string
- **Use python-chess library** - Makes board logic simple
- **Test locally first** - Don't register until you've verified locally
- **Keep it simple** - Complex analysis takes longer

### Example: Greedy Bot (Captures Material)

```python
#!/usr/bin/env python3
import sys
import chess

def main():
    fen = sys.stdin.readline().strip()
    board = chess.Board(fen)
    
    # Look for capturing moves first
    best_move = None
    best_value = -1
    
    for move in board.legal_moves:
        # Evaluate move value
        # Higher value = better capture
        if board.is_capture(move):
            piece = board.piece_at(move.to_square)
            value = piece_value(piece)
            if value > best_value:
                best_value = value
                best_move = move
    
    # If no capture found, use first legal move
    if best_move is None:
        best_move = list(board.legal_moves)[0]
    
    print(best_move.uci())
    sys.exit(0)

def piece_value(piece):
    values = {
        chess.PAWN: 1,
        chess.KNIGHT: 3,
        chess.BISHOP: 3,
        chess.ROOK: 5,
        chess.QUEEN: 9,
        chess.KING: 0
    }
    return values.get(piece.piece_type, 0)

if __name__ == "__main__":
    main()
```

## Admin Features

### Accessing the Admin Panel

Click the "Admin Panel" button in the top right of the dashboard, or visit: http://localhost:8000/admin

### Admin Panel Sections

#### Overview
- System statistics and recent activity
- Health status of API and storage
- Activity log with recent actions

#### Bot Management
- Search and view all registered bots
- View bot details and statistics
- Delete bots (coming soon)

#### Matches
- View complete match history
- Filter by result (Wins, Losses, Draws)
- Access individual match details

#### Tournaments
- View all tournaments
- See tournament details and standings
- Access tournament information

#### Settings
- Configure move timeout (default: 2 seconds)
- Set max moves per game (default: 200)
- Adjust dashboard refresh interval
- Run system diagnostics

## API Usage

### Command Line Examples

**Register a bot via curl:**
```bash
curl -X POST http://localhost:8000/api/bots \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CurlBot",
    "command": ["python", "bots/random_bot.py"]
  }'
```

**Get leaderboard:**
```bash
curl http://localhost:8000/api/leaderboard
```

**List tournaments:**
```bash
curl http://localhost:8000/api/tournaments
```

### JavaScript Examples

```javascript
// Get all bots
fetch('/api/bots')
  .then(r => r.json())
  .then(bots => console.log(bots));

// Create a match
fetch('/api/matches', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    white_bot_id: 'uuid1',
    black_bot_id: 'uuid2',
    move_timeout_s: 2,
    max_moves: 200
  })
})
  .then(r => r.json())
  .then(match => window.location.href = `/matches/${match.id}`);
```

## Troubleshooting

### Bot Not Responding

**Problem:** "Timeout: Bot did not respond within X seconds"

**Solutions:**
- Check that your bot script actually outputs a move
- Test your bot locally: `echo "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" | python your_bot.py`
- Make sure it outputs just the move (e.g., `e2e4`)
- Is the command path correct?

### Import Errors

**Problem:** "ModuleNotFoundError: No module named 'chess'"

**Solution:** Install python-chess:
```bash
pip install python-chess
```

### Port Already in Use

**Problem:** "Address already in use"

**Solution:** Change the port in the startup command:
```bash
python -m chessbot.web.app --port 8001
```

### Browser Dark Mode Issues

**Problem:** Colors don't look right in dark mode

**Solution:** The platform automatically switches themes. You can manually toggle with the 🌙 button in the header.

## Performance Tips

1. **Run multiple matches in parallel** - Use tournaments instead of one-by-one
2. **Optimize bot response time** - Faster bots = faster tournaments
3. **Use simple heuristics** - Complex engine analysis might timeout
4. **Keep logs minimal** - Reduce output overhead

## Next Steps

- Create more sophisticated bots with chess engines
- Organize regular tournaments
- Analyze match results and bot performance
- Integrate with external chess engines
- Export tournament results for analysis

## Getting Help

- Check API documentation: http://localhost:8000/docs
- Review example bots in `/bots` directory
- Look at test cases in `/chessbot/tests`
- Check the README.md for detailed information

---

Happy bot battling! 🎉
