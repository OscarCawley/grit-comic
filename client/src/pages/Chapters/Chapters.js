import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './Chapters.css';
import volumeCover from '../../assets/volume-cover.png';
import PageAnimation from '../../components/PageAnimation/PageAnimation.js';

const Chapters = () => {
    const navigate = useNavigate();
    const [chapters, setChapters] = useState([]);

    useEffect(() => {
        fetchChapters();
    }, []);

    const fetchChapters = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/chapters');
            setChapters(res.data);
        } catch (err) {
            console.error('Error fetching chapters:', err);
        }
    }

    const handleChapterClick = (index) => {
        navigate(`/?chapter=${index}`); // Navigate to Home with chapter index as a query parameter
    };


    return (
        <PageAnimation>
            <div className='chapters-page'>
                <div className='volume-covers'>
                    <img src={volumeCover} alt="Volume Cover" />
                </div>
                <ul className='chapters-list'>
                    <h1>Chapters</h1>
                    {chapters.map(chapter => (
                        <li key={chapter.chapterNum} className='chapter-item' onClick={() => handleChapterClick(chapter.chapterNum - 1)}>
                            <h2>{chapter.title}</h2>
                            <p>Pages: {chapter.pageCount}</p>
                        </li>
                    ))}
                </ul>
                <div className='description'>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </div>
            </div>
        </PageAnimation>
    );
};

export default Chapters;