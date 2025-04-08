// routes/books.js
const express = require('express');
const router = express.Router();
const { sql, config } = require('../db');

// Fetch all books
router.get('/', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT id, name, writer, year, subject FROM book`;
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).send('Error fetching books');
  }
});

// Fetch a specific book document
router.get('/:id/document', async (req, res) => {
  const { id } = req.params;
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT document, name FROM book WHERE id = ${id}`;
    if (result.recordset.length === 0) return res.status(404).send('Book not found');

    const { document, name } = result.recordset[0];
    res.setHeader('Content-Disposition', `inline; filename="${name}.pdf"`);
    res.contentType('application/pdf');
    res.send(document);
  } catch (err) {
    console.error('Error loading document:', err);
    res.status(500).send('Error loading book document');
  }
});



// Delete a book
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql.connect(config);
    await sql.query`DELETE FROM book WHERE id = ${id}`;
    res.send('Book deleted.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete book.');
  }
});


module.exports = router;
