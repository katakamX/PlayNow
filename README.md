# PlayNow

PlayNow is a sports venue booking and player-community web application built with the MERN stack.

## Features
- Register and log in using JWT authentication
- Browse sports venues and view venue details
- Create and view bookings
- Create games and join games with other players
- View player profiles
- Real-time chat using Socket.IO
- Admin-only venue creation
- Sports news endpoint powered by GNews (optional API key)
- Responsive React UI

> This is an original starter implementation inspired by the general idea of sports booking and matchmaking apps. It is not a copy of another project's source code. Verify and complete each workflow before production use.

## Tech stack
- Frontend: React, Vite, Axios, Socket.IO Client
- Backend: Node.js, Express, MongoDB/Mongoose, JWT, bcryptjs, Socket.IO

## Requirements
- Node.js 20+
- MongoDB running locally or a MongoDB Atlas connection string

## Setup

### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Edit `backend/.env` and set `MONGO_URI` and a long random `JWT_SECRET`.
The API runs at `http://localhost:5000`.

### 2. Frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL printed by Vite, usually `http://localhost:5173`.

## Create an admin
Register a normal user, then set that user's `role` to `admin` in MongoDB:
```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```
Then sign out and sign back in.

## Optional sports news
Get a GNews API key and add it to `backend/.env` as `GNEWS_API_KEY=...`. Without a key, the endpoint returns an empty list with a setup message.

## Main API routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/venues`
- `GET /api/venues/:id`
- `POST /api/venues` (admin)
- `POST /api/bookings`
- `GET /api/bookings/mine`
- `GET /api/games`
- `POST /api/games`
- `POST /api/games/:id/join`
- `GET /api/users`
- `GET /api/news`
- Socket.IO event `chat:message`

## Important limitations
This is a functional starter, not a production-ready booking platform. Before deployment, add stronger input validation, rate limiting, email verification/password reset, payment handling if needed, booking overlap protection with database-level safeguards, moderation/reporting, tests, and production security configuration. Never commit `.env` or secrets.
