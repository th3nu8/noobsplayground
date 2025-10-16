const express = require('express');
const app = express();
const path = require('path');

// Serve static files from the current folder
app.use(express.static(__dirname));

// Optional: serve index.html explicitly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Listen on port 3001
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
});
