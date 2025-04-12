// routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { sql, config } = require('../db');

// Configure Multer to store files in the "uploads" folder on disk.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save uploads in the uploads folder at the project root.
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Here we simply use the original file name. You can add a unique suffix if needed.
    cb(null, file.originalname);
  }
});

// Updated Multer instance with 100 MB file size limit.
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

// Updated upload endpoint: accepts additional fields (including fileType)
router.post('/', upload.single('document'), async (req, res) => {
  const { title, date, continent, country, institution, author, category, keywords } = req.body;
  // Optionally, set a default fileType if not provided.
  const fileType = req.body.fileType || 'document';
  const file = req.file;

  // Validate that required fields are provided.
  if (!file || !title || !date || !continent || !country) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO constitutionalDocuments 
        (title, date, continent, country, institution, author, category, keywords, document, fileType)
      VALUES 
        (${title}, ${date}, ${continent}, ${country}, ${institution}, ${author}, ${category}, ${keywords}, ${file.filename}, ${fileType})
    `;
    res.status(200).json({ message: 'Document uploaded successfully.' });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed.' });
  }
});

module.exports = router;
