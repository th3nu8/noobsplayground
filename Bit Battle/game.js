const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

const player = {
    x: 5,
    y: 5,
    color: 'red',
    speed: 0.1
};

const keys = {};

// Key events
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Convert grid coordinates to isometric screen coordinates
function isoToScreen(x, y) {
    return {
        x: (x - y) * TILE_WIDTH/2 + canvas.width/2,
        y: (x + y) * TILE_HEIGHT/2
    };
}

// Game loop
function gameLoop() {
    // Move player
    if(keys['w']) player.y -= player.speed;
    if(keys['s']) player.y += player.speed;
    if(keys['a']) player.x -= player.speed;
    if(keys['d']) player.x += player.speed;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for(let i=0; i<10; i++){
        for(let j=0; j<10; j++){
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
