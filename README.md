# ♟ Chess Bot Competition Platform

A professional-grade chess bot competition platform with real-time tournament management, sandboxed bot execution, comprehensive leaderboards, and a polished web interface for both users and administrators.

## ✨ Features

### User Features
- **Interactive Dashboard** - View live leaderboards, recent matches, and tournament standings
- **Match Browser** - Beautiful match viewer with move-by-move replay, keyboard navigation, and board controls
- **Tournament Management** - Create round-robin tournaments, track progress, and view final standings
- **Bot Registry** - Register new chess bot executables and manage their configurations
- **Advanced Leaderboards** - Real-time standings with win rates and statistics

### Admin Features
- **Admin Panel** - Comprehensive administration interface for power users
- **System Monitoring** - Real-time statistics, activity logs, and system health checks
- **Diagnostics** - Built-in diagnostic tools to verify API health and data integrity
- **Settings Management** - Configure default timeouts, move limits, and refresh intervals
- **Data Management** - Tools for clearing match history and bulk operations

### Technical Features
- **CORS Support** - Full Cross-Origin Resource Sharing for API access
- **Interactive API Docs** - Swagger/OpenAPI documentation at `/docs`
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Dark Mode** - Theme toggle for comfortable viewing in all lighting conditions
- **Real-time Search** - Instant filtering and search across bots, matches, and tournaments
- **Tab Navigation** - Organized tabbed interface for logical content grouping
- **Export Functionality** - Download match PGN files and tournament data as JSON

## 🚀 Quick Start

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -e .

# Run the server
python -m chessbot.web.app
```

Visit **http://localhost:8000** for the dashboard, or **http://localhost:8000/admin** for the admin panel.

API documentation available at **http://localhost:8000/docs**.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Web Frontend (Modern HTML5 + CSS3 + JavaScript)             │
│  - Dashboard (/)                                              │
│  - Admin Panel (/admin)                                       │
│  - Match Viewer (/matches/{id})                              │
│  - Tournament Details (/tournaments/{id})                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP
                               │ JSON
                               ↓
┌──────────────────────────────────────────────────────────────┐
│  FastAPI Backend (REST API)                                   │
│  - CORS Middleware                                            │
│  - Swagger/OpenAPI Support                                    │
│  - Error Handling                                             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                ↓              ↓              ↓
         ┌────────────┐ ┌────────────┐ ┌────────────┐
         │  Match     │ │ Tournament │ │   Bot      │
         │  Runner    │ │ Scheduler  │ │ Execution  │
         │  Service   │ │ Service    │ │  Sandbox   │
         └────────────┘ └────────────┘ └────────────┘
```

## 📖 API Documentation

### Core Endpoints

#### Bots
```
GET    /api/bots              - List all registered bots
POST   /api/bots              - Register a new bot
```

#### Matches
```
GET    /api/matches           - List all matches (paginated)
POST   /api/matches           - Run a single match
GET    /api/matches/{match_id} - Get match details with move history
GET    /api/leaderboard       - Get global leaderboard standings
```

#### Tournaments
```
GET    /api/tournaments              - List all tournaments
POST   /api/tournaments              - Create a new tournament
GET    /api/tournaments/{tournament_id} - Get tournament details
```

## 🤖 Bot Interface

Bots are executables that read a FEN string from stdin and output a UCI move to stdout.

```bash
echo "startpos" | python bots/random_bot.py
```

### Requirements
- Input: Single line FEN string on stdin
- Output: Single UCI move (e.g., `e2e4`) to stdout
- Must respond within `move_timeout_s` seconds
- Output move must be legal for the current position

## 📁 Project Structure

```
chess-bot/
├── chessbot/
│   ├── models.py              # Pydantic data models
│   ├── web/
│   │   └── app.py             # FastAPI application
│   ├── services/
│   │   ├── match_runner.py     # Match execution logic
│   │   ├── scheduler.py        # Tournament scheduling
│   │   ├── standings.py        # Leaderboard calculation
│   │   ├── storage.py          # Data persistence
│   │   └── sandbox.py          # Bot execution sandbox
│   ├── static/
│   │   ├── index.html          # Main dashboard
│   │   ├── admin.html          # Admin panel
│   │   ├── match.html          # Match viewer
│   │   ├── tournaments.html    # Tournament details
│   │   ├── style.css           # Responsive styles
│   │   └── js/
│   │       ├── app.js          # Dashboard logic
│   │       ├── admin.js        # Admin panel logic
│   │       ├── match.js        # Match viewer logic
│   │       ├── tournament.js   # Tournament logic
│   │       └── utils.js        # Shared utilities
│   └── tests/
├── bots/                      # Example bot implementations
└── scripts/                   # Helper scripts
```

## 🎨 UI/UX Improvements

### Dashboard
- **Modern Card Layout** - Clean, card-based UI with smooth hover effects
- **Real-time Stats** - System metrics and quick overview
- **Tabbed Navigation** - Organized content (Dashboard, Tournaments, Matches, Bots)
- **Modal Dialogs** - Clean forms for bot registration and tournament creation
- **Search & Filter** - Instant search across all sections
- **Responsive Grid** - Adapts to any screen size

### Match Viewer
- **Interactive Board** - Move through game with arrow keys or slider
- **Multiple Panels** - Moves list, PGN text, FEN history
- **Game Analysis** - Statistics for both players
- **Export Options** - Download PGN files or share links

### Admin Panel
- **System Overview** - Key metrics and health status
- **Activity Log** - Real-time action tracking
- **Data Tables** - Searchable, sortable bot and match lists
- **Diagnostic Tools** - System health verification
- **Settings Management** - Configurable parameters

## 🧪 Testing

```bash
# Run all tests
pytest

# With coverage report
pytest --cov=chessbot --cov-report=html
```

## 🐳 Docker

```bash
docker build -t chess-bot-platform .
docker run -p 8000:8000 chess-bot-platform
```

## 📝 License

MIT License

---

Built with ❤️ for competitive chess bot tournaments
