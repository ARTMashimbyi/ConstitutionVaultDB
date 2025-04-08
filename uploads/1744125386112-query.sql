CREATE TABLE book (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    year INT,
    writer NVARCHAR(255),
    subject NVARCHAR(255),
    document VARBINARY(MAX)
);
