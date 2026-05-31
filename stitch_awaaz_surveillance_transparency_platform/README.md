# AWAAZ — OS - Local Setup

This repository runs a simple Express + SQLite demo backend and static frontend. It includes automatic migrations and a default admin user for quick setup.

Quick start (foreground):

```bash
cd stitch_awaaz_surveillance_transparency_platform
npm install
npm start
```

Quick start (background, no pm2):

```bash
cd stitch_awaaz_surveillance_transparency_platform
# start in background and save pid
nohup node server.js > awaaz.log 2>&1 & echo $! > .awaaz.pid
# watch logs
tail -f awaaz.log
# stop
kill $(cat .awaaz.pid) || true
```

Using pm2 (recommended if you have permissions):

```bash
npm install -g pm2
pm2 start server.js --name awaaz
pm2 save
pm2 logs awaaz
```

Environment and defaults:
- `PORT` defaults to `3000`.
- `JWT_SECRET` defaults to a development string — set a secure value in production.
- `ADMIN_PASS` can be set before first run to change the default admin password (default: `adminpass`).

API endpoints:
- `GET /api/reports` — public list of reports
- `POST /api/register` — register `{ username, password }`
- `POST /api/login` — login `{ username, password }` returns `{ token }`
- `POST /api/reports` — protected, requires `Authorization: Bearer <token>`; body: `{ title, description, lat, lon, tags }`
- `GET /api/me` — protected, returns `{ id, username, role }`

Notes on LAN access:
- The server binds to `0.0.0.0` by default; use your machine IP to access from other devices: `http://192.168.x.y:3000`.
- Ensure your OS firewall allows inbound connections to the chosen port.

If you want, I can:
- Revert any remaining UI copy edits.
- Install and configure `pm2` (may require elevated permissions).
- Add a small systemd or launchd service for startup.

# AWAAZ Surveillance Transparency Platform

Local development and setup

Requirements:
- Node.js 18+ (or compatible LTS)
- npm

Quick start:

```bash
cd stitch_awaaz_surveillance_transparency_platform
npm install
# postinstall runs migrations automatically; alternatively:
# npm run migrate
npm start
```

Environment variables (create a `.env` file):

- `PORT` - server port (default 3000)
- `JWT_SECRET` - secret for JWT tokens (change in production)
- `ADMIN_PASS` - default admin password created by the migration if no admin exists
- `OPENAI_API_KEY` - (optional) to enable OpenAI responses

Notes:
- The project uses SQLite for local demo data, stored in `awaaz.db` in the project root.
- Run `npm run migrate` to create the database and initial admin user manually.
- If you see permission errors on `git push`, prefer SSH or create a GitHub PAT.

If you plan to open this in another VS Code instance, run `npm install` then `npm start`.

# env example updated
