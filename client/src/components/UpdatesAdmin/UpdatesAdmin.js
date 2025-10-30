import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './UpdatesAdmin.css';
import TipTapEditor from '../TipTapEditor/TipTapEditor';


const UpdatesAdmin = () => {
    const [updates, setUpdates] = useState([]);
    const [users, setUsers] = useState([]);
	const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({title: '', content: ''});
    const formRef = useRef(null);

	const token = localStorage.getItem('token');

	useEffect(() => {
		fetchUpdates();
        fetchUsers();
	}, []);

	const fetchUpdates = async () => {
		try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/updates`);
            setUpdates(response.data);
        } catch (error) {
            console.error('Error fetching Updates:', error);
        }
	};

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/subscribers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        }
        catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const isEmptyHtml = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const text = doc.body.textContent.replace(/\u00a0/g, '').trim();
        const hasMedia = doc.body.querySelector('img, video, audio, iframe, embed');
        return !text && !hasMedia;
    };

    const handleCreate = async () => {
        console.log('Does it get here?');
        const { title, content } = formData;

        if (!title.trim() || isEmptyHtml(content)) {

            alert('Please fill out all fields before creating the update.');
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/updates/create`, { title, content, users: users }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Update created!');
            setFormData({ title: '', content: '' });
            fetchUpdates();
        } catch (error) {
            console.error('Error creating update:', error);
        }
    };

    const handleUpdate = async () => {
        const { title, content } = formData;

        if (!title.trim() || !content.trim()) {
            alert('Please fill out all fields before editing the update.');
            return;
        }

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/updates/${editingId}`, { title, content }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Update edited!');
            setFormData({ title: '', content: '' });
            setEditingId(null);
            fetchUpdates();
        } catch (error) {
            console.error('Error editing update:', error);
        }
    };

    const handleEdit = (update) => {
        setEditingId(update.id);
        setFormData({ title: update.title, content: update.content });
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this update?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/updates/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Update deleted!');
                fetchUpdates();
            } catch (error) {
                console.error('Error deleting update:', error);
            }
        }
    };

    return (
        <div className='updates-container'>
			<h1>Updates</h1>
			<form className='updates-form' onSubmit={(e) => {
				e.preventDefault();
				editingId ? handleUpdate() : handleCreate();
			}}>
				<input
					type="text"
					maxLength={120}
					placeholder="Title"
					value={formData.title}
					onChange={(e) => {
						setFormData({ ...formData, title: e.target.value })
					}}
				/>
				<TipTapEditor
					content={formData.content}
					onChange={(html) => setFormData({ ...formData, content: html })}
                    limit={1000} // Set a limit if needed
				/>
				<button className='submit-button' type="submit">{editingId ? 'Update' : 'Create'}</button>
			</form>
			<div className='updates-posts'>
				<ul>
					{updates.map(update => (
					<li key={update.id}>
						{update.title}
						<span>
							<button onClick={() => handleEdit(update)}>Edit</button>
							<button onClick={() => handleDelete(update.id)}>Delete</button>
						</span>
					</li>))}
				</ul>
			</div>
		</div>
    );
};

export default UpdatesAdmin;