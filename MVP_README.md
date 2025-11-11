# Card Game Player MVP

This is the MVP implementation of the Card Game Player application - a real-time multiplayer card game platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (recommended)
- OR PostgreSQL 15+ and Redis 7+ installed locally

### Option 1: Using Docker (Recommended)

1. **Start the infrastructure services:**
```bash
docker-compose up -d
```

This will start PostgreSQL and Redis containers.

2. **Set up the backend:**
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

The API server will run on http://localhost:3000

3. **Test the server:**
```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T...",
  "uptime": 0.123
}
```

### Option 2: Manual Setup

1. **Install and start PostgreSQL:**
```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15
createdb cardgame

# Ubuntu/Debian
sudo apt install postgresql-15
sudo service postgresql start
sudo -u postgres createdb cardgame
```

2. **Install and start Redis:**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo service redis-server start
```

3. **Set up the backend:**
```bash
cd server
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run dev
```

### Database Migration

The initial schema will be automatically applied when Docker starts PostgreSQL. If using manual setup:

```bash
cd server
psql -U postgres -d cardgame -f src/migrations/001_initial_schema.sql
```

## 📁 Project Structure

```
card_game_player/
├── server/                 # Backend Node.js + Express + Socket.io
│   ├── src/
│   │   ├── config/        # Database, Redis configuration
│   │   ├── controllers/   # Route controllers (to be added)
│   │   ├── services/      # Business logic (to be added)
│   │   ├── models/        # Data models (to be added)
│   │   ├── middleware/    # Express middleware (to be added)
│   │   ├── routes/        # API routes (to be added)
│   │   ├── websocket/     # WebSocket handlers (to be added)
│   │   ├── utils/         # Utilities (to be added)
│   │   ├── game-engine/   # Game logic (to be added)
│   │   ├── migrations/    # Database migrations
│   │   └── index.ts       # Main server file
│   ├── tests/             # Tests (to be added)
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── components/    # React components (to be added)
│   │   ├── screens/       # App screens (to be added)
│   │   ├── store/         # Redux store
│   │   ├── services/      # API & WebSocket clients (to be added)
│   │   └── config/        # Configuration
│   ├── App.tsx            # Main app component
│   └── package.json
│
├── docker-compose.yml      # Docker services configuration
└── Documentation/          # Planning docs (*.md files)
```

## 🔧 Available Commands

### Backend (server/)

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm test         # Run tests (to be implemented)
```

### Infrastructure

```bash
docker-compose up -d        # Start PostgreSQL & Redis
docker-compose down         # Stop services
docker-compose logs -f      # View logs
docker-compose restart      # Restart services
```

## 📊 Current Status

### ✅ Completed (Milestone 1.1)

- ✅ Backend project initialized with TypeScript
- ✅ Express server with health check endpoint
- ✅ Socket.io WebSocket server setup
- ✅ PostgreSQL connection configuration
- ✅ Redis connection configuration
- ✅ Database schema created (users, games, stats)
- ✅ Docker Compose for local development
- ✅ Mobile app project initialized
- ✅ Redux store configured
- ✅ Basic project structure

### 🚧 In Progress

Working on Milestone 1.2: Authentication & Basic UI

### 📅 Next Steps

1. Implement authentication endpoints (registration, login)
2. Create authentication middleware
3. Build basic mobile UI screens
4. Implement WebSocket authentication
5. Create game session management

## 🔍 Testing the Setup

1. **Check if PostgreSQL is running:**
```bash
docker-compose ps
# OR
psql -U postgres -d cardgame -c "SELECT version();"
```

2. **Check if Redis is running:**
```bash
docker-compose ps
# OR
redis-cli ping
```

3. **Test the API server:**
```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api
```

4. **Check database tables:**
```bash
psql -U postgres -d cardgame -c "\dt"
```

You should see: users, user_stats, games, game_players

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres
# View logs
docker-compose logs postgres
```

### Cannot Connect to Redis

```bash
# Check if Redis is running
docker-compose ps redis
# Test connection
redis-cli ping
```

## 📚 Documentation

- [DEVELOPMENT_PLAN.md](../DEVELOPMENT_PLAN.md) - Complete development roadmap
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Technical architecture
- [IMPLEMENTATION_CHECKLIST.md](../IMPLEMENTATION_CHECKLIST.md) - Detailed task list
- [GETTING_STARTED.md](../GETTING_STARTED.md) - Detailed setup guide
- [QUICK_START_TEMPLATES.md](../QUICK_START_TEMPLATES.md) - Code templates

## 🎯 MVP Goals

The MVP (Milestone 1.7) will include:
- ✅ Backend infrastructure (Week 1-2)
- 🚧 Authentication & Basic UI (Week 2-3)
- 📅 Core game logic (Week 3-5)
- 📅 Multiplayer foundation (Week 5-7)
- 📅 Basic animations (Week 7-8)
- 📅 Points & scoring (Week 8-9)
- 📅 Testing & polish (Week 10-12)

**Target completion:** 12 weeks

## 🤝 Contributing

This is currently in active MVP development. Follow the implementation checklist for the current phase.

## 📝 License

MIT License

---

**Current Phase:** Milestone 1.1 - Infrastructure Setup ✅  
**Next Milestone:** 1.2 - Authentication & Basic UI  
**Last Updated:** 2025-11-11
