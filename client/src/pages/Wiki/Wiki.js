import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Wiki.css';
import DOMPurify from 'dompurify';
import PageAnimation from '../../components/PageAnimation/PageAnimation.js';
import useMinLoading from '../../hooks/useMinLoading';

const Wiki = () => {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, showLoading, hideLoading] = useMinLoading(true);

    useEffect(() => {
        const initLoad = async () => {
            try {
                showLoading();
                await fetchWiki();
            } finally {
                hideLoading();
            }
        };
        initLoad();
    }, []);

    const fetchWiki = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/wiki/posts`);
            const sortedData = [...response.data].sort(
                (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
            );
            setPosts(sortedData);
        } catch (error) {
            console.error('Error fetching wiki data:', error);
        }
    };

    const filteredPosts = posts.filter((post) => {

        const matchesSearch =
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="page-loading" role="status" aria-live="polite" aria-label="Loading content">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <PageAnimation>
            <div className='wiki'>
                <h1>Wiki</h1>
                <div className="wiki-list">
                    <div className='wiki-search'>
                        <input 
                            type="text" 
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {filteredPosts.map((post) => (
                        <div key={post.id} className="wiki-item">
                            <Link to={`/wiki/${post.slug}`} className='wiki-item-link'>
                            <div className='wiki-item-header'>
                                <h2>{post.title}</h2>
                            </div>
                            <div className='wiki-item-content' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}></div>
                            <div className='wiki-footer'>
                                <p className='read-more'>Read More...</p>
                                <p className='wiki-item-updated'>{post.updated_at_formatted}</p>
                            </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </PageAnimation>
    );
};

export default Wiki;
