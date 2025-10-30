import React, { useState, useEffect, useCallback } from 'react';
import { throttle } from 'lodash';
import { useSearchParams } from 'react-router-dom';
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import axios from 'axios';
import './Home.css';
import PageAnimation from '../../components/PageAnimation/PageAnimation.js';
import pageIcon from '../../assets/icons/page.png';
import chapterIcon from '../../assets/icons/chapter.png';

const Home = () => {
    const { user } = useContext(UserContext);

    const [searchParams] = useSearchParams(); // Initialize useSearchParams
    const initialChapter = parseInt(searchParams.get('chapter')) || 0; // Get chapter index from query params
    const [currentPage, setCurrentPage] = useState(0);
    const [currentChapter, setCurrentChapter] = useState(0);
    const [comments, setComments] = useState([]); // State to hold comments data
    const [chapters, setChapters] = useState([]); // State to hold chapters data
    const [submitting, setSubmitting] = useState(false); // State to manage submission status
    const [loading, setLoading] = useState(true); // Page-level loading gate
    const [newComment, setNewComment] = useState(''); // State for new comment input

    useEffect(() => {
        if (chapters.length === 0) {
            initLoad();
        }
    }, [chapters.length]);

    useEffect(() => {
        if (chapters.length > 0) {
            setCurrentChapter(initialChapter || 0);
            setCurrentPage(0);
        }
    }, [chapters, initialChapter]);

    useEffect(() => {
        const handleKeyDown = throttle((event) => {
            if (event.key === 'ArrowRight') {
                handlePageChange('next');
            } else if (event.key === 'ArrowLeft') {
                handlePageChange('prev');
            }
        }, 200);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentPage, currentChapter, chapters]);

    const fetchChapters = async () => {
        try {
            const chapterRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapters`);
            const chapterData = chapterRes.data;

            const chapterWithPages = await Promise.all(
                chapterData.map(async chapter => {
                    const pageRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapters/${chapter.chapter_num}/pages`);
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

    // Unified initial load: chapters (with pages) + comments
    const initLoad = async () => {
        try {
            await Promise.all([fetchChapters(), fetchComments()]);
        } finally {
            setLoading(false);
        }
    };

    const filteredComments = comments.filter((comment) => {
        const matchesChapter = comment.chapter_id === currentChapter + 1;
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

    const handlePageChange = useCallback((direction) => {
        if (!chapters.length) return;

        if (direction === 'next' && currentPage < chapters[currentChapter].pages.length - 1) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 0) {
            setCurrentPage(currentPage - 1);
        } else if (direction === 'next' && currentPage === chapters[currentChapter].pages.length - 1 && currentChapter < chapters.length - 1) {
            setCurrentChapter(currentChapter + 1);
            setCurrentPage(0); // Reset to first page of the new chapter
        } else if (direction === 'prev' && currentPage === 0 && currentChapter > 0) {
            setCurrentChapter(currentChapter - 1);
            setCurrentPage(chapters[currentChapter - 1].pages.length - 1); // Go to last page of the previous chapter
        }
    }, [currentPage, currentChapter, chapters]);

    const handleChapterChange = (direction) => {
        if (direction === 'next' && currentChapter < chapters.length - 1) {
            setCurrentChapter(currentChapter + 1);
            setCurrentPage(0); // Reset to first page of the new chapter
        } else if (direction === 'prev' && currentChapter > 0) {
            setCurrentChapter(currentChapter - 1);
            setCurrentPage(0); // Reset to first page of the new chapter
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return; // prevent empty comments
        setSubmitting(true);
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/comments`, {
                content: newComment,
                chapter_id: currentChapter + 1,
                user_id: user?.id,
            });

            setNewComment(""); // clear textarea
            setComments([res.data, ...comments]); // adds new comment to the front

        } catch (err) {
            console.error("Failed to submit comment:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // Navigation availability flags
    const canGoPrevChapter = currentChapter > 0;
    const canGoNextChapter = currentChapter < chapters.length - 1;
    const canGoPrevPage =
        chapters.length > 0 &&
        chapters[currentChapter]?.pages?.length > 0 &&
        (currentPage > 0 || canGoPrevChapter);
    const canGoNextPage =
        chapters.length > 0 &&
        chapters[currentChapter]?.pages?.length > 0 &&
        (currentPage < chapters[currentChapter].pages.length - 1 || canGoNextChapter);

    if (loading) {
        return (
            <PageAnimation>
                <div className="page-loading" role="status" aria-live="polite" aria-label="Loading content">
                    <div className="spinner" />
                </div>
            </PageAnimation>
        );
    }

    return (
        <PageAnimation>
            <div className='comic-viewer-container'>
                <h1 className="comic-chapter-title">{chapters[currentChapter]?.title}</h1>
                <div className="comic-viewer" onClick={handleImageClick}>
                    {chapters.length > 0 && chapters[currentChapter]?.pages?.length > 0 ? (
                        <img
                            src={`${process.env.REACT_APP_API_URL}${chapters[currentChapter].pages[currentPage].image}`}
                            alt={`Comic page ${currentPage + 1}`}
                        />
                    ) : (
                        <div className="image-placeholder"><div className="spinner" /></div>
                    )}
                </div>
                <div className="comic-page-indicator">
                    <div className="navigation-buttons">
                        <button className="page-button" onClick={() => handleChapterChange('prev')} disabled={!canGoPrevChapter} aria-label="Previous chapter" title="Previous chapter">
                            <img className="left-icon" src={chapterIcon} alt="" />
                        </button>
                        <button className="page-button" onClick={() => handlePageChange('prev')} disabled={!canGoPrevPage} aria-label="Previous page" title="Previous page">
                            <img className="left-icon" src={pageIcon} alt="" />
                        </button>
                        <button className="page-button" onClick={() => handlePageChange('next')} disabled={!canGoNextPage} aria-label="Next page" title="Next page">
                            <img className="right-icon" src={pageIcon} alt="" />
                        </button>
                        <button className="page-button" onClick={() => handleChapterChange('next')} disabled={!canGoNextChapter} aria-label="Next chapter" title="Next chapter">
                            <img className="right-icon" src={chapterIcon} alt="" />
                        </button>
                    </div>
                    {chapters.length > 0 && chapters[currentChapter]?.pages?.length > 0 ? (
                        <p>Page {currentPage + 1} of {chapters[currentChapter].pages.length}</p>
                    ) : null}
                </div>
            </div>
            <div className="comment-section">
                <h2 className="comment-title">Comments</h2>
                <form className="comment-form" onSubmit={(e) => {
                    e.preventDefault();
                    handleCommentSubmit(e);
                }}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={ !user ? "Log in to post a comment" : "Write your comment here..." }
                        required
                        rows={4}
                        className='comment-textarea'
                        disabled={!user || submitting}
                        maxLength={500}
                    />
                    <button type="submit" className='comment-submit-button' disabled={!user || submitting}>{submitting ? "Posting..." : "Post Comment"}</button>
                </form>

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
