import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './PageAdmin.css';

const PageAdmin = ({ selectedChapter }) => {
    const [pages, setPages] = useState([]);

    useEffect(() => {
		fetchPages();
	}, []);

    const fetchPages = async () => {
        if (!selectedChapter) return;

        try {
            const res = await axios.get(`http://localhost:5000/api/chapters/${selectedChapter.chapterNum}/pages`);
            setPages(res.data);
        } catch (err) {
            console.error('Error fetching pages:', err);
        }
    }


    return (
        <div className='page-admin-container'>
            <h2>Manage Pages for Chapter {selectedChapter.chapterNum}</h2>
            <div className='page-list'>
                {pages.map(page => (
                <div key={page.pageNum} className="page-item">
                    <h3>Page {page.pageNum}</h3>
                    <p>{page.content}</p>
                    <img src={`http://localhost:5000${page.image}`} alt="image" />
                    <button onClick={() => alert(`Editing page ${page.pageNum}`)}>Edit</button>
                    <button onClick={() => alert(`Deleting page ${page.pageNum}`)}>Delete</button>
                </div>
            ))}
            </div>
            
        </div>
    );
}

export default PageAdmin;