//jest.setTimeout(10000);
const request = require('supertest');
const path = require('path');
const app = require('../server'); // Ensure server.js exports your Express app
const { sql } = require('../db');  // Get the mssql instance from your db.js

describe('POST /upload', () => {
  test('should successfully upload a document with all required fields', async () => {
    const res = await request(app)
      .post('/upload')
      .field('title', 'Constitution Document')
      .field('date', '2025-04-09')
      .field('region', 'South Africa')
      .field('type', 'PDF')
      .attach('document', path.resolve(__dirname, '../uploads/sample.pdf')); // updated path

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Document uploaded successfully.');
  });

  test('should return error when required fields are missing', async () => {
    const res = await request(app)
      .post('/upload')
      .field('title', 'Constitution Document'); // Missing date, region, type, and the file

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing required fields.');
  });
});

// Cleanup after all tests to close the database connection.
afterAll(async () => {
  try {
    await sql.close();
  } catch (err) {
    // Log error if needed, but it's generally safe to ignore here.
    console.error("Error closing the database connection", err);
  }
});
