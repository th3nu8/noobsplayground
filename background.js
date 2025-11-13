// --- Canvas Setup ---
const canvas = document.getElementById('honeycomb');
const ctx = canvas.getContext('2d');

// Geometry Constants
const hexRadius = 40;
// Use calculated values for consistent geometry
const hexHeight = Math.sqrt(3) * hexRadius; 
const hexWidth = 2 * hexRadius;

// Color Constants (for grayscale)
const GRAY_BRIGHTNESS = 90; // The base gray level (0-255)
const BORDER_ALPHA = 0.4;
const FILL_ALPHA = 0.03;

// --- Drawing Functions ---

/**
 * Draws a single hexagon outline.
 * @param {number} x - Center X coordinate.
 * @param {number} y - Center Y coordinate.
 * @param {number} radius - Hexagon radius.
 */
function drawHexagon(x, y, radius) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + radius * Math.cos(angle);
        const hy = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    
    // Fill the hex (very dark, transparent gray/black)
    ctx.fillStyle = `rgba(0, 0, 0, ${FILL_ALPHA})`;
    ctx.fill();
    
    // Stroke the hex (the gray border)
    const grayColor = `rgba(${GRAY_BRIGHTNESS}, ${GRAY_BRIGHTNESS}, ${GRAY_BRIGHTNESS}, ${BORDER_ALPHA})`;
    ctx.strokeStyle = grayColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

/**
 * Sets up the canvas size to cover the VIEWPORT and draws the static grid.
 */
function drawGrid() {
    // FIX: Set canvas dimensions to cover the visible VIEWPORT area only
    const w = canvas.width = window.innerWidth;
    const h = canvas.height = window.innerHeight; // Key change: Use innerHeight
    
    // Clear background
    ctx.fillStyle = '#0a0a0a'; 
    ctx.fillRect(0, 0, w, h);

    // Calculate grid dimensions
    // We add +1 to ensure the pattern covers slightly beyond the edges
    const cols = Math.ceil(w / (hexWidth * 0.75)) + 1;
    const rows = Math.ceil(h / hexHeight) + 1;
    
    // Loop through rows and columns to draw hexagons
    for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
            // Calculate position for staggered grid
            const x = col * hexWidth * 0.75;
            const y = row * hexHeight + (col % 2 !== 0 ? hexHeight / 2 : 0);
            
            // Draw the hexagon
            drawHexagon(x, y, hexRadius);
        }
    }
}

// --- Execution ---

// Run when the window loads
window.addEventListener('load', drawGrid);

// Redraw on window resize to fit the new viewport dimensions
window.addEventListener('resize', drawGrid);

// NOTE: The MutationObserver has been removed as it's no longer necessary 
// since the canvas height is based on the viewport (window.innerHeight) 
// and not the document body's full height (document.body.offsetHeight).
