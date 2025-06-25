import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Wiki.css';
import DOMPurify from 'dompurify';

const Wiki = () => {
    const [allPosts, setAllPosts] = useState([]);
    const [posts, setPosts] = useState([]);
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        fetchWiki();
        setActiveCategory("All");
    }, [])

    const fetchWiki = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/wiki');
        setAllPosts(response.data);
        setPosts(response.data);
        setAllPosts(prevPosts => [...prevPosts].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
        setPosts(prevPosts => [...prevPosts].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)))
    } catch (error) {
        console.error('Error fetching wiki data:', error);
    }};
    

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        if (category === "All") {
            setPosts(allPosts);
        } else {
            setPosts(allPosts.filter(post => post.category_name === category));
        }
        return;
    }

    return (
        <div className='wiki'>
            <div className="category-list">
                <h1>Category</h1>
                <button className={`category-button ${activeCategory === "All" ? "active" : ""}`} onClick={() => handleCategoryClick("All")}>All</button>
                <button className={`category-button ${activeCategory === "General" ? "active" : ""}`} onClick={() => handleCategoryClick("General")}>General</button>
                <button className={`category-button ${activeCategory === "World" ? "active" : ""}`} onClick={() => handleCategoryClick("World")}>World</button>
                <button className={`category-button ${activeCategory === "Characters" ? "active" : ""}`} onClick={() => handleCategoryClick("Characters")}>Characters</button>
            </div>
            <div className="wiki-list">
                <h1>Wiki</h1>
                {posts.map((post) => (
                    <div key={post.id} className="wiki-item">
                        <div className='wiki-item-header'>
                            <h2>{post.title}</h2>
                            <span>{post.category_name}</span>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}></div>
                        <p className='wiki-item-updated'>{post.updated_at_formatted}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wiki;