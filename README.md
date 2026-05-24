# Auto Roblox Gamepass Creator

A lightweight Node.js server that automatically creates donation gamepasses in your Roblox game via the Roblox Open Cloud API. Set a price, hit the endpoint, and the gamepass gets created instantly — no manual Studio work needed.

---

## ⚠️ Disclaimer

This project is not affiliated with, endorsed by, or associated with Roblox Corporation in any way. Use of the Roblox Open Cloud API is subject to [Roblox's Terms of Use](https://en.help.roblox.com/hc/en-us/articles/115004647846) and [API usage policies](https://create.roblox.com/docs/reference/cloud). You are solely responsible for how you use this tool. The author takes no responsibility for account actions, bans, or policy violations that may result from misuse.

**Never share or commit your `.env` file or API key publicly.** If your API key is ever exposed, revoke it immediately in the [Roblox Creator Dashboard](https://create.roblox.com/credentials).

---

## Requirements

- [Node.js](https://nodejs.org/) v18 or higher
- A Roblox account with a published game
- A Roblox Open Cloud API key with **gamepass write** permissions

---

## Setup

**1. Clone the repo**
```bash
git clone https://github.com/yourusername/Auto-Roblox-Gamepass-Creator.git
cd Auto-Roblox-Gamepass-Creator
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure your environment**

Rename `.env.example` to `.env` (or create a new `.env` file) and fill in your values:
```env
ROBLOX_API_KEY=your_api_key_here
GAME_ID=your_universe_id_here
PORT=3000
```

- `ROBLOX_API_KEY` — Generate this at [create.roblox.com/credentials](https://create.roblox.com/credentials). Make sure it has permission to create gamepasses.
- `GAME_ID` — Your game's **Universe ID** (found in Creator Dashboard under your game's settings).
- `PORT` — The port the server runs on. Defaults to `3000` if not set.

**4. Start the server**
```bash
npm start
```

The server will be running at `http://localhost:3000`.

---

## Usage

Send a POST request to `/api/create-gamepass` with a JSON body:

```json
{
  "price": 100
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/api/create-gamepass \
  -H "Content-Type: application/json" \
  -d '{"price": 100}'
```

**Successful response:**
```json
{
  "success": true,
  "gamePassId": "123456789",
  "name": "Donate 100 Robux",
  "price": 100,
  "link": "https://www.roblox.com/game-pass/123456789"
}
```

The server automatically handles duplicate names by appending a counter (e.g. `Donate 100.1 Robux`) if a gamepass with that name already exists.

You can also check the server status at:
```
GET http://localhost:3000/api/status
```

---

## Security

- **Never commit your `.env` file.** Make sure `.env` is listed in your `.gitignore`.
- If your API key is ever leaked, revoke it immediately at [create.roblox.com/credentials](https://create.roblox.com/credentials) and generate a new one.
- Keep your API key scoped to only the permissions it needs (gamepass creation only).
