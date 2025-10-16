const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Fullscreen canvas
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

// Player position in **world pixel coordinates**
const player = {
    x: (GRID_WIDTH / 2) * TILE_WIDTH,
    y: (GRID_HEIGHT / 2) * TILE_HEIGHT,
    color: 'red',
    speed: 5 // pixels per frame
};

const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Convert world pixel coordinates to isometric screen coordinates
function isoToScreen(px, py) {
    return {
        x: (px - py) / 2,
        y: (px + py) / 4
    };
}

// Clamp player inside world bounds
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function gameLoop() {
    // --- Move player along screen axes ---
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;

    // Clamp player inside world bounds
    const worldWidth = GRID_WIDTH * TILE_WIDTH;
    const worldHeight = GRID_HEIGHT * TILE_HEIGHT;
    player.x = clamp(player.x, 0, worldWidth);
    player.y = clamp(player.y, 0, worldHeight);

    // --- Camera follows player ---
    const camX = player.x - canvas.width / 2;
    const camY = player.y - canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Draw all visible tiles to cover screen ---
    const cols = Math.ceil(canvas.width / TILE_WIDTH) + 4;
    const rows = Math.ceil(canvas.height / TILE_HEIGHT) + 4;

    // Estimate top-left tile in world pixels
    const startX = Math.floor(camX - TILE_WIDTH * 2);
    const startY = Math.floor(camY - TILE_HEIGHT * 2);

    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            const worldX = i * TILE_WIDTH;
            const worldY = j * TILE_HEIGHT;
            const screenPos = isoToScreen(worldX, worldY);
            const screenX = screenPos.x - camX;
            const screenY = screenPos.y - camY;

            // Only draw if on screen
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
