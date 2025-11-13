# Getting Started Guide

This guide will walk you through setting up the development environment and beginning development on the Card Game Player application.

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control
- **React Native CLI** - For mobile development
- **PostgreSQL** (v14 or higher) - Database
- **Redis** (v7 or higher) - Cache and real-time data

### Mobile Development Requirements

#### For iOS Development
- **macOS** (required for iOS development)
- **Xcode** (latest version)
- **CocoaPods** - iOS dependency manager
- **iOS Simulator** or physical iOS device

#### For Android Development
- **Android Studio** (latest version)
- **Android SDK** (API level 31 or higher)
- **Java Development Kit (JDK)** 11 or higher
- **Android Emulator** or physical Android device

### Optional Tools
- **Docker** and **Docker Compose** - For containerized development
- **VS Code** or your preferred IDE
- **Postman** or **Insomnia** - API testing
- **DBeaver** or **pgAdmin** - Database management

## Quick Start (5 Minutes)

### Option 1: Docker Setup (Recommended for Beginners)

1. **Clone the repository**
```bash
git clone https://github.com/NikolasNeofytou/card_game_player.git
cd card_game_player
```

2. **Start services with Docker Compose**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis cache
- Backend API server
- All necessary dependencies

3. **Set up the mobile app**
```bash
cd mobile
npm install
npm run ios    # For iOS
# or
npm run android  # For Android
```

### Option 2: Manual Setup

If you prefer to set up each component manually, follow the detailed instructions below.

## Detailed Setup Instructions

### 1. Backend Setup

#### Step 1: Create Project Structure

```bash
mkdir card_game_player
cd card_game_player
```

#### Step 2: Initialize Backend Server

```bash
mkdir server
cd server
npm init -y
```

#### Step 3: Install Backend Dependencies

```bash
# Core dependencies
npm install express socket.io cors dotenv

# Database
npm install pg redis ioredis

# Authentication
npm install jsonwebtoken bcrypt

# Validation
npm install joi

# Utilities
npm install uuid winston

# Development dependencies
npm install -D typescript @types/node @types/express @types/socket.io \
  ts-node nodemon @types/jsonwebtoken @types/bcrypt
```

#### Step 4: Create TypeScript Configuration

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### Step 5: Set Up Environment Variables

Create `.env`:
```env
# Server
NODE_ENV=development
PORT=3000
WEBSOCKET_PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cardgame
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=cardgame

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key-change-in-production
REFRESH_TOKEN_SECRET=your-refresh-secret-change-in-production

# Firebase (for auth)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_PROJECT_ID=your-firebase-project-id

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
```

#### Step 6: Set Up Database

```bash
# Start PostgreSQL (if not using Docker)
# macOS with Homebrew:
brew services start postgresql

# Create database
createdb cardgame

# Run migrations (you'll create these later)
npm run migrate
```

Create `src/config/database.ts`:
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

#### Step 7: Create Basic Server

Create `src/index.ts`:
```typescript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Step 8: Add Scripts to package.json

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "migrate": "node src/migrations/run.js"
  }
}
```

#### Step 9: Test Backend

```bash
npm run dev
```

Visit http://localhost:3000/health - you should see the health check response.

### 2. Mobile App Setup (React Native)

#### Step 1: Create React Native Project

```bash
# Navigate to project root
cd ..

# Create React Native app
npx react-native init CardGamePlayer --template react-native-template-typescript

# Or use Expo (easier for beginners)
npx create-expo-app CardGamePlayer --template
```

#### Step 2: Install Dependencies

```bash
cd CardGamePlayer

# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# State management
npm install @reduxjs/toolkit react-redux

# Real-time communication
npm install socket.io-client

# Animations
npm install react-native-reanimated react-native-gesture-handler

# UI components
npm install react-native-paper react-native-vector-icons

# HTTP client
npm install axios

# Utilities
npm install @react-native-async-storage/async-storage
```

#### Step 3: Configure Project

For iOS (Mac only):
```bash
cd ios
pod install
cd ..
```

#### Step 4: Set Up Project Structure

```bash
mkdir -p src/{components,screens,store,services,hooks,utils,types,animations}
mkdir -p src/components/{common,game,tournament}
mkdir -p src/screens/{auth,game,tournament,profile}
mkdir -p src/services/{api,websocket,storage}
mkdir -p src/store/slices
```

#### Step 5: Create Environment Configuration

Create `src/config/environment.ts`:
```typescript
const ENV = {
  development: {
    API_URL: 'http://localhost:3000',
    WEBSOCKET_URL: 'http://localhost:3001',
  },
  production: {
    API_URL: 'https://api.yourdomain.com',
    WEBSOCKET_URL: 'wss://ws.yourdomain.com',
  }
};

const environment = __DEV__ ? 'development' : 'production';

export default ENV[environment];
```

#### Step 6: Set Up Redux Store

Create `src/store/index.ts`:
```typescript
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### Step 7: Create Basic App Structure

Update `App.tsx`:
```typescript
import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </Provider>
  );
}
```

#### Step 8: Run the App

```bash
# iOS
npm run ios
# or
npx react-native run-ios

# Android
npm run android
# or
npx react-native run-android
```

### 3. Database Setup

#### Step 1: Create Migration Files

Create `server/src/migrations/001_initial_schema.sql`:
```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    ranking INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_type VARCHAR(50) NOT NULL,
    host_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL,
    settings JSONB,
    state JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_host ON games(host_id);
CREATE INDEX idx_users_username ON users(username);
```

#### Step 2: Run Migrations

```bash
cd server
npm run migrate
```

### 4. Development Workflow

#### Daily Development Process

1. **Start Backend Services**
```bash
# Terminal 1 - Start PostgreSQL (if not using Docker)
# macOS:
brew services start postgresql

# Terminal 2 - Start Redis (if not using Docker)
redis-server

# Terminal 3 - Start backend
cd server
npm run dev
```

2. **Start Mobile App**
```bash
# Terminal 4 - Start Metro bundler
cd CardGamePlayer
npm start

# Terminal 5 - Run on device
npm run ios
# or
npm run android
```

3. **Test API Endpoints**
```bash
# Test health check
curl http://localhost:3000/health

# Test WebSocket connection
# Use a WebSocket client or create a simple test
```

### 5. Git Setup

#### Step 1: Initialize Repository

```bash
git init
```

#### Step 2: Create .gitignore

Create `.gitignore`:
```
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/
*.log

# Production
dist/
build/

# Environment
.env
.env.local
.env.*.local

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Mobile
ios/Pods/
ios/build/
android/app/build/
android/.gradle/
*.apk
*.ipa

# Misc
*.log
.expo/
.expo-shared/
```

#### Step 3: Commit Initial Setup

```bash
git add .
git commit -m "Initial project setup"
git branch -M main
git remote add origin https://github.com/NikolasNeofytou/card_game_player.git
git push -u origin main
```

## Development Best Practices

### Code Style

1. **Use TypeScript** for type safety
2. **ESLint** and **Prettier** for code formatting
3. **Consistent naming conventions**:
   - Components: PascalCase (e.g., `GameBoard.tsx`)
   - Functions/variables: camelCase (e.g., `playCard`)
   - Constants: UPPER_SNAKE_CASE (e.g., `MAX_PLAYERS`)

### Git Workflow

1. **Create feature branches** for new work
   ```bash
   git checkout -b feature/game-board
   ```

2. **Write descriptive commit messages**
   ```bash
   git commit -m "feat: implement card dealing animation"
   ```

3. **Keep commits atomic** - one logical change per commit

4. **Pull request workflow**:
   - Create branch
   - Make changes
   - Push to remote
   - Create pull request
   - Code review
   - Merge to main

### Testing Strategy

1. **Write tests alongside code**
2. **Test critical paths first**:
   - Authentication
   - Game logic
   - Real-time synchronization
3. **Use test-driven development (TDD)** when appropriate

### Documentation

1. **Comment complex logic**
2. **Update README** as features are added
3. **Document API endpoints**
4. **Keep architecture docs current**

## Troubleshooting

### Common Issues and Solutions

#### Backend Issues

**Problem**: Cannot connect to PostgreSQL
```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Start PostgreSQL
# macOS:
brew services start postgresql
# Linux:
sudo systemctl start postgresql
```

**Problem**: Port already in use
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### Mobile App Issues

**Problem**: iOS build fails
```bash
# Clean and rebuild
cd ios
pod deintegrate
pod install
cd ..
npx react-native run-ios
```

**Problem**: Android build fails
```bash
# Clean gradle
cd android
./gradlew clean
cd ..
npx react-native run-android
```

**Problem**: Metro bundler issues
```bash
# Clear cache
npx react-native start --reset-cache
```

#### Database Issues

**Problem**: Migration fails
```bash
# Drop and recreate database
dropdb cardgame
createdb cardgame
npm run migrate
```

### Getting Help

- Check documentation in `DEVELOPMENT_PLAN.md` and `ARCHITECTURE.md`
- Review existing issues on GitHub
- Create a new issue with:
  - Clear description of the problem
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details (OS, Node version, etc.)

## Next Steps

Once your development environment is set up:

1. **Familiarize yourself** with the codebase structure
2. **Review** `DEVELOPMENT_PLAN.md` for the roadmap
3. **Start with Phase 1, Milestone 1** tasks
4. **Implement** the authentication system
5. **Create** basic UI components
6. **Develop** core game logic

## Useful Commands Reference

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm test            # Run tests
npm run migrate     # Run database migrations
npm run lint        # Run linter
```

### Mobile
```bash
npm start           # Start Metro bundler
npm run ios         # Run on iOS
npm run android     # Run on Android
npm test            # Run tests
npm run lint        # Run linter
```

### Database
```bash
createdb cardgame              # Create database
dropdb cardgame                # Drop database
psql cardgame                  # Connect to database
pg_dump cardgame > backup.sql  # Backup database
psql cardgame < backup.sql     # Restore database
```

### Docker
```bash
docker-compose up          # Start all services
docker-compose down        # Stop all services
docker-compose logs -f     # View logs
docker-compose restart     # Restart services
```

## Additional Resources

### Learning Resources
- [React Native Documentation](https://reactnative.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

### Tools and Libraries
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Documentation](https://docs.expo.dev/) (if using Expo)

### Community
- React Native Community Discord
- Stack Overflow
- GitHub Discussions

## Conclusion

You're now ready to start developing the Card Game Player application! Follow the development plan, build incrementally, and don't hesitate to refer back to this guide and other documentation.

Happy coding! 🎮🃏
