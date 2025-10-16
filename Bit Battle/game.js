const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Make canvas fit screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const GRID_WIDTH = 250;
const GRID_HEIGHT = 250;

// Player position in screen-independent world coordinates (float)
const player = {
    x: GRID_WIDTH * TILE_WIDTH / 2, // middle of the world in pixels
    y: GRID_HEIGHT * TILE_HEIGHT / 2,
    color: 'red',
    speed: 5 // pixels per frame
};

// Keys pressed
const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Convert world pixel coordinates to isometric screen coordinates
function isoToScreen(x, y) {
    return {
        x: (x - y) / 2,
        y: (x + y) / 4
    };
}

// Clamp a value
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function gameLoop() {
    // --- Move player relative to screen axes ---
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;

    // Clamp player within world bounds in pixels
    const worldWidth = GRID_WIDTH * TILE_WIDTH;
    const worldHeight = GRID_HEIGHT * TILE_HEIGHT / 2; // account for isometric scaling
    player.x = clamp(player.x, 0, worldWidth);
    player.y = clamp(player.y, 0, worldHeight);

    // --- Camera follows player ---
    const camX = player.x - canvas.width / 2;
    const camY = player.y - canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Draw visible tiles ---
    const startI = Math.max(0, Math.floor((player.x - canvas.width) / TILE_WIDTH) - 2);
    const endI = Math.min(GRID_WIDTH, Math.ceil((player.x + canvas.width) / TILE_WIDTH) + 2);
    const startJ = Math.max(0, Math.floor((player.y - canvas.height) / TILE_HEIGHT) - 2);
    const endJ = Math.min(GRID_HEIGHT, Math.ceil((player.y + canvas.height) / TILE_HEIGHT) + 2);

    for (let i = startI; i < endI; i++) {
        for (let j = startJ; j < endJ; j++) {
            const iso = isoToScreen(i * TILE_WIDTH, j * TILE_HEIGHT);
            const screenX = iso.x - camX;
            const screenY = iso.y - camY;

            if (screenX + TILE_WIDTH / 2 < 0 || screenX - TILE_WIDTH / 2 > canvas.width) continue;
            if (screenY + TILE_HEIGHT < 0 || screenY > canvas.height) continue;

            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX + TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
            ctx.lineTo(screenX, screenY + TILE_HEIGHT);
            ctx.lineTo(screenX - TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
            ctx.closePath();
            ctx.stroke();
        }
    }

    // --- Draw player in center of screen ---
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
