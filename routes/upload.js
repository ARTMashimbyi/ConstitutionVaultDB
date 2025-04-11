const express = require('express');
const multer = require('multer');
const { sql, config } = require('../db');
const router = express.Router();

const storage = multer.memoryStorage(); // or diskStorage if needed
const upload = multer({ storage });

router.post('/', upload.single('archiveFile'), async (req, res) => {
  try {
    const { name, writer, year, subject } = req.body;

    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const pool = await sql.connect(config);
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('writer', sql.NVarChar, writer)
      .input('year', sql.Int, year)
      .input('subject', sql.NVarChar, subject)
      .input('document', sql.VarBinary(sql.MAX), req.file.buffer)
      .query(`INSERT INTO Books (name, writer, year, subject, document)
              VALUES (@name, @writer, @year, @subject, @document)`);

    res.status(200).send('Book uploaded successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

module.exports = router;
