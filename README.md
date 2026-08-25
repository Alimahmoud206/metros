# Metro Live Backend

Real-time backend powering a live metro station information system —
passengers see live announcements per station, admins post updates and
see viewer counts, all in real time via Socket.io.

## Tech
Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, bcrypt, Jest/Supertest

## Install
1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill in `MONGO_URI` and `JWT_SECRET`
   (also set `ADMIN_EMAIL` / `ADMIN_PASSWORD` — these become your first admin login)

   `MONGO_URI` must include your real cluster address and end in `/metros` so
   Mongoose connects to the `metros` database, e.g.:
   `mongodb+srv://myuser:mypassword@cluster0.ab1cd.mongodb.net/metros?retryWrites=true&w=majority`
4. `npm run seed` — loads station data and creates the admin account

## Run
- Dev: `npm run dev`
- Prod: `npm start`
- Test: `npm test` (run `npm run seed` first — the login test needs the seeded admin)
- App runs on **http://localhost:3000** by default (`PORT` in `.env`)
- Health check: `GET /health`

## Pages
- Passenger board: `http://localhost:3000/index.html`
- Admin panel: `http://localhost:3000/admin.html` (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)

## API
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| GET | `/api/v1/stations` | — | List all stations, sorted by line then order |
| POST | `/api/v1/auth/login` | — | Admin login, returns a JWT |
| GET | `/api/v1/stations/:id/announcements` | — | Paginated, newest-first announcements for a station |
| POST | `/api/v1/stations/:id/announcements` | Bearer JWT (admin) | Create an announcement; broadcasts it live over Socket.io |

## Socket.io events
- `joinStation` (emit, client → server): `socket.emit('joinStation', stationId)`
- `leaveStation` (emit, client → server): `socket.emit('leaveStation')`
- `presenceUpdate` (listen, server → client): `{ stationId, viewers }`
- `announcement` (listen, server → client): the newly created announcement document

## Error status codes
Every error response has the shape `{ success: false, message: '...' }`. Status codes used:
- `400` — validation failure (bad/missing body or query fields, invalid station id format)
- `401` — missing/invalid/expired token, or bad login credentials
- `403` — valid token but not an admin
- `404` — station not found
- `500` — unexpected server error

## Postman (Task 8)
A ready-made collection is in `postman/Metro-Live-API.postman_collection.json`, with folders that mirror the route structure:
- **Auth** → login (valid + invalid credentials)
- **Stations** → get all stations
- **Announcements** → get announcements, create announcement (admin), create announcement with no token (expect 401)

Every request has a saved example response, and a couple of them auto-populate collection variables so you can run the whole flow top to bottom without manual copy-pasting:
1. Import `postman/Metro-Live-API.postman_collection.json` into Postman.
2. Set the collection variable `baseUrl` if you're not on `http://localhost:3000`.
3. Run **Auth → Login (valid credentials)** first — its test script saves the returned JWT into the `token` variable.
4. Run **Stations → Get all stations** — its test script saves the first station's id into `stationId`.
5. Run the **Announcements** requests — they use `{{stationId}}` and `{{token}}` automatically.

## Running the tests for real (Task 7)
This project's tests need a live MongoDB connection (they call `connectDB()` in `beforeAll`), so:
```bash
npm install
cp .env.example .env      # fill in a real MONGO_URI + JWT_SECRET
npm run seed                # creates stations + the admin account the login test uses
npm test
```
Expected: 4 passing tests (health, stations list, valid login, invalid login, protected-route-without-token — 5 assertions across 4 `describe` blocks). If a test fails, the failure message will point at which endpoint/status code doesn't match — paste it to me and I'll fix the code.

## Deploying to Render + MongoDB Atlas (Task 7)
1. **Atlas**: if you haven't already, create a free cluster at mongodb.com/atlas, add a database user, and allow network access from anywhere (`0.0.0.0/0`) for Render to reach it. Copy the connection string.
2. **Push to GitHub**: commit this project to a GitHub repo (`.env` stays out of it via `.gitignore`).
3. **Render**: go to render.com → New → Web Service → connect your GitHub repo.
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Environment variables** (Render dashboard → Environment): add `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Do **not** set `PORT` — Render injects its own and your code already falls back to it via `process.env.PORT`.
4. Once deployed, run the seed script once against production data. Easiest way: temporarily add a Render **Shell** run of `npm run seed` (Render dashboard → your service → Shell), using the same `MONGO_URI` as the live app.
5. Verify: open `https://<your-service>.onrender.com/health` — should return `{ "status": "ok", ... }`.

## Two-tab live demo (Task 8)
1. Run the server (locally or on Render).
2. Open the passenger board in one tab: `/index.html`.
3. Open the admin panel in a second tab: `/admin.html`, sign in, and select the **same station** the passenger tab is showing.
4. Post an announcement from the admin tab — it should appear in the passenger tab's feed instantly, no refresh.
5. In the passenger tab, switch to a different station, then back — the "watching this station" count in both tabs should update live as the socket joins/leaves rooms.
