const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

const GRID_WIDTH = 250;
const GRID_HEIGHT = 250;

// Player position in grid coordinates
const player = {
    x: 125,
    y: 125,
    color: 'red',
    speed: 0.2
};

const keys = {};

// Listen to key events
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Convert grid to screen (isometric) coordinates
function isoToScreen(x, y) {
    return {
        x: (x - y) * TILE_WIDTH / 2,
        y: (x + y) * TILE_HEIGHT / 2
    };
}

// Main loop
function gameLoop() {
    // Move player in grid
    if (keys['w'] && player.y > 0) player.y -= player.speed;
    if (keys['s'] && player.y < GRID_HEIGHT - 1) player.y += player.speed;
    if (keys['a'] && player.x > 0) player.x -= player.speed;
    if (keys['d'] && player.x < GRID_WIDTH - 1) player.x += player.speed;

    // Calculate camera so player is centered
    const playerScreen = isoToScreen(player.x, player.y);
    const camX = playerScreen.x - canvas.width / 2;
    const camY = playerScreen.y - canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw visible tiles only (approximate)
    const startI = Math.max(0, Math.floor(player.x - 20));
    const endI = Math.min(GRID_WIDTH, Math.ceil(player.x + 20));
    const startJ = Math.max(0, Math.floor(player.y - 15));
    const endJ = Math.min(GRID_HEIGHT, Math.ceil(player.y + 15));

    for (let i = startI; i < endI; i++) {
        for (let j = startJ; j < endJ; j++) {
            const pos = isoToScreen(i, j);
            const screenX = pos.x - camX;
            const screenY = pos.y - camY;

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

    // Draw player
    const playerScreenX = canvas.width / 2;
    const playerScreenY = canvas.height / 2;
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(playerScreenX, playerScreenY + TILE_HEIGHT / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
