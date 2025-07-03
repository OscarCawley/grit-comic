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

    const handleEdit = (chapter) => {
        // Logic to handle editing a chapter
        console.log('Edit chapter:', chapter);
    }

    const handleDelete = async (chapterId) => {
        if (window.confirm('Are you sure you want to delete this chapter?')) {
            try {
                await axios.delete(`http://localhost:5000/api/chapters/${chapterId}`);
                setChapters(chapters.filter(ch => ch.chapterNum !== chapterId));
            } catch (err) {
                console.error('Error deleting chapter:', err);
            }
        }
    }

    return (
        <div>
            <h1>Chapters</h1>
            <div className="chapter-list">
                <ul>
                    {chapters.map(chapter => (
                        <li key={chapter.chapterNum}>
                            Chapter {chapter.chapterNum}: {chapter.title} - {chapter.pageCount} pages
                            <span>
                                <button onClick={() => handleEdit(chapter)}>Edit</button>
                                <button onClick={() => handleDelete(chapter.chapterNum)}>Delete</button>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ChapterAdmin;