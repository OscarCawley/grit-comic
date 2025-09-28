import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import leftArrow from '../../assets/icons/left-arrow.png';
import rightArrow from '../../assets/icons/right-arrow.png';
import PageAnimation from '../../components/PageAnimation/PageAnimation.js';

const Home = () => {
    const [searchParams] = useSearchParams(); // Initialize useSearchParams
    const initialChapter = parseInt(searchParams.get('chapter')) || 0; // Get chapter index from query params
    const [currentPage, setCurrentPage] = useState(0);
    const [currentChapter, setCurrentChapter] = useState(0);
    const [comments, setComments] = useState([]); // State to hold comments data

    const [chapters, setChapters] = useState([]); // State to hold chapters data

    useEffect(() => {
        if (chapters.length === 0) {
            fetchChapters(); // Only fetch if chapters aren't loaded
            fetchComments(); // Fetch comments data
        }
    }, [chapters.length]);

    useEffect(() => {
        if (chapters.length > 0) {
            setCurrentChapter(initialChapter || 0);
            setCurrentPage(0);
        }
    }, [chapters, initialChapter]);

    const fetchChapters = async () => {
        try {
            const chapterRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapters`);
            const chapterData = chapterRes.data;

            const chapterWithPages = await Promise.all(
                chapterData.map(async chapter => {
                    const pageRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapters/${chapter.chapterNum}/pages`);
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
    
    const fetchComments = async () => {
        try {
            const commentsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/comments`);
            setComments(commentsRes.data);
        } catch (err) {
            console.error('Failed to load comments:', err);
        }
    }

    const filteredComments = comments.filter((comment) => {
        const matchesChapter = comment.chapter_id === currentChapter + 1;
        console.log('Comment chapter_id:', comment.chapter_id, 'Current chapter:', currentChapter, 'Matches:', matchesChapter);
        return matchesChapter;
    });

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
        <PageAnimation>
            <div className='comic-viewer-container'>
                <div className="comic-chapter-title">
                    <button onClick={() => handleChapterChange('prev')} disabled={chapters.length === 0}>
                        <img src={leftArrow} alt="Previous chapter" />
                    </button>

                    {chapters[currentChapter]?.title ?? <span className="loading">Loading chapter title...</span>}

                    <button onClick={() => handleChapterChange('next')} disabled={chapters.length === 0}>
                        <img src={rightArrow} alt="Next chapter" />
                    </button>
                </div>

                <div className="comic-page-indicator">
                    {chapters.length > 0 && chapters[currentChapter]?.pages?.length > 0 ? (
                        <p>Page {currentPage + 1} of {chapters[currentChapter].pages.length}</p>
                    ) : (
                        <p className="loading">Loading page count...</p>
                    )}
                </div>

                <div className="comic-viewer" onClick={handleImageClick}>
                    {chapters.length > 0 && chapters[currentChapter]?.pages?.length > 0 ? (
                        <img
                            src={`${process.env.REACT_APP_API_URL}${chapters[currentChapter].pages[currentPage].image}`}
                            alt={`Comic page ${currentPage + 1}`}
                        />
                    ) : (
                        <div className="image-placeholder loading">Loading page image...</div>
                    )}
                </div>
            </div>
            <div className="comment-section">
                <h2 className="comment-title">Comments</h2>
                {filteredComments.map(comment => (
                    <div key={comment.id} className="comment">
                        <div className="comment-header">
                            <h3>{comment.username}</h3>
                        </div>
                        <div className="comment-content">
                            {comment.content}
                        </div>
                        <p className='comment-date'>{comment.created_at_formatted}</p>
                    </div>
                ))}
            </div>
        </PageAnimation>
    );
};

export default Home;