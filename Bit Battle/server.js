const express = require('express');
const app = express();

// Serve static files from the same folder
app.use(express.static(__dirname));

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
