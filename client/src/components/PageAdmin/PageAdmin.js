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

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));

        try {
            await axios.post(`http://localhost:5000/api/chapters/upload/${selectedChapter.chapterNum}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchPages();
            alert('Images uploaded successfully!');
        } catch (err) {
            console.error('Error uploading images:', err);
            alert('Failed to upload images.');
        }
    }


    return (
        <div className='page-container'>
            <h1>Manage Pages for Chapter {selectedChapter.chapterNum}</h1>
            <div className='image-upload'>
                <input
                    type='file'
                    multiple
                    accept='image/*'
                    onChange={handleFileChange}
                />
            </div>
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