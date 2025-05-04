CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,    -- Unique ID for each user
    username VARCHAR(50) NOT NULL,        -- Username (max length 50)
    email VARCHAR(100) NOT NULL UNIQUE,   -- Email (max length 100, unique)
    password VARCHAR(255) NOT NULL,       -- Password (max length 255)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp for account creation
);