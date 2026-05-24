import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import FormData from 'form-data';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const API_KEY = process.env.ROBLOX_API_KEY;
const GAME_ID = process.env.GAME_ID;
const PORT = process.env.PORT || 3000;

let UNIVERSE_ID = null;

UNIVERSE_ID = GAME_ID;
console.log(`ℹ️  Using ${GAME_ID} as Universe ID`);

async function getExistingNames() {
  const names = new Set();
  let pageToken = null;

  try {
    do {
      let url = `https://apis.roblox.com/game-passes/v1/universes/${UNIVERSE_ID}/game-passes/creator?pageSize=50`;
      if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;

      const res = await fetch(url, {
        headers: { 'x-api-key': API_KEY }
      });

      if (!res.ok) break;

      const data = await res.json();
      if (data.gamePasses) {
        data.gamePasses.forEach(gp => names.add(gp.name));
      }
      pageToken = data.nextPageToken || null;
    } while (pageToken);
  } catch (err) {
    console.error('⚠️  Could not fetch existing names:', err.message);
  }

  return names;
}

async function generateUniqueName(price) {
  const existingNames = await getExistingNames();
  const baseName = `Donate ${price} Robux`;

  if (!existingNames.has(baseName)) return baseName;

  let counter = 1;
  while (counter < 1000) {
    const name = `Donate ${price}.${counter} Robux`;
    if (!existingNames.has(name)) return name;
    counter++;
  }

  return `Donate ${price} Robux ${Date.now()}`;
}

app.post('/api/create-gamepass', async (req, res) => {
  const { price } = req.body;

  if (!price || !Number.isInteger(price) || price < 1) {
    return res.status(400).json({ error: 'Price must be a whole number ≥ 1 Robux' });
  }

  if (!UNIVERSE_ID) {
    return res.status(500).json({ error: 'Universe ID not resolved yet. Try again.' });
  }

  try {
    const name = await generateUniqueName(price);

    const form = new FormData();
    form.append('name', name);
    form.append('description', `Donate ${price} Robux`);
    form.append('isForSale', 'true');
    form.append('price', String(price));

    console.log(`🎮 Creating gamepass: "${name}" @ ${price} R$`);

    const response = await fetch(
      `https://apis.roblox.com/game-passes/v1/universes/${UNIVERSE_ID}/game-passes`,
      {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          ...form.getHeaders()
        },
        body: form
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Roblox API ${response.status}:`, errorText);
      return res.status(response.status).json({
        error: `Roblox API error (${response.status})`,
        details: errorText
      });
    }

    const data = await response.json();

    console.log(`✅ Created gamepass ID: ${data.gamePassId}`);

    res.json({
      success: true,
      gamePassId: data.gamePassId,
      name: data.name,
      price: price,
      link: `https://www.roblox.com/game-pass/${data.gamePassId}`
    });
  } catch (err) {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: 'Failed to create gamepass', details: err.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    universeId: UNIVERSE_ID,
    gameId: GAME_ID
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Gamepass Creator running at http://localhost:${PORT}\n`);
});
