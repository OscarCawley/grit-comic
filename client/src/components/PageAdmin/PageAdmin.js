import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './PageAdmin.css';

const PageAdmin = ({ selectedChapter }) => {
    const [pages, setPages] = useState([]);

        const fetchPages = useCallback(async () => {
        if (!selectedChapter) return;

        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapters/${selectedChapter.chapterNum}/pages`);
            setPages(res.data);
        } catch (err) {
            console.error('Error fetching pages:', err);
        }
    }, [selectedChapter]);

    useEffect(() => {
		fetchPages();
	}, [fetchPages]);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/chapters/upload/${selectedChapter.chapterNum}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchPages();
            alert('Images uploaded successfully!');
        } catch (err) {
            console.error('Error uploading images:', err);
            alert('Failed to upload images.');
        }
    }

    const handleReorder = (direction, page) => {
        const currentIndex = pages.findIndex(p => p.pageNum === page.pageNum);
        let newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= pages.length) return; // Out of bounds

        const updatedPages = [...pages];
        [updatedPages[currentIndex], updatedPages[newIndex]] = [updatedPages[newIndex], updatedPages[currentIndex]];
        setPages(updatedPages);
    }

    const handleDelete = async (page) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/chapters/delete/${selectedChapter.chapterNum}/page/${page.pageNum}`);
            setPages(pages.filter(p => p.pageNum !== page.pageNum));
        } catch (err) {
            console.error('Error deleting page:', err);
            alert('Failed to delete page.');
        }
    }

    const handleSave = async () => {
        try {
            // Optional: ensure correct page numbers before saving
            const reorderedPages = pages.map((page, index) => ({
                ...page,
                pageNum: index + 1,
            }));

            await axios.put(`${process.env.REACT_APP_API_URL}/api/chapters/reorder/${selectedChapter.chapterNum}`, {
                pages: reorderedPages,
            });

            setPages(reorderedPages); // update state in case pageNums changed
            alert('Page order saved successfully!');
        } catch (err) {
            console.error('Error saving page order:', err);
            alert('Failed to save page order.');
        }
    }

    const deleteAll = async () => {
        if (!window.confirm('Are you sure you want to delete all pages? This action cannot be undone.')) return;

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/chapters/delete/${selectedChapter.chapterNum}/all`);
            setPages([]);
            alert('All pages deleted successfully!');
        } catch (err) {
            console.error('Error deleting all pages:', err);
            alert('Failed to delete all pages.');
        }
    };


    return (
        <div className='page-container'>
            <h1>Manage Pages for Chapter {selectedChapter.chapterNum}</h1>
            <div className='image-upload'>
                <label htmlFor='file-upload' className='custom-file-upload'>
                    Upload Images
                </label>
                <input
                    id='file-upload'
                    type='file'
                    multiple
                    accept='image/*'
                    onChange={handleFileChange}
                />
            </div>
            <button className='save-order' onClick={handleSave}>Save Order</button>
            <button className='delete-all' onClick={deleteAll}>Delete All</button>
            <div className='page-list'>
                {pages.map(page => (
                <div key={page.pageNum} className="page-item">
                    <div className='page-head'>
                        <button className='arrow-button-left' onClick={() => handleReorder('left', page)}>&lt;</button>
                        <h3>Page {page.pageNum}</h3>
                        <button className='arrow-button-right' onClick={() => handleReorder('right', page)}>&gt;</button>
                    </div>
                    <div className='page-content'>
                        <img src={`${process.env.REACT_APP_API_URL}${page.image}`} alt={`Page ${page.pageNum} of Chapter ${page.chapterNum}`} />
                        <button onClick={() => handleDelete(page)}>Delete</button>
                    </div>  
                </div>
                ))}
            </div>
        </div>
    );
}

export default PageAdmin;