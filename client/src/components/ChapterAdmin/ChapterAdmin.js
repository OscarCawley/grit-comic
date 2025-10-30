import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './ChapterAdmin.css';

const ChapterAdmin = ({ setView, setSelectedChapter }) => {

    const [chapters, setChapters] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({chapterNum: '', title: ''});
    const formRef = useRef(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
		fetchChapters();
	}, []);

    const fetchChapters = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapters`);
            setChapters(res.data);
        } catch (err) {
            console.error('Error fetching chapters:', err);
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault();
        const { chapterNum, title } = formData;

        if (!chapterNum.trim() || !title.trim()) {
			alert('Please fill out all fields before creating the chapter.');
			return;}

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/chapters/create`, { chapterNum, title }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Chapter created!');
            setFormData({ chapterNum: '', title: '' });
            if (formRef.current) {
                formRef.current.value = '';
            }
            fetchChapters();
        } catch(err) {
                console.error('Error creating chapter:', err);
                alert('Failed to create chapter.');
        }
    };

    const handleUpdate = async () => {
        const { chapterNum, title } = formData;

        try {
			await axios.put(`${process.env.REACT_APP_API_URL}/api/chapters/update/${editingId}`, { chapterNum, title }, {
				headers: { Authorization: `Bearer ${token}` }
			});
			alert('Chapter updated!');
			setFormData({ chapterNum: '', title: ''});
			setEditingId(null);
			if (formRef.current) {
				formRef.current.value = '';
			}
			fetchChapters();
		} catch (err) {
			console.error('Error updating chapter:', err);
			alert('Failed to update chapter.');
		}
    }

    const handleDelete = async (chapterId) => {
        if (window.confirm('Are you sure you want to delete this chapter?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/chapters/delete/${chapterId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setChapters(chapters.filter(ch => ch.chapter_num !== chapterId));
            } catch (err) {
                console.error('Error deleting chapter:', err);
            }
        }
    }

    return (
        <div className='chapter-container'>
            <h1>Chapters</h1>
            <form className='chapter-form' onSubmit={(e) => {
                e.preventDefault();
                editingId ? handleUpdate() : handleCreate();
            }}>
                <input
                className='chapter-num-input'
                    type='text'
                    name='chapterNum'
                    placeholder='Number'
                    value={formData.chapterNum}
                    onChange={(e) => setFormData({ ...formData, chapterNum: e.target.value })}
                    required
                />
                <input
                    className='chapter-title-input'
                    type='text'
                    name='title'
                    placeholder='Chapter Title'
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
                <button type='submit'>{editingId ? 'Update' : 'Create'}</button>
            </form>
            <div className="chapter-list">
                <ul>
                    {chapters.map(chapter => (
                        <li key={chapter.chapter_num}>
                            Chapter {chapter.chapter_num}: {chapter.title} - {chapter.pageCount} pages
                            <span>
                                <button onClick={() => {
                                    setSelectedChapter(chapter);
                                    setView('pages');}}>Edit
                                </button>
                                <button onClick={() => handleDelete(chapter.chapter_num)}>Delete</button>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ChapterAdmin;