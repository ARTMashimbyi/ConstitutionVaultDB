// routes/upload.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { sql, config } = require('../db');

// Use memory storage for buffer
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('document'), async (req, res) => {
  const { name, writer, year, subject } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO book (name, writer, year, subject, document)
      VALUES (${name}, ${writer}, ${year}, ${subject}, ${file.buffer})
    `;
    res.send('Book uploaded successfully.');
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).send('Upload failed.');
  }
});

module.exports = router;
