# Echocity: Glass Hearts

Telegram Mini App for an interactive cyberpunk romance/temptation simulation game.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (planned) / in-memory dev store
- **Deployment**: Cloudflare Pages (frontend) + Workers (API)

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
npm install
```

### Run Development Servers

```bash
# Terminal 1: Start the Worker API (port 8787)
npm run worker:dev

# Terminal 2: Start the frontend (port 5173)
npm run dev
```

Open http://localhost:5173 to view the app.

### Build for Production

```bash
npm run build
npm run worker:deploy
```

## Project Structure

```
├── src/                    # Frontend React app
│   ├── components/         # UI components
│   ├── api.ts             # API client
│   ├── types.ts           # TypeScript types
│   └── App.tsx            # Main app component
├── worker/                 # Cloudflare Worker API
│   ├── handlers/          # Route handlers
│   ├── utils.ts           # Utilities
│   └── index.ts           # Worker entry
├── scenes/                 # Game content JSON
│   └── calvin_ch1.json    # Calvin Chapter 1 scenes
└── idea.md                # PRD / design doc
```

## API Endpoints

- `GET /api/state` - Fetch user state + current scene
- `POST /api/choice` - Submit a choice, get updated state
- `GET /api/health` - Health check

See `idea.md` for full API contract documentation.

## Patterns

- **State Management**: Server-authoritative; frontend is display-only
- **Telegram Integration**: Uses `initData` for user auth
- **Scene Engine**: JSON-driven, deterministic choice resolution
- **Optimistic Locking**: `state_version` prevents race conditions
