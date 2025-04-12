// // routes/books.js (updated for deletion with physical file removal)
// const express = require('express');
// const router = express.Router();
// const { sql, config } = require('../db');
// const fs = require('fs');
// const path = require('path');

// // Fetch all constitutional documents
// router.get('/', async (req, res) => {
//   try {
//     await sql.connect(config);
//     const result = await sql.query`
//       SELECT id, title, date, region, type, document
//       FROM constitutionalDocuments
//       ORDER BY createdAt DESC
//     `;
//     res.json(result.recordset);
//   } catch (err) {
//     console.error('Error fetching documents:', err);
//     res.status(500).send('Error fetching documents');
//   }
// });

// // DELETE endpoint for removing a constitutional document
// router.delete('/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     await sql.connect(config);

//     // First, retrieve the file name/path for the document record
//     const result = await sql.query`
//       SELECT document
//       FROM constitutionalDocuments
//       WHERE id = ${id}
//     `;

//     if (result.recordset.length === 0) {
//       return res.status(404).json({ error: 'Document not found.' });
//     }

//     const fileName = result.recordset[0].document;

//     // Delete the record from the database
//     await sql.query`
//       DELETE FROM constitutionalDocuments WHERE id = ${id}
//     `;

//     // Construct the full file path in the uploads folder
//     const filePath = path.join(__dirname, '..', 'uploads', fileName);

//     // Attempt to delete the physical file from disk
//     fs.unlink(filePath, (err) => {
//       if (err) {
//         console.error('Error deleting file from disk:', err);
//         // Optionally, you could send a warning, but the DB record has been removed successfully.
//       } else {
//         console.log(`File ${fileName} deleted from disk.`);
//       }
//     });

//     res.json({ message: 'Document deleted successfully.' });
//   } catch (err) {
//     console.error('Error deleting document:', err);
//     res.status(500).json({ error: 'Error deleting document.' });
//   }
// });

// module.exports = router;
