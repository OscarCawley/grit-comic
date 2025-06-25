import { useEffect, useState } from 'react';
import axios from 'axios';
import './WikiList.css';

const WikiList = () => {

	const [posts, setPosts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [formData, setFormData] = useState({ title: '', slug: '', content: '', category_id: '' });
	const [editingId, setEditingId] = useState(null);

	useEffect(() => {
		fetchCategories();
		fetchPosts();
	}, []);

	const fetchCategories = async () => {
		const res = await axios.get('http://localhost:5000/api/wiki/categories');
		setCategories(res.data);
	};

	const fetchPosts = async () => {
		const res = await axios.get('http://localhost:5000/api/wiki');
		setPosts(res.data);
	};

	const handleCreate = async () => {

		const { title, slug, content, category_id } = formData;

		if (!title.trim() || !slug.trim() || !content.trim() || !category_id || isNaN(category_id)) {
		alert('Please fill out all fields before creating the post.');
		return;}

		try {
			await axios.post('http://localhost:5000/api/wiki/create', formData);
			alert('Wiki post created!');
		
			setFormData({ title: '', slug: '', content: '', category_id: '' });
			fetchPosts();
		} catch (err) {
			console.error('Error creating post:', err);
			alert('Failed to create post.');
		}
    };

	const handleEdit = (post) => {
		setFormData({ title: post.title, slug: post.slug, content: post.content, category_id: post.category_id });
		setEditingId(post.id);
	}

	const handleUpdate = async () => {
		try {
			await axios.put(`http://localhost:5000/api/wiki/${editingId}`, formData);
			alert('Wiki post updated!');
			setFormData({ title: '', slug: '', content: '', category_id: '' });
			setEditingId(null);
		}
		catch (err) {
			console.error('Error updating post:', err);
			alert('Failed to update post.');
		}
	}

	const handleDelete = async (postId) => {
		try {
			await axios.delete(`http://localhost:5000/api/wiki/${postId}`);
			alert('Wiki post deleted!');
			setPosts(posts.filter(post => post.id !== postId));
		} catch (err) {
			console.error('Error deleting post:', err);
			alert('Failed to delete post.');
		}
	}
	




    return (
        <div className='wiki-container'>
			<h1>Wiki List</h1>
			<form className='wiki-form' onSubmit={(e) => {
				e.preventDefault();
				editingId ? handleUpdate() : handleCreate();
			}}>
				<input
					type="text"
					placeholder="Title"
					value={formData.title}
					onChange={(e) => setFormData({ ...formData, title: e.target.value })}
				/>
				<input
					type="text"
					placeholder="Slug"
					value={formData.slug}
					onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
				/>
				<textarea
					placeholder="Content"
					value={formData.content}
					onChange={(e) => setFormData({ ...formData, content: e.target.value })}
				/>
				<select
					value={formData.category_id}
					onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
				>
					
					<option value="">Select Category</option>
					{categories.map(category => (
						<option key={category.id} value={category.id}>{category.name}</option>
					))}
				</select>
				<button type="submit">{editingId ? 'Update' : 'Create'}</button>
			</form>
			<div className='wiki-posts'>
				<ul>
					{posts.map(post => (
					<li key={post.id}>
						{post.title} ({post.slug})
						<button onClick={() => handleEdit(post)}>Edit</button>
						<button onClick={() => handleDelete(post.id)}>Delete</button>
					</li>))}
				</ul>
			</div>
		</div>
    );
};

export default WikiList;