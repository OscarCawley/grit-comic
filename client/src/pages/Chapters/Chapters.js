import { useNavigate } from 'react-router-dom';
import './Chapters.css';
import chapters from '../../data.js';
import volumeCover from '../../assets/volume-cover.png';
import PageAnimation from '../../components/PageAnimation/PageAnimation.js';

const Chapters = () => {
    const navigate = useNavigate();

    const handleChapterClick = (index) => {
        navigate(`/?chapter=${index}`); // Navigate to Home with chapter index as a query parameter
    };


    return (
        <PageAnimation>
            <div className='chapters-page'>
                <div className='volume-covers'>
                    <img src={volumeCover} alt="Volume Cover" />
                    <img src={volumeCover} alt="Volume Cover" />
                </div>
                <ul className='chapters-list'>
                    <h1>Chapters</h1>
                    {chapters.map((chapter, index) => (
                        <li key={index} className='chapter-item' onClick={() => handleChapterClick(index)}>
                            <h2>{chapter.title}</h2>
                            <p>Pages: {chapter.pages.length}</p>
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