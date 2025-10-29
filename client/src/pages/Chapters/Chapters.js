import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './Chapters.css';
import PageAnimation from '../../components/PageAnimation/PageAnimation.js';

const Chapters = () => {
    const navigate = useNavigate();
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect (() => {
        const initLoad = async () => {
            try {
                await fetchChapters();
            } finally {
                setLoading(false);
            }
        };
        initLoad();
    }, []);

    const fetchChapters = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapters`);
            setChapters(res.data);
        } catch (err) {
            console.error('Error fetching chapters:', err);
        }
    }

    const handleChapterClick = (index) => {
        navigate(`/?chapter=${index}`); // Navigate to Home with chapter index as a query parameter
    };


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
            <div className='chapters-page'>
                <h1>Chapters</h1>
                <ul className='chapters-list'>
                    {chapters.map(chapter => (
                        <li key={chapter.chapterNum} className='chapter-item' onClick={() => handleChapterClick(chapter.chapterNum - 1)}>
                            <h2>{chapter.title}</h2>
                            <p>Pages: {chapter.pageCount}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </PageAnimation>
    );
};

export default Chapters;
