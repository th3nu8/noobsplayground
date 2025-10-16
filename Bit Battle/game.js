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

// Player in **grid coordinates**, will move independently of grid
const player = {
    x: Math.floor(Math.random() * GRID_WIDTH),
    y: Math.floor(Math.random() * GRID_HEIGHT),
    color: 'red',
    speed: 0.15 // in grid units per frame
};

const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Convert grid coordinates to screen coordinates
function isoToScreen(gridX, gridY) {
    return {
        x: (gridX - gridY) * TILE_WIDTH / 2,
        y: (gridX + gridY) * TILE_HEIGHT / 2
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

    // Clamp player inside grid
    player.x = clamp(player.x, 0, GRID_WIDTH - 1);
    player.y = clamp(player.y, 0, GRID_HEIGHT - 1);

    // Camera offset so player stays centered
    const cam = isoToScreen(player.x, player.y);
    const camX = cam.x - canvas.width / 2;
    const camY = cam.y - canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Draw visible tiles to cover screen ---
    const buffer = 4; // extra tiles around screen
    const startI = Math.max(0, Math.floor(player.x - canvas.width / TILE_WIDTH) - buffer);
    const endI = Math.min(GRID_WIDTH, Math.ceil(player.x + canvas.width / TILE_WIDTH) + buffer);
    const startJ = Math.max(0, Math.floor(player.y - canvas.height / TILE_HEIGHT) - buffer);
    const endJ = Math.min(GRID_HEIGHT, Math.ceil(player.y + canvas.height / TILE_HEIGHT) + buffer);

    for (let i = startI; i < endI; i++) {
        for (let j = startJ; j < endJ; j++) {
            const screen = isoToScreen(i, j);
            const screenX = screen.x - camX;
            const screenY = screen.y - camY;

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

    // --- Draw player in center ---
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
