import React from 'react';

const chapters = [
    {title: "Chapter 1: Blah Blah", pages: ["page1.jpg", "page2.jpg"]},
    {title: "Chapter 2: Goo Goo Ga Ga", pages: ["page3.jpg"]},
];

const ComicViewer = () => {

    const [currentPage, setCurrentPage] = React.useState(0);
    const [currentChapter, setCurrentChapter] = React.useState(0);

    const handleImageClick = (e) => {
        const { left, width } = e.target.getBoundingClientRect();
        const clickX = e.clientX - left;
    
        if (clickX < width / 2) {
          // Left side clicked
          if (currentPage > 0) setCurrentPage(currentPage - 1);
        } else {
          // Right side clicked
          if (currentPage < chapters[currentChapter].pages.length - 1) setCurrentPage(currentPage + 1);
        }
    };

    const handleChapterChange = (direction) => {
        if (direction === 'next' && currentChapter < chapters.length - 1) {
            setCurrentChapter(currentChapter + 1);
            setCurrentPage(0); // Reset to first page of the new chapter
        } else if (direction === 'prev' && currentChapter > 0) {
            setCurrentChapter(currentChapter - 1);
            setCurrentPage(0); // Reset to first page of the new chapter
        }
    }



    return (
        <div>
            <div className="comic-chapter-title">
                <button onClick={ () => handleChapterChange('prev')}>&lt;</button>
                {chapters[currentChapter].title}
                <button onClick={ () => handleChapterChange('next')}>&gt;</button>
            </div>
            <div className="comic-page-indicator">
                Page {currentPage + 1} of {chapters[currentChapter].pages.length}
            </div>
            <div className="comic-viewer" onClick={handleImageClick}>
                <img src={chapters[currentChapter].pages[currentPage]} alt={`Comic page ${currentPage + 1}`} />
            </div>
        </div>
    );
};

export default ComicViewer;