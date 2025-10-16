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

// --- Player position in world pixel coordinates, random spawn ---
const player = {
    x: Math.random() * GRID_WIDTH * TILE_WIDTH,
    y: Math.random() * GRID_HEIGHT * TILE_HEIGHT,
    color: 'red',
    speed: 5
};

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

// Clamp value
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

    // --- Draw visible tiles to cover screen ---
    const startCol = Math.max(0, Math.floor((camX) / TILE_WIDTH) - 2);
    const endCol = Math.min(GRID_WIDTH, Math.ceil((camX + canvas.width) / TILE_WIDTH) + 2);
    const startRow = Math.max(0, Math.floor((camY) / TILE_HEIGHT) - 2);
    const endRow = Math.min(GRID_HEIGHT, Math.ceil((camY + canvas.height) / TILE_HEIGHT) + 2);

    for (let i = startCol; i < endCol; i++) {
        for (let j = startRow; j < endRow; j++) {
            const screen = isoToScreen(i * TILE_WIDTH, j * TILE_HEIGHT);
            const screenX = screen.x - camX;
            const screenY = screen.y - camY;

            // Draw tile
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX + TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
            ctx.lineTo(screenX, screenY + TILE_HEIGHT);
            ctx.lineTo(screenX - TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
            ctx.closePath();
            ctx.stroke();

            // Draw boundaries for first/last tiles
            if (i === 0 || j === 0 || i === GRID_WIDTH - 1 || j === GRID_HEIGHT - 1) {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fill();
            }
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
