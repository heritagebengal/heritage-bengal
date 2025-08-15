console.log('Starting test server...');

const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Test server working!');
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
