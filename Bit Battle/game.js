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
const GRID_WIDTH = 50;  // smaller for testing
const GRID_HEIGHT = 50;

// Player spawn **strictly inside world bounds**
const player = {
    x: Math.random() * (GRID_WIDTH - 1) * TILE_WIDTH,
    y: Math.random() * (GRID_HEIGHT - 1) * TILE_HEIGHT,
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

function gameLoop() {
    // Move player along screen axes
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;

    // Clamp player strictly inside the map boundaries
    player.x = Math.max(0, Math.min(player.x, (GRID_WIDTH - 1) * TILE_WIDTH));
    player.y = Math.max(0, Math.min(player.y, (GRID_HEIGHT - 1) * TILE_HEIGHT));

    // Camera offset (player in center)
    const camX = player.x;
    const camY = player.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw tiles
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            const worldX = i * TILE_WIDTH;
            const worldY = j * TILE_HEIGHT;
            const screen = isoToScreen(worldX, worldY);
            const screenX = screen.x - camX + canvas.width / 2;
            const screenY = screen.y - camY + canvas.height / 2;

            // Skip tiles outside the screen
            if (screenX + TILE_WIDTH / 2 < 0 || screenX - TILE_WIDTH / 2 > canvas.width) continue;
            if (screenY + TILE_HEIGHT < 0 || screenY > canvas.height) continue;

            // Draw tile diamond
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

    // Draw player at center
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
