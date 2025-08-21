import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import qs from 'qs';
import './Chapters.css';
import PageAnimation from '../../components/PageAnimation/PageAnimation.js';

const Chapters = () => {
    const navigate = useNavigate();
    const [chapters, setChapters] = useState([]);
    const [assets, setAssets] = useState([])
    const volumeCover = assets.find(asset => asset.name === 'Volume Cover');
    const chapterDescription = assets.find(asset => asset.name === 'Chapter Page Description');

    useEffect(() => {
        fetchChapters();
        fetchAssets();
    }, []);

    const fetchChapters = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapters`);
            setChapters(res.data);
        } catch (err) {
            console.error('Error fetching chapters:', err);
        }
    }

    const fetchAssets = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/assets/`, {
                params: {names: ['Volume Cover', 'Chapter Page Description']},
                paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
            })
            setAssets(res.data)
        } catch (err) {
            console.error('Error fetching assets:', err);
        }
    }

    const handleChapterClick = (index) => {
        navigate(`/?chapter=${index}`); // Navigate to Home with chapter index as a query parameter
    };


    return (
        <PageAnimation>
            <div className='chapters-page'>
                <div className='volume-covers'>
                    {volumeCover && (
                        <img
                            src={`${process.env.REACT_APP_API_URL}${volumeCover.content}`}
                            alt="Volume Cover"
                        />
                    )}
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
                    {chapterDescription && (
                        <div
                            dangerouslySetInnerHTML={{ __html: chapterDescription.content }}
                        />
                    )}
                </div>
            </div>
        </PageAnimation>
    );
};

export default Chapters;