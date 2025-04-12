// routes/constitutionalDocuments.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { sql, config } = require('../db');

// Configure Multer to store files with unique filenames.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using a timestamp and a random number.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Updated Multer instance with 100 MB file size limit.
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

// POST endpoint – Upload a new constitutional document with metadata.
router.post('/', upload.single('document'), async (req, res) => {
  console.log("POST /constitutionalDocuments triggered");
  console.log("Request body:", req.body);
  console.log("Uploaded file info:", req.file);

  const { title, date, continent, country, institution, author, category, keywords } = req.body;
  // Use fileType from the request or default to 'document'
  const fileType = req.body.fileType || 'document';
  const file = req.file;

  if (!file || !title || !date || !continent || !country) {
    console.error("Missing required fields:", { file, title, date, continent, country });
    return res.status(400).json({
      error: 'Missing required fields. Required: document, title, date, continent, country.'
    });
  }

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO constitutionalDocuments 
        (title, date, continent, country, institution, author, category, keywords, document, fileType)
      VALUES 
        (${title}, ${date}, ${continent}, ${country}, ${institution}, ${author}, ${category}, ${keywords}, ${file.filename}, ${fileType})
    `;
    console.log("Document inserted into database");
    res.status(200).json({ message: 'Document uploaded successfully.' });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed.', details: err.message });
  }
});

// GET endpoint – Retrieve all constitutional documents with metadata.
router.get('/', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT id, title, date, continent, country, institution, author, category, keywords, document, createdAt, fileType
      FROM constitutionalDocuments
      ORDER BY createdAt DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).send('Error fetching documents');
  }
});

// DELETE endpoint – Delete a constitutional document by ID and remove the physical file.
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT document 
      FROM constitutionalDocuments 
      WHERE id = ${id}
    `;
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    const fileName = result.recordset[0].document;
    await sql.query`
      DELETE FROM constitutionalDocuments WHERE id = ${id}
    `;
    const filePath = path.join(__dirname, '..', 'uploads', fileName);
    // Delete the file from disk.
    await fs.promises.unlink(filePath).catch(err => {
      console.error(`Error deleting file ${filePath}:`, err);
    });
    res.json({ message: 'Document deleted successfully.' });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: 'Error deleting document.', details: err.message });
  }
});

module.exports = router;
