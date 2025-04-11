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

## 🧱 Folder Structure

```
server/
├── db.js               # Database configuration
├── server.js           # Main server setup and routes
└── routes/
    ├── books.js        # Route for handling book operations
    └── upload.js       # Route for handling file uploads
```

---

## 🔧 Requirements

- Node.js (v14.x or higher)
- Express.js
- SQL Server (Azure SQL) database connection
- Multer for handling file uploads

---

## 🛠️ Setup Instructions

1. **Clone the Repository**

```bash
git clone https://github.com/your-username/constitution-vault-backend.git
cd constitution-vault-backend
```

2. **Install Dependencies**

```bash
npm install
```

4. **Start the Server**

```bash
npm start
```

The server will start on [http://localhost:3000](http://localhost:3000).

---

## 📡 API Endpoints

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| GET    | `/books`              | Fetch all books      |
| POST   | `/upload`             | Upload new document  |
| GET    | `/books/:id/document` | Fetch PDF for a book |
| DELETE | `/books/:id`          | Delete a book by ID  |

---

## ✨
