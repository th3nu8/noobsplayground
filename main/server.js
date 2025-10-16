const express = require('express');
const path = require('path');

const app = express();

// Serve index.html and other static files in the same folder
app.use(express.static(path.join(__dirname)));

// Optional health check
app.get('/health', (req, res) => res.send('OK'));

// Start server on port 80
const PORT = 2000;
app.listen(PORT, () => {
  console.log(`✅ Main website running at http://localhost:${PORT}`);
});
