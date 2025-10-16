const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Fullscreen canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const TILE_WIDTH = 64; // width of diamond
const TILE_HEIGHT = 32; // height of diamond
const GRID_WIDTH = 250;
const GRID_HEIGHT = 250;

// Player in world pixel coordinates
const player = {
    x: Math.random() * GRID_WIDTH * TILE_WIDTH,
    y: Math.random() * GRID_HEIGHT * TILE_HEIGHT,
    color: 'red',
    speed: 5
};

const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Convert grid coordinates to isometric screen coordinates
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

    // Clamp player to world bounds
    player.x = Math.max(0, Math.min(player.x, GRID_WIDTH * TILE_WIDTH));
    player.y = Math.max(0, Math.min(player.y, GRID_HEIGHT * TILE_HEIGHT));

    // Camera offset (player in center)
    const camX = player.x;
    const camY = player.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw only tiles visible on screen
    const buffer = 10; // extra tiles around screen
    const minI = 0;
    const maxI = GRID_WIDTH;
    const minJ = 0;
    const maxJ = GRID_HEIGHT;

    for (let i = minI; i < maxI; i++) {
        for (let j = minJ; j < maxJ; j++) {
            const screen = isoToScreen(i, j);
            const screenX = screen.x - camX + canvas.width / 2;
            const screenY = screen.y - camY + canvas.height / 2;

            // Skip tiles outside screen
            if (screenX + TILE_WIDTH / 2 < 0 || screenX - TILE_WIDTH / 2 > canvas.width) continue;
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

            // Draw boundaries
            if (i === 0 || j === 0 || i === GRID_WIDTH - 1 || j === GRID_HEIGHT - 1) {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fill();
            }
        }
    }

    // Draw player in center
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
