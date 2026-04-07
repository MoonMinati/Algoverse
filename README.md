# Algoverse

Algoverse is a full-stack AI-powered algorithm visualization and analysis platform.

## Implemented Modules

1. Dashboard
2. Algorithm Visualizer
3. Comparison Page
4. AI Assistant Panel
5. User Profile
6. Admin Panel

## Implemented Feature Set

- Algorithm selector with syllabus coverage from Unit I to Unit V
- Input panel:
	- Array input
	- Random test case generation
	- Graph JSON upload and generation
- Visualization engine:
	- Sorting bars animation
	- Graph nodes and edges animation
	- DP table filling animation
	- Backtracking state-space progression
- Step-by-step execution panel
- AI task support (explain/code/examples/video script) using built-in local generator
- Performance analyzer:
	- Time complexity
	- Space complexity
	- Operation count
	- Execution time
- Comparison module with Chart.js metrics and backend recommendation
- Video narration mode (local script + browser TTS)
- JWT authentication:
	- Signup/login
	- Email verification token flow
	- Save execution history
- Admin capabilities:
	- Add algorithms
	- Monitor usage
	- Manage users

## Tech Stack

- Frontend: React, D3, Chart.js
- Backend: Node.js, Express
- Database: MongoDB
- AI: Local template-based generator (no paid API required)

## Quick Start

### 1) Install Dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2) Configure Backend Env

Copy and edit:

```bash
cp server/.env.example server/.env
```

Minimum required values:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/algoverse
JWT_SECRET=replace_this_secret
APP_URL=http://localhost:3000
PORT=5000
```

Optional for admin bootstrap:

```bash
ADMIN_EMAIL=admin@example.com
```

### 3) Run Backend

```bash
cd server
npm start
```

### 4) Run Frontend

```bash
cd client
npm start
```

## Key API Routes

- `GET /health`
- `GET /api/algorithms`
- `POST /api/explain`
- `POST /api/performance`
- `POST /api/compare`
- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/login`
- `GET /api/profile`
- `GET /api/history`
- `POST /api/history`
- `GET /api/results`
- `POST /api/results`
- `GET /api/admin/users` (admin)
- `GET /api/admin/usage` (admin)
- `POST /api/admin/algorithms` (admin)