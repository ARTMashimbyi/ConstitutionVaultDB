# ConstitutionVaultDB

[![codecov](https://codecov.io/gh/ARTMashimbyi/ConstitutionVaultDB/branch/main/graph/badge.svg)](https://codecov.io/gh/ARTMashimbyi/ConstitutionVaultDB)

# 📚 Constitution Vault - Backend

## This is the backend for **Constitution Vault**, a document management web application

## 🚀 Features

- 📝 **Upload documents** along with metadata (name, writer, year, subject).
- 🔍 **Fetch document details** including metadata.
- 📄 **Serve PDF documents** for viewing through an API.
- 🗑️ **Delete documents** from the database and storage.

---

⚙️ Technologies Used

- Node.js with Express
- MSSQL (Azure SQL Database)
- Jest for testing
- Supertest for HTTP testing
- codecov for code coverage reporting

---

🚀 Getting Started

1. Clone the repository:

   git clone https://github.com/yourusername/constitution-vault-backend.git
   cd constitution-vault-backend

2. Install dependencies:

   npm install

---

🔧 Environment Setup

Make sure to create a `.env` file in the root with the following:

    PORT=5000
    AZURE_SQL_SERVER=your-server.database.windows.net
    AZURE_SQL_DATABASE=your-db-name
    AZURE_SQL_USER=your-username
    AZURE_SQL_PASSWORD=your-password
    AZURE_SQL_ENCRYPT=true

---

🧪 Running Tests

We use Jest and Supertest for automated testing.

To run all tests:

    npm test

Or directly with:

    npx jest

---

✅ Writing Tests

- All test files are located inside the `tests/` directory.
- Use Supertest to test API endpoints.
- Example test structure:

  const request = require('supertest');
  const app = require('../server'); // your Express app

  describe('GET /api/books', () => {
  it('should return list of books', async () => {
  const res = await request(app).get('/api/books');
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  });
  });

---

📊 Code Coverage

We use Jest built-in coverage tool and report to Codecov.

To generate a local coverage report:

    npm run coverage

This will create a `coverage/` folder with an HTML report you can view locally by opening:

    coverage/lcov-report/index.html

To send coverage to Codecov:

1. Make sure you have a Codecov account and a repository set up.
2. Add the following to your CI config (e.g., GitHub Actions):

   - name: Run tests and collect coverage
     run: npm run coverage

   - name: Upload coverage to Codecov
     uses: codecov/codecov-action@v3
     with:
     token: ${{ secrets.CODECOV_TOKEN }}
     files: ./coverage/lcov.info

---

📂 Folder Structure

    ├── controllers/         # API logic
    ├── routes/              # Express routes
    ├── tests/               # Test files
    ├── utils/               # Utility functions (e.g. DB connection)
    ├── server.js            # App entry point
    ├── jest.config.js       # Jest config
    ├── .env                 # Environment variables
    ├── README.md

---

## ✨
