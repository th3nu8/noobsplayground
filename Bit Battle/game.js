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
const GRID_WIDTH = 50;
const GRID_HEIGHT = 50;

// Convert grid coordinates to isometric screen coordinates
function isoToScreen(gridX, gridY) {
    return {
        x: (gridX - gridY) * (TILE_WIDTH / 2),
        y: (gridX + gridY) * (TILE_HEIGHT / 2)
    };
}

// Convert pixel coordinates to approximate grid coordinates
function pixelToGrid(px, py) {
    const gridX = (px / (TILE_WIDTH / 2) + py / (TILE_HEIGHT / 2)) / 2;
    const gridY = (py / (TILE_HEIGHT / 2) - px / (TILE_WIDTH / 2)) / 2;
    return { x: gridX, y: gridY };
}

// Spawn player inside grid
function spawnPlayer() {
    const gridX = Math.floor(Math.random() * GRID_WIDTH);
    const gridY = Math.floor(Math.random() * GRID_HEIGHT);
    const screen = isoToScreen(gridX, gridY);
    return { x: screen.x, y: screen.y };
}

const player = {
    ...spawnPlayer(),
    color: 'red',
    speed: 5
};

const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function gameLoop() {
    let newX = player.x;
    let newY = player.y;

    // Calculate desired movement
    if (keys['w']) newY -= player.speed;
    if (keys['s']) newY += player.speed;
    if (keys['a']) newX -= player.speed;
    if (keys['d']) newX += player.speed;

    // --- Check X movement ---
    const gridCheckX = pixelToGrid(newX, player.y);
    if (gridCheckX.x >= 0 && gridCheckX.x <= GRID_WIDTH - 1 &&
        gridCheckX.y >= 0 && gridCheckX.y <= GRID_HEIGHT - 1) {
        player.x = newX;
    }

    // --- Check Y movement ---
    const gridCheckY = pixelToGrid(player.x, newY);
    if (gridCheckY.x >= 0 && gridCheckY.x <= GRID_WIDTH - 1 &&
        gridCheckY.y >= 0 && gridCheckY.y <= GRID_HEIGHT - 1) {
        player.y = newY;
    }

    // Camera offset
    const camX = player.x;
    const camY = player.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw tiles
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            const screen = isoToScreen(i, j);
            const screenX = screen.x - camX + canvas.width / 2;
            const screenY = screen.y - camY + canvas.height / 2;

            if (screenX + TILE_WIDTH/2 < 0 || screenX - TILE_WIDTH/2 > canvas.width) continue;
            if (screenY + TILE_HEIGHT < 0 || screenY > canvas.height) continue;

            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX + TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
            ctx.lineTo(screenX, screenY + TILE_HEIGHT);
            ctx.lineTo(screenX - TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
            ctx.closePath();
            ctx.stroke();

            // Draw visual boundaries
            if (i === 0 || j === 0 || i === GRID_WIDTH - 1 || j === GRID_HEIGHT - 1) {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fill();
            }
        }
    }

    // Draw player
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
