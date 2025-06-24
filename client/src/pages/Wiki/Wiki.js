import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Wiki.css';

const Wiki = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchWiki();
    }, [])

        const fetchWiki = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/wiki');
            setPosts(response.data);
            setPosts(prevPosts => [...prevPosts].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
        } catch (error) {
            console.error('Error fetching wiki data:', error);
        }};
    
    return (
        <div className='wiki'>
            <div className="category-list">
                <h1>Category</h1>
            </div>
            <div className="wiki-list">
                <h1>Wiki</h1>
                {posts.map((post) => (
                    <div key={post.id} className="wiki-item">
                        <div className='wiki-item-header'>
                            <h2>{post.title}</h2>
                            <span>{post.category_name}</span>
                        </div>
                        <p>{post.content}</p>
                        <p className='wiki-item-updated'>{post.updated_at_formatted}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wiki;