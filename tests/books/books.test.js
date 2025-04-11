const request = require('supertest');
const express = require('express');

// Mock the db module before requiring the routes
jest.mock('../../db', () => ({
  sql: {
    connect: jest.fn().mockResolvedValue(),
    query: jest.fn().mockResolvedValue({
      recordset: [
        {
          id: 1,
          name: 'Mock Book',
          writer: 'Mock Writer',
          year: 2024,
          subject: 'Mock Subject',
          document: Buffer.from('PDF content')
        }
      ]
    })
  },
  config: {}
}));

const booksRouter = require('../../routes/books');
const app = express();
app.use(express.json());
app.use('/books', booksRouter);

describe('Books Routes', () => {
  it('GET /books should return an array of books', async () => {
    const response = await request(app).get('/books');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].name).toBe('Mock Book');
  });

  it('GET /books/1/document should return a PDF file', async () => {
    const response = await request(app).get('/books/1/document');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
  });
});
