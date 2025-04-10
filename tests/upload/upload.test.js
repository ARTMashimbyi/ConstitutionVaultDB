const request = require('supertest');
const express = require('express');
const multer = require('multer');

// ✅ Mock the db module
jest.mock('../../db', () => {
    const inputMock = jest.fn().mockReturnThis();
    const queryMock = jest.fn().mockResolvedValue({});
  
    const mockRequest = () => ({
      input: inputMock,
      query: queryMock
    });
  
    return {
      sql: {
        connect: jest.fn().mockResolvedValue({
          request: mockRequest
        }),
        // ✅ Mock data types as functions
        NVarChar: jest.fn(() => 'NVarChar'),
        Int: jest.fn(() => 'Int'),
        VarBinary: jest.fn(() => 'VarBinary')
      },
      config: {}
    };
  });
  
  

// ✅ Set up multer with in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Load the actual route and override upload middleware
const uploadRouter = require('../../routes/upload');
const app = express();
app.use(express.json());

// ✅ Override the middleware in the router before mounting (patch if needed)
app.use((req, res, next) => {
  req.upload = upload.single('archiveFile');
  next();
});

app.use('/upload', uploadRouter);

describe('Upload Routes', () => {
  it('POST /upload should return 400 if no file is uploaded', async () => {
    const response = await request(app)
      .post('/upload')
      .field('name', 'Test Book')
      .field('writer', 'Tester')
      .field('year', '2025')
      .field('subject', 'Mock');

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('No file uploaded.');
  });

  it('POST /upload should return 200 if a file is uploaded', async () => {
    const response = await request(app)
      .post('/upload')
      .field('name', 'Test Book')
      .field('writer', 'Tester')
      .field('year', '2025')
      .field('subject', 'Mock')
      .attach('archiveFile', Buffer.from('Fake PDF content'), 'test.pdf');

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Book uploaded successfully.');
  });
});
