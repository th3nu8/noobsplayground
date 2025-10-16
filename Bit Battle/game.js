const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const GRID_WIDTH = 50;  // reduce for testing
const GRID_HEIGHT = 50;

// Player in world pixel coordinates
const player = {
    x: Math.random() * (GRID_WIDTH - 1) * TILE_WIDTH,
    y: Math.random() * (GRID_HEIGHT - 1) * TILE_HEIGHT,
    color: 'red',
    speed: 5
};

const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Convert grid coordinates to screen coordinates
function isoToScreen(gridX, gridY) {
    return {
        x: (gridX - gridY) * (TILE_WIDTH / 2),
        y: (gridX + gridY) * (TILE_HEIGHT / 2)
    };
}

function gameLoop() {
    // Move player along screen axes
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;

    // Clamp player inside map bounds
    player.x = Math.max(0, Math.min(player.x, (GRID_WIDTH - 1) * TILE_WIDTH));
    player.y = Math.max(0, Math.min(player.y, (GRID_HEIGHT - 1) * TILE_HEIGHT));

    // Camera offset (player centered)
    const camX = player.x;
    const camY = player.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw tiles in grid units
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            const screen = isoToScreen(i, j);
            const screenX = screen.x - camX + canvas.width / 2;
            const screenY = screen.y - camY + canvas.height / 2;

            // Skip tiles outside screen
            if (screenX + TILE_WIDTH/2 < 0 || screenX - TILE_WIDTH/2 > canvas.width) continue;
            if (screenY + TILE_HEIGHT < 0 || screenY > canvas.height) continue;

            // Draw diamond tile
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(screenX, screenY); // top
            ctx.lineTo(screenX + TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2); // right
            ctx.lineTo(screenX, screenY + TILE_HEIGHT); // bottom
            ctx.lineTo(screenX - TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2); // left
            ctx.closePath();
            ctx.stroke();

            // Draw boundaries for first/last tiles
            if (i === 0 || j === 0 || i === GRID_WIDTH - 1 || j === GRID_HEIGHT - 1) {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fill();
            }
        }
    }

    // Draw player at center
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
