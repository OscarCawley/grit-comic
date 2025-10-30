import axios from 'axios';
import { useState, useEffect } from 'react';
import './CommentAdmin.css';

const CommentAdmin = () => {
    const [comments, setComments] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [chapterTerm, setChapterTerm] = useState(''); // stores chapter name

    useEffect (() => {
        fetchComments();
        fetchChapters();
    }, []);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/comments`);
            setComments(response.data);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        }
    };

    const fetchChapters = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapters`);
            setChapters(response.data);
        } catch (err) {
            console.error('Failed to fetch chapters:', err);
        }  
    };
    
    const handleDelete = (commentId) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            axios.delete(`${process.env.REACT_APP_API_URL}/api/comments/${commentId}`)
                .then(() => {
                    setComments(comments.filter(comment => comment.id !== commentId));
                })
                .catch(err => {
                    console.error('Failed to delete comment:', err);
                });
        }
    };

    const selectedChapter = chapters.find(chap => chap.title === chapterTerm);
    const selectedChapterId = selectedChapter ? selectedChapter.chapter_num : null;

    const filteredComments = comments.filter((comment) => {
        const matchesUser =
            userSearchTerm === "" || comment.username.toLowerCase().includes(userSearchTerm.toLowerCase());
        const matchesChapter =
            chapterTerm === "" || comment.chapter_id === selectedChapterId;
        return matchesUser && matchesChapter;
    });

    return (
        <div className="comment-container">
            <h1>Comment List</h1>
            <div className='filters'>
                <select value={chapterTerm} onChange={(e) => setChapterTerm(e.target.value)}>
                    <option value="">All Chapters</option>
                    {chapters.map(chapter => (
                        <option key={chapter.chapter_num} value={chapter.title}>
                            {`Chapter ${chapter.chapter_num}: ${chapter.title}`}
                        </option>
                    ))}
                </select>
                <input 
                    type="text" 
                    placeholder="User..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                />

            </div>
            <ul className="comment-list">
                {filteredComments.map(comment => (
                    <li key={comment.id} className="comment-item">
                        <span>{comment.username}: {comment.content}</span>
                        <button className='delete-button' onClick={() => handleDelete(comment.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommentAdmin;