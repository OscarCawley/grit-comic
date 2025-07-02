import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './WikiAdmin.css';
import TipTapEditor from '../TipTapEditor/TipTapEditor';

const WikiAdmin = () => {

	const [posts, setPosts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [formData, setFormData] = useState({ title: '', slug: '', content: '', category_id: '', image: null });
	const [editingId, setEditingId] = useState(null);
	const [isSlugEdited, setIsSlugEdited] = useState(false);
	const formRef = useRef(null);

	useEffect(() => {
		fetchCategories();
		fetchPosts();
	}, []);

	const fetchCategories = async () => {
		const res = await axios.get('http://localhost:5000/api/wiki/categories');
		setCategories(res.data);
	};

	const fetchPosts = async () => {
		const res = await axios.get('http://localhost:5000/api/wiki/posts');
		setPosts(res.data);
	};

	const handleCreate = async () => {

		const { title, slug, content, category_id, image } = formData;

		if (!title.trim() || !slug.trim() || !content.trim() || !category_id || isNaN(category_id)) {
		alert('Please fill out all fields before creating the post.');
		return;}

		try {
			const data = new FormData();
			data.append('title', title);
			data.append('slug', slug);
			data.append('content', content);
			data.append('category_id', category_id);

			if (image) {
				data.append('image', image);
			}

			await axios.post('http://localhost:5000/api/wiki/create', data, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});

			alert('Wiki post created!');
			setFormData({ title: '', slug: '', content: '', category_id: '', image: null });
			if (formRef.current) {
				formRef.current.value = '';
			}
			fetchPosts();

		} catch (err) {
			console.error('Error creating post:', err);
			alert('Failed to create post.');
		}
	};

	useEffect(() => {
  		if (!isSlugEdited) {
    		setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
  		}
	}, [formData.title, isSlugEdited]);

	const handleEdit = (post) => {
		setFormData({ 
			title: post.title,
			slug: post.slug,
			content: post.content,
			category_id: post.category_id,
			image: null,
			existingImage: post.image
		});
		setEditingId(post.id);
	}

	const handleUpdate = async () => {
		const { title, slug, content, category_id, image } = formData;

		const data = new FormData();
		data.append('title', title);
		data.append('slug', slug);
		data.append('content', content);
		data.append('category_id', category_id);

		if (image) {
			data.append('image', image); // New uploaded image
		}

		try {
			await axios.put(`http://localhost:5000/api/wiki/${editingId}`, data, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});
			alert('Wiki post updated!');
			setFormData({ title: '', slug: '', content: '', category_id: '', image: null });
			setEditingId(null);
			if (formRef.current) {
				formRef.current.value = '';
			}
			fetchPosts();
		} catch (err) {
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

	const slugify = (text) => {
  		return text
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')   // remove invalid chars
			.replace(/\s+/g, '-')       // replace spaces with hyphens
			.replace(/--+/g, '-');      // replace multiple hyphens with single
		};
	
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
					onChange={(e) => {
						setFormData({ ...formData, title: e.target.value })
						setIsSlugEdited(false);
					}}
				/>
				<input
					type="text"
					placeholder="Slug"
					value={formData.slug}
					onChange={(e) => {
						setFormData({ ...formData, slug: e.target.value })
						setIsSlugEdited(true);
					}}
				/>
				<TipTapEditor
					content={formData.content}
					onChange={(html) => setFormData({ ...formData, content: html })}
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
				<input type="file" accept='image/*' ref={formRef} onChange={(e) => setFormData({ ...formData, image: e.target.files[0]})}/>
				{formData.existingImage && !formData.image && (
					<div>
						<p>Current Image:</p>
						<img
							src={`http://localhost:5000${formData.existingImage}`}
							alt="Current"
							style={{ maxWidth: '200px', display: 'block', marginBottom: '1em' }}
						/>
					</div>
				)}
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

export default WikiAdmin;