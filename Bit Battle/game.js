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

// Player in world pixel coordinates (not grid)
const player = {
    x: Math.random() * GRID_WIDTH * TILE_WIDTH,
    y: Math.random() * GRID_HEIGHT * TILE_HEIGHT,
    color: 'red',
    speed: 5 // pixels per frame
};

const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Convert grid units to screen coordinates
function isoToScreen(gridX, gridY) {
    return {
        x: (gridX - gridY) * TILE_WIDTH / 2,
        y: (gridX + gridY) * TILE_HEIGHT / 2
    };
}

function gameLoop() {
    // --- Move player along screen axes (independent of grid) ---
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;

    // Clamp player inside world bounds
    player.x = Math.max(0, Math.min(player.x, GRID_WIDTH * TILE_WIDTH));
    player.y = Math.max(0, Math.min(player.y, GRID_HEIGHT * TILE_HEIGHT));

    // --- Camera follows player ---
    const camX = player.x - canvas.width / 2;
    const camY = player.y - canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Draw visible tiles ---
    const startI = Math.max(0, Math.floor(camX / TILE_WIDTH) - 2);
    const endI = Math.min(GRID_WIDTH, Math.ceil((camX + canvas.width) / TILE_WIDTH) + 2);
    const startJ = Math.max(0, Math.floor(camY / TILE_HEIGHT) - 2);
    const endJ = Math.min(GRID_HEIGHT, Math.ceil((camY + canvas.height) / TILE_HEIGHT) + 2);

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

            // Draw boundaries for edges
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
