const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

const GRID_WIDTH = 250;
const GRID_HEIGHT = 250;

const player = {
    x: 125,  // start near the middle
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

// Convert grid coordinates to isometric screen coordinates
function isoToScreen(x, y) {
    return {
        x: (x - y) * TILE_WIDTH/2 - camX + canvas.width/2,
        y: (x + y) * TILE_HEIGHT/2 - camY + canvas.height/2
    };
}

// Game loop
function gameLoop() {
    // Move player
    if(keys['w'] && player.y > 0) player.y -= player.speed;
    if(keys['s'] && player.y < GRID_HEIGHT - 1) player.y += player.speed;
    if(keys['a'] && player.x > 0) player.x -= player.speed;
    if(keys['d'] && player.x < GRID_WIDTH - 1) player.x += player.speed;

    // Update camera to center on player
    const playerScreen = {
        x: (player.x - player.y) * TILE_WIDTH/2,
        y: (player.x + player.y) * TILE_HEIGHT/2
    };
    camX = playerScreen.x - canvas.width/2;
    camY = playerScreen.y - canvas.height/2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    const startI = Math.max(0, Math.floor(player.x - 20));
    const endI = Math.min(GRID_WIDTH, Math.ceil(player.x + 20));
    const startJ = Math.max(0, Math.floor(player.y - 15));
    const endJ = Math.min(GRID_HEIGHT, Math.ceil(player.y + 15));

    for(let i=startI; i<endI; i++){
        for(let j=startJ; j<endJ; j++){
            const pos = isoToScreen(i, j);
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
