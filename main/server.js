// ---- server.js ----
const express = require('express');
const path = require('path');

const app = express();

// Serve the main website (everything in the current folder)
app.use('/', express.static(__dirname));

// Optional health check route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start the server on port 80
const PORT = 80;
app.listen(PORT, () => {
  console.log(`✅ Main website running at http://localhost:${PORT}`);
});
