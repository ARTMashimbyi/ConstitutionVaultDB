const express = require('express');
const multer = require('multer');
const router = express.Router();
const { db, storage } = require('../db.js');
const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');
const firebaseStorage = getStorage();

// // // Configure Multer to store files with unique filenames.
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '..', 'uploads'));
//   },
//   filename: (req, file, cb) => {
//     // Generate a unique filename using a timestamp and a random number.
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + '-' + file.originalname);
//   }
// });

const upload = multer({
  storage: multer.memoryStorage(), // Store in RAM (not disk)
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents/images allowed.'), false);
    }
  }
});

// GET all documents (Firestore)
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('documents').orderBy('createdAt', 'desc').get();
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const docRef = db.collection('documents').doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    res.json({ success: true, document: docSnap.data() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST document (Firebase Storage + Firestore)
router.post('/', upload.single('document'), async (req, res) => {
  const { title, description, category, date, fileType, author, genre, tags } = req.body;
  const file = req.file;

  if (!title || !file) {
    return res.status(400).json({ success: false, error: 'Title and file are required.' });
  }

  try {
    // Upload to Firebase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const storageRef = ref(storage, `documents/${fileName}`);
    await uploadBytes(storageRef, file.buffer, { contentType: file.mimetype });
    const downloadURL = await getDownloadURL(storageRef);

    // Save metadata to Firestore
    const docRef = await db.collection('documents').add({
      title,
      description: description || null,
      category: category || 'other',
      date: date || new Date().toISOString().split('T')[0],
      fileType: fileType || 'document',
      fileName: file.originalname,
      fileURL: downloadURL,
      fileSize: file.size,
      fileMimeType: file.mimetype,
      author: author || 'Unknown',
      genre: genre || 'Unknown',
      tags: tags || '',
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: { id: docRef.id, title, fileURL: downloadURL }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE document (Firestore + Storage)
router.delete('/:id', async (req, res) => {
  try {
    const docRef = db.collection('documents').doc(req.params.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Delete from Firebase Storage
    const { fileName } = docSnap.data();
    const storageRef = ref(storage, `documents/${fileName}`);
    await deleteObject(storageRef).catch(err => console.error("File delete error:", err));

    // Delete from Firestore
    await docRef.delete();
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;