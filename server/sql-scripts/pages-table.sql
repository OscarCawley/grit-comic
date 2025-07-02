CREATE TABLE pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pageNum INT NOT NULL,
    chapterNum INT NOT NULL,
    FOREIGN KEY (chapterNum) REFERENCES chapters(chapterNum),
    image VARCHAR(255) NOT NULL
);