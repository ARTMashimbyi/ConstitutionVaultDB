const express = require('express');
const cors = require('cors');
const helmet = require('helmet');//added for firbase
const { db } = require('./db.js'); 

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
const constitutionalDocsRoute = require('./routes/constitutionalDocuments');
app.use('/constitutionalDocuments', constitutionalDocsRoute);

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;