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

    // Pagination state
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [fetching, setFetching] = useState(false);

    const limit = 10;

    useEffect(() => {
        const initLoad = async () => {
            try {
                showLoading();
                await fetchWiki(true); // initial load with reset
            } finally {
                hideLoading();
            }
        };
        initLoad();
    }, []);

    /**
     * Fetch wiki posts
     * @param {boolean} reset — true = reset list for new search
     * @param {string|null} customSearch — use this search instead of current state
     */
    const fetchWiki = async (reset = false, customSearch = null) => {
        if (fetching) return;
        setFetching(true);

        try {
            const search = customSearch !== null ? customSearch : searchTerm;

            if (reset) {
                setPosts([]);
                setOffset(0);
            }

            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/wiki/posts`, {
                params: {
                    search,
                    offset: reset ? 0 : offset,
                    limit
                }
            });

            const data = response.data.results || response.data;

            if (reset) {
                setPosts(data);
                setOffset(data.length);
            } else {
                setPosts((prev) => [...prev, ...data]);
                setOffset((prev) => prev + data.length);
            }

            setHasMore(response.data.hasMore ?? false);

        } catch (error) {
            console.error('Error fetching wiki data:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Reset + search
        await fetchWiki(true, value);
    };

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
                    
                    {/* Search Bar */}
                    <div className='wiki-search'>
                        <input 
                            type="text" 
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* Posts */}
                    {posts.map((post) => (
                        <div key={post.id} className="wiki-item">
                            <Link to={`/wiki/${post.slug}`} className='wiki-item-link'>
                                <div className='wiki-item-header'>
                                    <h2>{post.title}</h2>
                                </div>
                                <div 
                                    className='wiki-item-content' 
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(post.content)
                                    }}
                                ></div>
                                <div className='wiki-footer'>
                                    <p className='read-more'>Read More...</p>
                                    <p className='wiki-item-updated'>{post.updated_at_formatted}</p>
                                </div>
                            </Link>
                        </div>
                    ))}

                    {/* Load More Button */}
                    {!fetching && hasMore && (
                        <button 
                            className="load-more-button" 
                            onClick={() => fetchWiki(false)}
                            disabled={fetching}
                        >
                            {fetching ? "Loading..." : "Load More..."}
                        </button>
                    )}
                    {fetching && hasMore && (
                        <div className="small-spinner" />
                    )}

                </div>
            </div>
        </PageAnimation>
    );
};

export default Wiki;