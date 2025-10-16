const express = require('express');
const app = express();
const PORT = 3001;

// Serve static files from the same folder
app.use('/', express.static(path.join(__dirname, 'main')));
app.use('/buildnblocks', express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
