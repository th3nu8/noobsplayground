// ---- server.js ----
const express = require('express');
const path = require('path');

const app = express();

// Serve your main website from the 'main' folder
app.use('/', express.static(path.join(__dirname, 'main')));

// Optional: Health check route (useful for hosting services)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start the server
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`✅ Main website server running at http://localhost:${PORT}`);
});
