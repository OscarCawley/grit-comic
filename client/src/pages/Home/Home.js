import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import axios from 'axios';
import './Home.css';
import PageAnimation from '../../components/PageAnimation/PageAnimation.js';
import pageIcon from '../../assets/icons/page.png';
import chapterIcon from '../../assets/icons/chapter.png';
import useMinLoading from '../../hooks/useMinLoading';

const Home = () => {
    const { user } = useContext(UserContext);
    const [searchParams] = useSearchParams();
    const initialChapter = parseInt(searchParams.get('chapter')) || 0;

    const [currentPage, setCurrentPage] = useState(0);
    const [currentChapter, setCurrentChapter] = useState(0);
    const [comments, setComments] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loading, showLoading, hideLoading] = useMinLoading(true);
    const [newComment, setNewComment] = useState('');
    const token = localStorage.getItem('token');

    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const limit = 10;

    const fetchChapters = async () => {
        const chapterRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapters`);
        const chapterData = chapterRes.data;

        const chapterWithPages = await Promise.all(
            chapterData.map(async chapter => {
                const pageRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapters/${chapter.chapter_num}/pages`);
                return { ...chapter, pages: pageRes.data };
            })
        );

        setChapters(chapterWithPages);
        return chapterWithPages; // return for immediate use
    };

    const fetchComments = async (reset = false, chapterArg = null) => {
        if (commentsLoading) return;
        setCommentsLoading(true);

        try {
            const chapterToFetch = chapterArg !== null ? chapterArg : currentChapter;
            if (reset) setComments([]); // clear old comments immediately

            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/comments`, {
                params: {
                    chapter: chapterToFetch + 1,
                    offset: reset ? 0 : offset,
                    limit
                }
            });

            const newComments = res.data.comments;

            if (reset) {
                setComments(newComments);
                setOffset(newComments.length);
            } else {
                setComments(prev => [...prev, ...newComments]);
                setOffset(prev => prev + newComments.length);
            }

            setHasMore(res.data.hasMore);

        } catch (err) {
            console.error("Failed to load comments:", err);
        } finally {
            setCommentsLoading(false);
        }
    };

    useEffect(() => {
        const loadPageData = async () => {
            try {
                showLoading();

                await fetchChapters();
                const initial = initialChapter || 0;
                setCurrentChapter(initial);
                setCurrentPage(0);

                await fetchComments(true, initial);

            } catch (err) {
                console.error('Failed to load page data:', err);
            } finally {
                hideLoading();
            }
        };

        loadPageData();
    }, []);

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

    const handleChapterChange = async (direction) => {
        let newChapter = currentChapter;
        if (direction === 'next' && currentChapter < chapters.length - 1) {
            newChapter = currentChapter + 1;
        } else if (direction === 'prev' && currentChapter > 0) {
            newChapter = currentChapter - 1;
        }

        setCurrentChapter(newChapter);
        setCurrentPage(0); // reset page
        setOffset(0);
        setHasMore(true);

        await fetchComments(true, newChapter); // fetch comments for the new chapter
    };

    const handlePageChange = useCallback((direction) => {
        if (!chapters.length) return;

        const currentChapterPages = chapters[currentChapter].pages.length;

        if (direction === 'next') {
            if (currentPage < currentChapterPages - 1) {
                setCurrentPage(currentPage + 1);
            } else if (currentChapter < chapters.length - 1) {
                handleChapterChange('next'); // move to next chapter
            }
        } else if (direction === 'prev') {
            if (currentPage > 0) {
                setCurrentPage(currentPage - 1);
            } else if (currentChapter > 0) {
                const newChapter = currentChapter - 1;
                const lastPageIndex = chapters[newChapter].pages.length - 1;

                setCurrentChapter(newChapter);
                setCurrentPage(lastPageIndex);
                setOffset(0);
                setHasMore(true);
                fetchComments(true, newChapter);
            }
        }
    }, [currentPage, currentChapter, chapters, handleChapterChange]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return; // prevent empty comments
        setSubmitting(true);
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/comments`, {
                content: newComment,
                chapter_num: currentChapter + 1,
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

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/comments/user/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            console.error("Failed to delete comment:", err);
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
            <div className="page-loading" role="status" aria-live="polite" aria-label="Loading content">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <PageAnimation>
            <div className='comic-viewer-container'>
                <h1 className="comic-chapter-title">{chapters[currentChapter]?.title}</h1>
                {chapters.length > 0 && chapters[currentChapter]?.pages?.length > 0 ? (
                    <p className='page-count'>Page {currentPage + 1} of {chapters[currentChapter].pages.length}</p>
                ) : null}
                <div className="comic-viewer" onClick={handleImageClick}>
                    {chapters.length > 0 && chapters[currentChapter]?.pages?.length > 0 ? (
                        <img
                            src={`${chapters[currentChapter].pages[currentPage].image}`}
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
                {comments.length > 0 && (
                    <>
                        {comments.map(comment => (
                            <div key={comment.id} className="comment">
                                <div className="comment-header">
                                    <h3>{comment.username}</h3>
                                    {user?.id === comment.user_id && (
                                        <button 
                                            className="delete-comment-button"
                                            onClick={() => handleDeleteComment(comment.id)}
                                        >Delete</button>
                                    )}
                                </div>
                                <div className="comment-content">
                                    {comment.content}
                                </div>
                                <p className='comment-date'>{comment.created_at_formatted}</p>
                            </div>
                        ))}
                        {!commentsLoading && hasMore && (
                            <button
                                className="load-more-button"
                                onClick={() => fetchComments(false)}
                            >
                                Load More...
                            </button>
                        )}
                        {commentsLoading && hasMore && (
                            <div className="small-spinner" />
                        )}
                    </>
                )}
            </div>
        </PageAnimation>
    );
};

export default Home;
