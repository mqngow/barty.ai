# Barty's Saloon

## Overview

A Wild West therapeutic bartender web app for HooHacks 2026. Users chat with Barty, a rugged-but-caring cowboy bartender who gives therapeutic advice. At the end of each conversation, Barty creates a unique custom cocktail recipe inspired by the topics discussed.

## Tech Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Gemini 2.5 Flash (via Replit AI Integrations — no personal API key needed)
- **TTS**: ElevenLabs (requires ELEVENLABS_API_KEY in env)
- **Frontend**: React + Vite + TailwindCSS + Framer Motion + Zustand
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild
- **Containerization**: Docker + Docker Compose

## Structure

```
artifacts/
├── api-server/         Express API server
│   └── src/routes/
│       ├── gemini/conversations.ts   Barty's AI chat (SSE streaming)
│       ├── sessions.ts               Session & drink recipe management
│       └── elevenlabs.ts             Text-to-speech via ElevenLabs
└── bartys-saloon/      React frontend (Wild West saloon UI)
    └── src/
        ├── pages/
        │   ├── HomePage.tsx          Welcome + chat interface
        │   └── DrinkMenuPage.tsx     Past sessions as drink log
        ├── components/
        │   ├── chat/                 Barty portrait, chat bubbles
        │   └── menu/                 Drink cards, recipe modal
        └── hooks/
            └── use-barty-chat.ts     SSE streaming hook for Barty

lib/
├── api-spec/           OpenAPI spec + Orval codegen config
├── api-client-react/   Generated React Query hooks
├── api-zod/            Generated Zod validation schemas
├── db/                 Drizzle ORM — conversations, messages, sessions tables
└── integrations-gemini-ai/  Gemini AI client + batch utilities
```

## Features

- **Chat with Barty**: AI-powered therapeutic bartender in Wild West style using Gemini 2.5 Flash with streaming
- **Voice (optional)**: Barty's responses read aloud via ElevenLabs TTS (toggle in top nav)
- **Drink Log**: Each conversation ends with a unique cocktail recipe — stored and browsable on the Drink Menu page
- **Barty Art Placeholder**: Clear placeholder in `BartyPortrait.tsx` for dropping in your artist's artwork
- **Docker support**: `Dockerfile` and `docker-compose.yml` for self-hosting

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-provided by Replit)
- `AI_INTEGRATIONS_GEMINI_BASE_URL` — Gemini proxy URL (auto-provided by Replit AI Integrations)
- `AI_INTEGRATIONS_GEMINI_API_KEY` — Gemini API key (auto-provided by Replit AI Integrations)
- `ELEVENLABS_API_KEY` — ElevenLabs API key (optional, for voice)
- `PORT` — Server port (auto-assigned by Replit)

## Adding Barty's Art

Open `artifacts/bartys-saloon/src/components/chat/BartyPortrait.tsx` and replace the placeholder `<div>` with your friend's artwork `<img>` tag.

## Key API Endpoints

- `POST /api/gemini/conversations` — Start a new chat session
- `POST /api/gemini/conversations/:id/messages` — Send message, get SSE stream response
- `POST /api/sessions` — Create/link a session to a conversation
- `POST /api/sessions/:id/generate-drink` — Generate drink recipe from conversation
- `GET /api/sessions` — List all sessions (drink log)
- `POST /api/elevenlabs/tts` — Text-to-speech conversion

## Deployment

### Self-hosting with Docker

```bash
cp .env.example .env
# Edit .env with your values
docker-compose up -d
```

### Replit Deployment

Click the "Publish" button in the Replit UI.

## HooHacks 2026 Themes

- **Health & Wellness**: Therapeutic chat with Barty — emotional support, active listening, grounding
- **Data Science & AI**: Gemini AI for personalized responses, conversation analysis, drink recipe generation
- **Art & Gaming**: Interactive Wild West bartender character, animated UI, custom drink art
