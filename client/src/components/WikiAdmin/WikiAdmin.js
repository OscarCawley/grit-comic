import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './WikiAdmin.css';
import TipTapEditor from '../TipTapEditor/TipTapEditor';

const WikiAdmin = () => {

	const [posts, setPosts] = useState([]);
	const [formData, setFormData] = useState({ title: '', slug: '', content: '', image: null });
	const [editingId, setEditingId] = useState(null);
	const [isSlugEdited, setIsSlugEdited] = useState(false);
	const formRef = useRef(null);
	const token = localStorage.getItem('token');

	useEffect(() => {
		fetchPosts();
	}, []);

	useEffect(() => {
  		if (!isSlugEdited) {
    		setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
  		}
	}, [formData.title, isSlugEdited]);

	const fetchPosts = async () => {
		const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/wiki/posts`);
		setPosts(res.data);
	};

	const handleCreate = async () => {

		const { title, slug, content, image } = formData;

		if (!title.trim() || !slug.trim() || !content.trim()) {
			alert('Please fill out all fields before creating the post.');
			return;}

		try {
			const data = new FormData();
			data.append('title', title);
			data.append('slug', slug);
			data.append('content', content);

			if (image) {
				data.append('image', image);
			}

			await axios.post(`${process.env.REACT_APP_API_URL}/api/wiki/create`, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${token}`
				}
			});

			alert('Wiki post created!');
			setFormData({ title: '', slug: '', content: '', image: null });
			if (formRef.current) {
				formRef.current.value = '';
			}
			fetchPosts();

		} catch (err) {
			console.error('Error creating post:', err);
			alert('Failed to create post.');
		}
	};

	const handleEdit = (post) => {
		setFormData({ 
			title: post.title,
			slug: post.slug,
			content: post.content,
			image: null,
			existingImage: post.image
		});
		setEditingId(post.id);
		if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
	}

	const handleUpdate = async () => {
		const { title, slug, content, image } = formData;

		const data = new FormData();
		data.append('title', title);
		data.append('slug', slug);
		data.append('content', content);

		if (image) {
			data.append('image', image); // New uploaded image
		}

		try {
			await axios.put(`${process.env.REACT_APP_API_URL}/api/wiki/${editingId}`, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${token}`
				}
			});
			alert('Wiki post updated!');
			setFormData({ title: '', slug: '', content: '', image: null });
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
		if (window.confirm('Are you sure you want to delete this post?')) {
			try {
				await axios.delete(`${process.env.REACT_APP_API_URL}/api/wiki/${postId}`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				alert('Wiki post deleted!');
				setPosts(posts.filter(post => post.id !== postId));
			} catch (err) {
				console.error('Error deleting post:', err);
				alert('Failed to delete post.');
			}
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
			<h1>Wiki</h1>
			<form className='wiki-form' onSubmit={(e) => {
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
						setIsSlugEdited(false);
					}}
				/>
				<input
					type="text"
					maxLength={120}
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
				<input type="file" accept='image/*' ref={formRef} onChange={(e) => setFormData({ ...formData, image: e.target.files[0]})}/>
				{formData.existingImage && !formData.image && (
					<div>
						<p>Current Image:</p>
						<img
							src={`${process.env.REACT_APP_API_URL}${formData.existingImage}`}
							alt="Current"
							style={{ maxWidth: '200px', display: 'block', marginBottom: '1em' }}
						/>
					</div>
				)}
				<button className="submit-button" type="submit">{editingId ? 'Update' : 'Create'}</button>
			</form>
			<div className='wiki-posts'>
				<ul>
					{posts.map(post => (
					<li key={post.id}>
						{post.title} ({post.slug})
						<span>
							<button onClick={() => handleEdit(post)}>Edit</button>
							<button onClick={() => handleDelete(post.id)}>Delete</button>
						</span>
					</li>))}
				</ul>
			</div>
		</div>
    );
};

export default WikiAdmin;