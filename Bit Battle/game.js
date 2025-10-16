const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

const GRID_WIDTH = 250;
const GRID_HEIGHT = 250;

const player = {
    x: 125, // start in middle
    y: 125,
    color: 'red',
    speed: 0.2
};

const keys = {};

// Camera offset
let camX = 0;
let camY = 0;

// Key events
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Convert grid coordinates to isometric screen coordinates (with camera)
function isoToScreen(x, y) {
    return {
        x: (x - y) * TILE_WIDTH/2 - camX + canvas.width/2,
        y: (x + y) * TILE_HEIGHT/2 - camY + canvas.height/2
    };
}

// Game loop
function gameLoop() {
    // Move player with edge constraints
    if(keys['w'] && player.y > 0) player.y -= player.speed;
    if(keys['s'] && player.y < GRID_HEIGHT - 1) player.y += player.speed;
    if(keys['a'] && player.x > 0) player.x -= player.speed;
    if(keys['d'] && player.x < GRID_WIDTH - 1) player.x += player.speed;

    // Calculate camera to center player
    const playerScreenX = (player.x - player.y) * TILE_WIDTH/2;
    const playerScreenY = (player.x + player.y) * TILE_HEIGHT/2;

    camX = playerScreenX - canvas.width/2;
    camY = playerScreenY - canvas.height/2;

    // Clamp camera so it doesn't show outside map
    const maxCamX = (GRID_WIDTH - GRID_HEIGHT) * TILE_WIDTH/2;
    const maxCamY = (GRID_WIDTH + GRID_HEIGHT) * TILE_HEIGHT/2;

    camX = Math.max(0, Math.min(camX, maxCamX - canvas.width));
    camY = Math.max(0, Math.min(camY, maxCamY - canvas.height));

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw visible grid
    for(let i = 0; i < GRID_WIDTH; i++){
        for(let j = 0; j < GRID_HEIGHT; j++){
            const pos = isoToScreen(i, j);

            // Only draw tiles visible on screen
            if(pos.x + TILE_WIDTH/2 < 0 || pos.x - TILE_WIDTH/2 > canvas.width) continue;
            if(pos.y + TILE_HEIGHT < 0 || pos.y > canvas.height) continue;

            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos.x + TILE_WIDTH/2, pos.y + TILE_HEIGHT/2);
            ctx.lineTo(pos.x, pos.y + TILE_HEIGHT);
            ctx.lineTo(pos.x - TILE_WIDTH/2, pos.y + TILE_HEIGHT/2);
            ctx.closePath();
            ctx.stroke();
        }
    }

    // Draw player
    const playerPos = isoToScreen(player.x, player.y);
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(playerPos.x, playerPos.y + TILE_HEIGHT/2, 10, 0, Math.PI*2);
    ctx.fill();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
