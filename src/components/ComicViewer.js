import React from 'react';

const pages = [
    "page1.jpg",
    "page2.jpg",
    "page3.jpg",
];

const ComicViewer = () => {

    const [currentPage, setCurrentPage] = React.useState(0);

    const handleImageClick = (e) => {
        const { left, width } = e.target.getBoundingClientRect();
        const clickX = e.clientX - left;
    
        if (clickX < width / 2) {
          // Left side clicked
          if (currentPage > 0) setCurrentPage(currentPage - 1);
        } else {
          // Right side clicked
          if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
        }
      };


    return (
        <div>
            <div className="comic-page-indicator">
                Page {currentPage + 1} of {pages.length}
            </div>
            <div className="comic-viewer" onClick={handleImageClick}>
                <img src={pages[currentPage]} alt={`Comic page ${currentPage + 1}`} />
            </div>
        </div>
    );
};

export default ComicViewer;