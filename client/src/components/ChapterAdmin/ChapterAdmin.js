import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './ChapterAdmin.css';

const ChapterAdmin = ({ setView, setSelectedChapter }) => {

    const [chapters, setChapters] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({chapterNum: '', title: ''});
    const formRef = useRef(null);

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

    const handleCreate = async () => {
        const { chapterNum, title } = formData;

        if (!chapterNum.trim() || !title.trim()) {
			alert('Please fill out all fields before creating the chapter.');
			return;}

        try {
            await axios.post('http://localhost:5000/api/chapters/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
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

    const handleEdit = (chapter) => {
        setFormData({ chapterNum: chapter.chapterNum, title: chapter.title });
        setEditingId(chapter.chapterNum);
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const handleUpdate = async () => {

        try {
			await axios.put(`http://localhost:5000/api/chapters/update/${editingId}`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' }
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
                await axios.delete(`http://localhost:5000/api/chapters/delete/${chapterId}`);
                setChapters(chapters.filter(ch => ch.chapterNum !== chapterId));
            } catch (err) {
                console.error('Error deleting chapter:', err);
            }
        }
    }

    return (
        <div>
            <h1>Chapters</h1>
            <form className='chapter-form' onSubmit={(e) => {
                e.preventDefault();
                editingId ? handleUpdate() : handleCreate();
            }}>
                <input
                    type='text'
                    name='chapterNum'
                    placeholder='Chapter Number'
                    value={formData.chapterNum}
                    onChange={(e) => setFormData({ ...formData, chapterNum: e.target.value })}
                    required
                />
                <input
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
                        <li key={chapter.chapterNum}>
                            Chapter {chapter.chapterNum}: {chapter.title} - {chapter.pageCount} pages
                            <span>
                                <button onClick={() => {
                                    setSelectedChapter(chapter);
                                    setView('pages');}}>Edit
                                </button>
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