import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import leftArrow from '../../assets/icons/left-arrow.png';
import rightArrow from '../../assets/icons/right-arrow.png';

const Home = () => {
    const [searchParams] = useSearchParams(); // Initialize useSearchParams
    const initialChapter = parseInt(searchParams.get('chapter')) || 0; // Get chapter index from query params
    const [currentPage, setCurrentPage] = useState(0);
    const [currentChapter, setCurrentChapter] = useState(0);

    const [chapters, setChapters] = useState([]); // State to hold chapters data

    useEffect(() => {
        fetchChapters(); // Fetch chapters on component mount
    }, []);

    useEffect(() => {
        if (chapters.length > 0) {
            setCurrentChapter(initialChapter || 0);
            setCurrentPage(0);
        }
    }, [chapters, initialChapter]);

    const fetchChapters = async () => {
        try {
            const chapterRes = await axios.get('http://localhost:5000/api/chapters');
            const chapterData = chapterRes.data;

            const chapterWithPages = await Promise.all(
                chapterData.map(async chapter => {
                    const pageRes = await axios.get(`http://localhost:5000/api/chapters/${chapter.chapterNum}/pages`);
                    return {
                        ...chapter,
                        pages: pageRes.data,
                    };
                })
            );
            setChapters(chapterWithPages);

        } catch (err) {
            console.error('Failed to load chapters or pages:', err);
        }
    }
            

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
        chapters.length > 0 && chapters[currentChapter]?.pages?.length > 0 ? (
            <div className='comic-viewer-container'>
                <div className="comic-chapter-title">
                    <button onClick={ () => handleChapterChange('prev')}><img src={leftArrow}/></button>
                    {chapters[currentChapter].title}
                    <button onClick={ () => handleChapterChange('next')}><img src={rightArrow}/></button>
                </div>
                <div className="comic-page-indicator">
                    <p>Page {currentPage + 1} of {chapters[currentChapter]?.pages.length || 0}</p>
                </div>
                <div className="comic-viewer" onClick={handleImageClick}>
                    
                        <img src={`http://localhost:5000${chapters[currentChapter].pages[currentPage].image}`} alt={`Comic page ${currentPage + 1}`}/>
                </div>
            </div>
        ) : (
            <p>Loading pages...</p>
        )
    );
};

export default Home;