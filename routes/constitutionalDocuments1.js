const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { sql, config } = require('../db');

// Configure Multer to store files in "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

// POST route
router.post('/', upload.single('document'), async (req, res) => {
  const { title, date, continent, country, institution, author, category, keywords, fileType, directory } = req.body;
  const file = req.file;

  if (!file || !title || !date || !continent || !country || !directory) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO constitutionalDocumentsWithDirectory 
        (title, date, continent, country, institution, author, category, keywords, document, fileType, directory)
      VALUES 
        (${title}, ${date}, ${continent}, ${country}, ${institution}, ${author}, ${category}, ${keywords}, ${file.filename}, ${fileType}, ${directory})
    `;
    res.status(200).json({ message: 'Document uploaded successfully.' });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed.', details: err.message });
  }
});

// GET route
router.get('/', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT * FROM constitutionalDocumentsWithDirectory ORDER BY createdAt DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('Error fetching documents');
  }
});

// DELETE route
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT document FROM constitutionalDocumentsWithDirectory WHERE id = ${id}
    `;
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    const fileName = result.recordset[0].document;
    await sql.query`DELETE FROM constitutionalDocumentsWithDirectory WHERE id = ${id}`;
    const filePath = path.join(__dirname, '..', 'uploads', fileName);
    await fs.promises.unlink(filePath).catch(err => {
      console.error(`Error deleting file ${filePath}:`, err);
    });
    res.json({ message: 'Document deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting document.', details: err.message });
  }
});


// Save new directory
router.post('/directory', async (req, res) => {
  const { path } = req.body;

  if (!path) return res.status(400).json({ error: 'Directory path required' });

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO directories (path) VALUES (${path})
    `;
    res.status(200).json({ message: 'Directory saved.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save directory.', details: err.message });
  }
});

// Fetch all directories
router.get('/directories', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM directories ORDER BY createdAt ASC`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch directories.' });
  }
});


module.exports = router;
