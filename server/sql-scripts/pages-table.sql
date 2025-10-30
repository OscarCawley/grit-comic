CREATE TABLE pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_num INT NOT NULL,
    chapter_num INT NOT NULL,
    FOREIGN KEY (chapter_num) REFERENCES chapters(chapter_num),
    image VARCHAR(255) NOT NULL
);