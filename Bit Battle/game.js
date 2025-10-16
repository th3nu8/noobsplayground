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

// Player world coordinates in **grid units**, independent of tile alignment
const player = {
    x: GRID_WIDTH / 2,
    y: GRID_HEIGHT / 2,
    color: 'red',
    speed: 0.15
};

const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Convert **grid units** to isometric screen coordinates
function isoToScreen(x, y) {
    return {
        x: (x - y) * TILE_WIDTH / 2,
        y: (x + y) * TILE_HEIGHT / 2
    };
}

// Clamp value
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function gameLoop() {
    // --- Player movement relative to screen axes ---
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;

    // Clamp player within grid
    player.x = clamp(player.x, 0, GRID_WIDTH - 1);
    player.y = clamp(player.y, 0, GRID_HEIGHT - 1);

    // Camera centered on player
    const cam = isoToScreen(player.x, player.y);
    const camX = cam.x - canvas.width / 2;
    const camY = cam.y - canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw visible tiles around player
    const startI = Math.max(0, Math.floor(player.x - 20));
    const endI = Math.min(GRID_WIDTH, Math.ceil(player.x + 20));
    const startJ = Math.max(0, Math.floor(player.y - 20));
    const endJ = Math.min(GRID_HEIGHT, Math.ceil(player.y + 20));

    for (let i = startI; i < endI; i++) {
        for (let j = startJ; j < endJ; j++) {
            const pos = isoToScreen(i, j);
            const screenX = pos.x - camX;
            const screenY = pos.y - camY;

            // Draw tile if on screen
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

    // Draw player in center of screen
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2 + TILE_HEIGHT / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
