import React from 'react';
import './ComicViewer.css';
import leftArrow from '../../assets/icons/left-arrow.png';
import rightArrow from '../../assets/icons/right-arrow.png';
import chapters from '../../data.js';

const ComicViewer = () => {

    const [currentPage, setCurrentPage] = React.useState(0);
    const [currentChapter, setCurrentChapter] = React.useState(0);

    const handleImageClick = (e) => {
        const { left, width } = e.target.getBoundingClientRect();
        const clickX = e.clientX - left;
    
        if (clickX < width / 2) {
            // Left side clicked
            if (currentPage > 0) {
                setCurrentPage(currentPage - 1);
            } else if (currentPage <= 0 && currentChapter > 0) {
                // If on the first page of the current chapter and not on the first chapter, go to the last page of the previous chapter
                setCurrentChapter(currentChapter - 1);
                setCurrentPage(chapters[currentChapter - 1].pages.length - 1); // Go to last page of the previous chapter
            }
        }
        else {
            // Right side clicked
            if (currentPage < chapters[currentChapter].pages.length - 1) {
                setCurrentPage(currentPage + 1)
            } else if (currentPage >= chapters[currentChapter].pages.length - 1 && currentChapter < chapters.length - 1) {
                // If on the last page of the current chapter and not on the last chapter, go to the first page of the next chapter
                setCurrentChapter(currentChapter + 1);
                setCurrentPage(0); // Go to first page of the next chapter
            }
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
        <div className='comic-viewer-container'>
            <div className="comic-chapter-title">
                <button onClick={ () => handleChapterChange('prev')}><img src={leftArrow}/></button>
                {chapters[currentChapter].title}
                <button onClick={ () => handleChapterChange('next')}><img src={rightArrow}/></button>
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