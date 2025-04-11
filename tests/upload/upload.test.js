const request = require('supertest');
const express = require('express');
const multer = require('multer');

// ✅ Mock the db module
jest.mock('../../db', () => ({
  sql: {
    connect: jest.fn().mockResolvedValue(),
    query: jest.fn().mockResolvedValue({})  // simulate successful insert
  },
  config: {}
}));

const uploadRouter = require('../../routes/upload');
const app = express();
app.use(express.json());
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
