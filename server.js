// File: server/server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const sql = require('mssql');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer Setup (save temporarily)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// MSSQL Config
const dbConfig = {
  user: 'constitutionvault',
  password: 'Code@mash',
  server: 'constitutionvault.database.windows.net',
  database: 'constitutionvault',
  options: {
    encrypt: true, // required for Azure
  }
};

// Upload + Add Book
app.post('/books', upload.single('document'), async (req, res) => {
  const { name, year, writer, subject } = req.body;
  const filePath = req.file?.path;

  if (!filePath) return res.status(400).send('No file uploaded.');

  try {
    const fileData = fs.readFileSync(filePath);

    await sql.connect(dbConfig);
    await sql.query`
      INSERT INTO book (name, year, writer, subject, document)
      VALUES (${name}, ${year}, ${writer}, ${subject}, ${fileData})
    `;

    // Optionally delete file from disk
    fs.unlinkSync(filePath);

    res.status(201).send('Book added successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading book.');
  }
});

// Delete Book
app.delete('/books/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    await sql.connect(dbConfig);
    const result = await sql.query`DELETE FROM book WHERE id = ${bookId}`;

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send('Book not found.');
    }

    res.send('Book deleted successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting book.');
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
