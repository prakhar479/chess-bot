# Development Guide

This guide is for developers who want to extend and contribute to the Chess Bot Platform.

## Setup for Development

### Prerequisites
- Python 3.11+
- Git
- Node.js (optional, for future frontend bundling)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd chess-bot

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Linux/macOS
# or
.venv\Scripts\activate     # Windows

# Install development dependencies
pip install -e ".[ci,dev]"

# Verify installation
python -m chessbot.web.app --help
```

## Project Structure

```
chess-bot/
├── chessbot/
│   ├── __init__.py
│   ├── models.py              # Pydantic data models
│   ├── web/
│   │   ├── __init__.py
│   │   └── app.py             # FastAPI application
│   ├── services/
│   │   ├── __init__.py
│   │   ├── match_runner.py    # Match execution
│   │   ├── scheduler.py       # Tournament scheduling
│   │   ├── standings.py       # Leaderboard calculation
│   │   ├── storage.py         # Data storage (in-memory)
│   │   ├── sandbox.py         # Bot execution sandbox
│   │   └── __pycache__/
│   ├── static/
│   │   ├── index.html         # Main dashboard
│   │   ├── admin.html         # Admin panel
│   │   ├── match.html         # Match viewer
│   │   ├── tournaments.html   # Tournament details
│   │   ├── style.css          # Global styles
│   │   └── js/
│   │       ├── app.js         # Dashboard logic
│   │       ├── admin.js       # Admin logic
│   │       ├── match.js       # Match viewer logic
│   │       ├── tournament.js  # Tournament logic
│   │       └── utils.js       # Shared utilities
│   └── tests/
│       ├── __init__.py
│       ├── test_api.py
│       ├── test_match_runner.py
│       ├── test_scheduler.py
│       └── __pycache__/
├── bots/
│   ├── random_bot.py
│   └── greedy_bot.py
├── scripts/
│   ├── run_server.sh
│   └── run_tournament.sh
├── pyproject.toml
├── README.md
├── QUICKSTART.md
├── FEATURES.md
├── CHANGELOG.md
├── IMPROVEMENTS.md
└── DEVELOPMENT.md (this file)
```

## Key Components

### Backend Services

#### `chessbot/models.py`
Defines Pydantic models:
- `BotRecord` - Registered bot metadata
- `MatchRecord` - Completed match data
- `TournamentRecord` - Tournament metadata
- `Standing` - Leaderboard entry

#### `chessbot/services/match_runner.py`
Orchestrates match execution:
- Validates moves against chess rules
- Spawns bot processes with timeouts
- Records move history and FEN positions
- Handles match results (win, loss, draw, forfeit)

#### `chessbot/services/scheduler.py`
Implements tournament scheduling:
- Round-robin algorithm
- Pairing generation
- Background task execution

#### `chessbot/services/standings.py`
Calculates leaderboards:
- Win/loss/draw counts
- Points calculation
- Ranking logic

#### `chessbot/services/storage.py`
In-memory data store:
- Bot registry
- Match history
- Tournament records
- Easily replaceable with database

### Frontend Architecture

#### Shared Utilities (`js/utils.js`)
```javascript
// Modal Management
openModal(modalId)
closeModal(modalId)

// Theme System
loadTheme()
setTheme(theme)
toggleTheme()

// API Calls
apiGet(endpoint)
apiPost(endpoint, data)
apiCall(endpoint, options)

// Notifications
showNotification(message, type, duration)

// Form Helpers
disableForm(form)
enableForm(form)
resetForm(form)

// DOM Helpers
formatDate(dateString)
formatDuration(seconds)
getResultBadge(result)
createCard(data)

// Pagination
renderPagination(currentPage, totalPages, callback)
```

#### Page-Specific Logic
- `app.js` - Dashboard and main features
- `admin.js` - Admin panel features
- `match.js` - Match viewer functionality
- `tournament.js` - Tournament details page

## Coding Standards

### Python

**Style Guide:** PEP 8 (enforced with ruff)

```bash
# Format code
black chessbot/

# Check style
ruff check chessbot/

# Type checking
mypy chessbot/
```

**Principles:**
- Use type hints on all functions
- Include docstrings on classes and functions
- Keep functions small and focused
- Write tests for new features

Example:
```python
def calculate_points(win: bool, draw: bool) -> float:
    """Calculate match points.
    
    Args:
        win: Whether the bot won
        draw: Whether the game was a draw
        
    Returns:
        Points earned (1 for win, 0.5 for draw, 0 for loss)
    """
    if win:
        return 1.0
    elif draw:
        return 0.5
    return 0.0
```

### JavaScript

**Style Guidelines:**
- Use modern ES6+ syntax
- Include JSDoc comments on functions
- Consistent indentation (2 spaces)
- Meaningful variable names
- Avoid global variables

Example:
```javascript
/**
 * Calculate player rating change
 * @param {number} currentRating - Current player rating
 * @param {number} opponentRating - Opponent's rating
 * @param {boolean} won - Whether the player won
 * @return {number} Rating change
 */
function calculateRatingChange(currentRating, opponentRating, won) {
  const expected = 1 / (1 + Math.pow(10, (opponentRating - currentRating) / 400));
  const actual = won ? 1 : 0;
  return Math.round(32 * (actual - expected));
}
```

### CSS

**Architecture:**
- Use CSS variables for theming
- Follow BEM naming for components
- Mobile-first responsive design
- Group related properties

## Adding New Features

### Backend: Adding a New API Endpoint

1. Define data model in `models.py`:
```python
from pydantic import BaseModel

class BotStatisticsRequest(BaseModel):
    bot_id: UUID
    include_history: bool = False
```

2. Create handler in `app.py`:
```python
@APP.get("/api/bots/{bot_id}/stats")
def get_bot_stats(bot_id: UUID) -> dict:
    """Get bot statistics."""
    try:
        bot = STORE.get_bot(bot_id)
        # Calculate stats
        return {
            "bot_id": bot_id,
            "name": bot.name,
            # ... statistics
        }
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Bot not found") from exc
```

### Frontend: Adding a New Page

1. Create HTML file in `static/`:
```html
<!doctype html>
<html>
  <head>
    <title>New Feature</title>
    <link rel="stylesheet" href="/static/style.css">
  </head>
  <body>
    <!-- Content here -->
    <script src="/static/js/utils.js"></script>
    <script src="/static/js/newfeature.js"></script>
  </body>
</html>
```

2. Create JavaScript file `static/js/newfeature.js`:
```javascript
async function initialize() {
  try {
    await loadData();
    attachEventListeners();
  } catch (error) {
    showNotification("Error: " + error.message, "danger");
  }
}

async function loadData() {
  const data = await apiGet("/api/new-endpoint");
  renderContent(data);
}

function attachEventListeners() {
  // Event handlers
}

document.addEventListener("DOMContentLoaded", initialize);
```

3. Add route in `app.py`:
```python
@APP.get("/newfeature")
def new_feature_page() -> FileResponse:
    """Serve new feature page."""
    return FileResponse(STATIC_DIR / "newfeature.html")
```

### Extending Storage

To replace in-memory storage with a database:

1. Create new storage class implementing the same interface:
```python
class DatabaseStorage:
    def create_bot(self, payload: BotCreate) -> BotRecord:
        # Save to database
        pass
        
    def list_bots(self) -> List[BotRecord]:
        # Query database
        pass
    
    # ... other methods
```

2. Replace `STORE` instance:
```python
# In app.py
STORE = DatabaseStorage()  # Instead of in-memory
```

## Testing

### Writing Tests

Tests should be in `chessbot/tests/` using pytest:

```python
import pytest
from chessbot.services.standing import compute_standings

def test_compute_standings():
    """Test leaderboard calculation."""
    # Arrange
    matches = [...]
    
    # Act
    standings = compute_standings(matches)
    
    # Assert
    assert len(standings) > 0
    assert standings[0].points >= standings[1].points
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest chessbot/tests/test_api.py -v

# Run with coverage
pytest --cov=chessbot --cov-report=html

# Run in watch mode (with pytest-watch)
ptw
```

## Debugging

### Python Debugging

Use `pdb` for debugging:
```python
import pdb; pdb.set_trace()  # Breakpoint
```

Or use VS Code debugger with `.vscode/launch.json`:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: FastAPI",
            "type": "python",
            "request": "launch",
            "module": "uvicorn",
            "args": ["chessbot.web.app:APP", "--reload"],
            "jinja": true,
            "justMyCode": true
        }
    ]
}
```

### JavaScript Debugging

Use browser DevTools:
1. Press F12 to open Developer Tools
2. Set breakpoints in Sources tab
3. Check Console for error messages
4. Use debugger statement: `debugger;`

## Performance Optimization

### Frontend
- Minimize DOM manipulation
- Use event delegation
- Cache DOM queries
- Lazy load images

### Backend
- Add database indexing
- Cache leaderboard calculations
- Use connection pooling
- Consider caching with Redis

### CSS
- Use minification for production
- Consider critical CSS inlining
- Optimize image assets

## Security Considerations

### Input Validation
- Validate all API inputs with Pydantic
- Sanitize HTML content
- Escape user-provided data

### Bot Execution
- Run bots in isolated processes
- Set strict resource limits (CPU, memory, timeout)
- Validate bot output (FEN, moves)
- Prevent infinite loops

### API Security
- Enable CORS selectively
- Add rate limiting (future enhancement)
- Validate Content-Type headers
- Use HTTPS in production

## Documentation

### Code Comments
- Document complex logic
- Explain non-obvious decisions
- Include examples in docstrings

### User Documentation
- Keep README.md updated
- Document new API endpoints
- Provide usage examples
- Include troubleshooting section

## Deployment

### Development
```bash
python -m chessbot.web.app
```

### Production with Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 chessbot.web.app:APP
```

### Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -e .
CMD ["python", "-m", "chessbot.web.app"]
```

## Contributing Guidelines

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow coding standards**
4. **Write tests for new features**
5. **Update documentation**
6. **Commit with clear messages**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open Pull Request**

## Common Tasks

### Adding a new bot command
```bash
# Create bot script
cat > bots/mybot.py << 'EOF'
#!/usr/bin/env python3
import sys
import chess

def main():
    fen = sys.stdin.readline().strip()
    board = chess.Board(fen)
    # ... bot logic ...
    print(move.uci())

if __name__ == "__main__":
    main()
EOF

chmod +x bots/mybot.py
```

### Updating dependencies
```bash
pip install -e ".[ci,dev]" --upgrade
```

### Running the full pipeline
```bash
# Format code
black chessbot/

# Check style
ruff check chessbot/

# Type check
mypy chessbot/

# Run tests
pytest --cov=chessbot

# Start server
python -m chessbot.web.app
```

## Useful Resources

- FastAPI Documentation: https://fastapi.tiangolo.com
- Python Chess: https://python-chess.readthedocs.io
- Pydantic: https://docs.pydantic.dev
- pytest: https://docs.pytest.org
- CSS Variables: https://developer.mozilla.org/en-US/docs/Web/CSS/--*

## Getting Help

- Check existing issues on GitHub
- Review test cases for examples
- Consult API documentation at `/docs`
- Read FEATURES.md for feature overview
- Check CHANGELOG.md for recent changes

---

Happy coding! 🚀
