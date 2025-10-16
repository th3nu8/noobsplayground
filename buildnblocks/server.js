// ---- server.js (adapted for /mygame) ----
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// 1. PRIMARY SETUP
const app = express();
const server = http.createServer(app);

// IMPORTANT: set socket.io path to match the /mygame prefix
const io = new Server(server, {
  cors: { origin: "*" },
  path: '/mygame/socket.io'
});

// 2. HEALTH CHECK ROUTE (keep for platforms like Render)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 3. Serve static files under /mygame
//    This makes URLs like /mygame/index.html, /mygame/stud.png work.
const BASE = '/mygame';
app.use(BASE, express.static(path.join(__dirname, 'public')));

// Redirect root (optional: helps if someone visits the site root)
app.get('/', (req, res) => {
  res.redirect(`${BASE}/`);
});

// ----- WORLD STATE & FUNCTIONS -----
// (unchanged logic from your original file)
const GROUND_MIN = -25;
const GROUND_MAX = 24;
const GROUND_Y = 0;

const blocks = new Map();
const players = new Map();

const keyOf = (x,y,z) => `${x}|${y}|${z}`;

function addBlock(x,y,z, color = 0xffffff, indestructible = false) {
  const k = keyOf(x,y,z);
  if (blocks.has(k)) return false;
  blocks.set(k, { x, y, z, color, indestructible });
  return true;
}

function removeBlock(x,y,z) {
  const k = keyOf(x,y,z);
  const b = blocks.get(k);
  if (!b || b.indestructible) return false;
  blocks.delete(k);
  return true;
}

function buildGround() {
  for (let x = GROUND_MIN; x <= GROUND_MAX; x++) {
    for (let z = GROUND_MIN; z <= GROUND_MAX; z++) {
      addBlock(x, GROUND_Y, z, 0xffffff, true);
    }
  }
}
buildGround();

const MAX_BLOCKS_UPLOAD = 999999999;
const MIN_COORD = -512;
const MAX_COORD = 512;

let currentVote = null;

function startVote(socket, worldData) {
  if (currentVote) {
    socket.emit("vote-error", { message: "A vote is already in progress!" });
    return;
  }

  const totalPlayers = players.size;
  const needed = Math.ceil(totalPlayers / 2);

  currentVote = {
    initiator: socket.id,
    votes: new Map([[socket.id, true]]),
    worldData,
    needed,
  };

  io.emit("vote-start", {
    initiator: players.get(socket.id)?.name || "Player",
    needed,
    yesCount: 1,
    totalPlayers,
  });

  checkVoteResult();
}

function castVote(socket, choice) {
  if (!currentVote) return;

  currentVote.votes.set(socket.id, choice);

  io.emit("vote-update", {
    voter: players.get(socket.id)?.name || "Player",
    yesCount: Array.from(currentVote.votes.values()).filter(v => v).length,
    noCount: Array.from(currentVote.votes.values()).filter(v => !v).length,
    needed: currentVote.needed,
  });

  checkVoteResult();
}

function checkVoteResult() {
  if (!currentVote) return;
  const yesCount = Array.from(currentVote.votes.values()).filter(v => v).length;

  if (yesCount >= currentVote.needed) {
    applyWorldLoad(currentVote.worldData);
    io.emit("vote-success", { yesCount, needed: currentVote.needed });
    currentVote = null;
  }
}

// ----- SOCKET.IO CONNECTION HANDLER -----
io.on('connection', (socket) => {
  socket.emit('init', {
    blocks: Array.from(blocks.values()),
    players: Object.fromEntries(players),
  });

  socket.on("chat", data => {
    io.emit("chat", data);
  });

  socket.on('join', (p) => {
    players.set(socket.id, {
      x: p?.x ?? 0, y: p?.y ?? 2.5, z: p?.z ?? 0,
      yaw: p?.yaw ?? 0, name: p?.name ?? 'Player'
    });
    socket.broadcast.emit('player-join', { id: socket.id, ...players.get(socket.id) });
  });

  socket.on('move', (p) => {
    const me = players.get(socket.id);
    if (!me) return;
    if (typeof p.x === 'number') me.x = p.x;
    if (typeof p.y === 'number') me.y = p.y;
    if (typeof p.z === 'number') me.z = p.z;
    if (typeof p.yaw === 'number') me.yaw = p.yaw;
    if (typeof p.name === 'string') me.name = p.name.slice(0, 24);
    socket.broadcast.emit('player-update', { id: socket.id, ...me });
  });

  socket.on('name-change', ({ name }) => {
    const me = players.get(socket.id);
    if (!me) return;
    me.name = String(name || 'Player').slice(0, 24);
    socket.broadcast.emit('player-update', { id: socket.id, name: me.name });
  });

  socket.on('build', ({ x, y, z, color }) => {
    if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z)) return;
    if (x < MIN_COORD || x > MAX_COORD || y < MIN_COORD || y > MAX_COORD || z < MIN_COORD || z > MAX_COORD) return;
    const safeColor = (typeof color === 'number' && color >= 0 && color <= 0xffffff) ? color : 0xffffff;
    if (addBlock(x, y, z, safeColor, false)) {
      io.emit('build', { x, y, z, color: safeColor });
    }
  });

  socket.on('remove', ({ x, y, z }) => {
    if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z)) return;
    if (removeBlock(x, y, z)) {
      io.emit('remove', { x, y, z });
    }
  });

  socket.on('request-save', () => {
    socket.emit('world-data', { blocks: Array.from(blocks.values()) });
  });

  socket.on('load-world', (payload) => {
    try {
      if (!payload || !Array.isArray(payload.blocks)) return;
      if (payload.blocks.length > MAX_BLOCKS_UPLOAD) return;

      startVote(socket, payload);
    } catch (e) {
      console.error('load-world error:', e);
    }
  });

  socket.on("vote", ({ choice }) => {
    if (typeof choice !== "boolean") return;
    castVote(socket, choice);
  });

  socket.on('disconnect', () => {
    if (players.has(socket.id)) {
      socket.broadcast.emit('player-leave', { id: socket.id });
      players.delete(socket.id);
    }
  });
});

function applyWorldLoad(payload) {
  const incoming = payload.blocks;

  for (const [k, b] of blocks) {
    if (!b.indestructible) blocks.delete(k);
  }

  let added = 0;
  for (const raw of incoming) {
    if (!raw || !Number.isFinite(raw.x) || !Number.isFinite(raw.y) || !Number.isFinite(raw.z)) continue;

    const x = Math.round(raw.x);
    const y = Math.round(raw.y);
    const z = Math.round(raw.z);
    if (x < MIN_COORD || x > MAX_COORD || y < MIN_COORD || y > MAX_COORD || z < MIN_COORD || z > MAX_COORD) continue;

    const color = (typeof raw.color === 'number' && raw.color >= 0 && raw.color <= 0xffffff) ? raw.color : 0xffffff;

    const k = keyOf(x, y, z);
    if (blocks.has(k) && blocks.get(k).indestructible) continue;

    if (addBlock(x, y, z, color, false)) added++;
  }

  io.emit('world-set', { blocks: Array.from(blocks.values()) });
  console.log(`World loaded: ${added} blocks (excluding ground).`);
}

// 4. SERVER START
// Use PORT env var (we recommend 3001 for this site)
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
