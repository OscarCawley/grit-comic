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
    const [loading, setLoading] = useState(true);
    const volumeCover = assets.find(asset => asset.name === 'Volume Cover');
    const chapterDescription = assets.find(asset => asset.name === 'Chapter Page Description');

    useEffect(() => {
        const initLoad = async () => {
            try {
                await Promise.all([fetchChapters(), fetchAssets()]);
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
