import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './ChapterAdmin.css';

const ChapterAdmin = () => {

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
    
    return (
        <div>
            <h1>Chapters</h1>
            <ul>
                {chapters.map(chapter => (
                    <li key={chapter.chapterNum}>
                        <strong>Chapter {chapter.chapterNum}:</strong> {chapter.title}
                    </li>
                ))}
            </ul>
            
        </div>
    );
}

export default ChapterAdmin;