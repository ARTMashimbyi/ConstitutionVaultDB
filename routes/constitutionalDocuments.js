const express = require('express');
const multer = require('multer');
const path =  require('path');
const router = express.Router();
const { db } = require('../db.js');

//storage and uploads??
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create dynamic directory structure based on institution/title
    const institution = req.body.institution || 'unknown';
    const title = req.body.title || 'untitled';
    const uploadPath = path.join(__dirname, '..', 'uploads', institution, title);
    
    // Ensure directory exists
    require('fs').mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate clean filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    cb(null, `${uniqueSuffix}-${cleanName}`);
  }
});

const upload = multer({
  storage: storage,
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

router.get('/documents', async (req, res) => {

  try {
    const snapshot = await db.collection("constitutionalDocuments").get();
    const docs = [];

    snapshot.forEach(doc => {
      docs.push({id: doc.id, ...doc.data()});
    });

    res.json(docs);
    console.log(docs);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/documents/:id', async (req, res) => {
  try {
    const docRef = db.collection("constitutionalDocuments").doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/documents', upload.single('file'), async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['title', 'date', 'continent', 'country', 'institution'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0 || !req.file) {
      return res.status(400).json({ 
        success: false, 
        error: `Missing required fields: ${missingFields.join(', ')}${!req.file ? ', file' : ''}`
      });
    }
    const documentId = db.collection("constitutionalDocuments").doc().id;

    const documentData = {
      id: documentId,
      fileType: req.file.mimetype.startsWith('image/') ? 'image' : 'document',
      title: req.body.title,
      date: req.body.date,
      continent: req.body.continent,
      country: req.body.country,
      institution: req.body.institution,
      author: req.body.author || 'Anonymous',
      category: req.body.category || 'Uncategorized',
      keywords: req.body.keywords ? req.body.keywords.split(',') : [],
      originalFilename: req.file.originalname,
      storagePath: req.file.path,
      downloadUrl: `/uploads/${path.relative(path.join(__dirname, '..', 'uploads'), req.file.path).replace(/\\/g, '/')}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    };

    await db.collection("constitutionalDocuments").doc(documentData.id).set(documentData); //add doc to firestore

    res.status(201).json({
      success: true,
      id: documentId,
      ...documentData,
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    // Clean up uploaded file if error occurred
    if (req.file) {
      require('fs').unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

    // Add to Firestore
    //const docRef = await db.collection("constitutionalDocuments").doc(documentData.id).set(documentData);

// Create new document
// router.post('/documents', async (req, res) => {
//   try {
//     const { title, date, continent, country, institution, author, category, keywords, directory } = req.body;

//     // Validate required fields
//     if (!title || !date || !continent || !country || !institution) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Title, date, continent, country, and institution are required fields' 
//       });
//     }

//     // Prepare document data
//     const documentData = {
//       fileType: 'document', // Default fileType
//       title,
//       date,
//       continent,
//       country,
//       institution,
//       author: author || 'Anonymous', // Default author
//       category: category || 'Uncategorized', // Default category
//       keywords: keywords || [], // Default empty array if no keywords
//       directory: directory || `/${institution}/${title}`, // Default directory structure
//       uploadedAt: new Date().toISOString() // Automatic timestamp
//     };

//     const docRef = await db.collection("constitutionalDocuments").add(documentData);//add to firestore?

//     res.status(201).json({ 
//       success: true, 
//       id: docRef.id,
//       ...documentData,
//       message: 'Document created successfully'
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

router.delete('/documents/:id', async (req, res) => {
  try {
    const docRef = db.collection("constitutionalDocuments").doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    await docRef.delete();
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// // Configure Multer to store files with unique filenames.
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

// const upload = multer({
//   storage: multer.memoryStorage(), // Store in RAM (not disk)
//   limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       'application/pdf',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'image/jpeg',
//       'image/png',
//       'application/vnd.ms-excel',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     ];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Only documents/images allowed.'), false);
//     }
//   }
// });

// // POST document (Firebase Storage + Firestore)
// router.post('/', upload.single('document'), async (req, res) => {
//   const { title, description, category, date, fileType, author, genre, tags } = req.body;
//   const file = req.file;

//   if (!title || !file) {
//     return res.status(400).json({ success: false, error: 'Title and file are required.' });
//   }

//   try {
//     // Upload to Firebase Storage
//     const fileName = `${Date.now()}-${file.originalname}`;
//     const storageRef = ref(storage, `documents/${fileName}`);
//     await uploadBytes(storageRef, file.buffer, { contentType: file.mimetype });
//     const downloadURL = await getDownloadURL(storageRef);

//     // Save metadata to Firestore
//     const docRef = await db.collection('documents').add({
//       title,
//       description: description || null,
//       category: category || 'other',
//       date: date || new Date().toISOString().split('T')[0],
//       fileType: fileType || 'document',
//       fileName: file.originalname,
//       fileURL: downloadURL,
//       fileSize: file.size,
//       fileMimeType: file.mimetype,
//       author: author || 'Unknown',
//       genre: genre || 'Unknown',
//       tags: tags || '',
//       createdAt: new Date()
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Document uploaded successfully',
//       document: { id: docRef.id, title, fileURL: downloadURL }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });


module.exports = router;