const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/books', require('../routes/books'));
app.use('/upload', require('../routes/upload'));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
