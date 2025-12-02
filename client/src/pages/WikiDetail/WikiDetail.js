import { useParams, Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import PageAnimation from '../../components/PageAnimation/PageAnimation.js';
import './WikiDetail.css';
import useMinLoading from '../../hooks/useMinLoading';

function WikiDetailPage() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, showLoading, hideLoading] = useMinLoading(true);

    useEffect(() => {
        const initLoad = async () => {
            if (!slug) return;
            try {
                showLoading();
                await fetchPostBySlug(slug);
            } finally {
                hideLoading();
            }
        };
        initLoad();
    }, [slug]);

    const fetchPostBySlug = async (slug) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/wiki/posts/${slug}`);
            setPost(response.data);
        } catch (error) {
            console.error('Error fetching wiki data:', error);
        }
    }

    if (loading) {
        return (
            <div className="page-loading" role="status" aria-live="polite" aria-label="Loading content">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <PageAnimation>
            <div className="wiki-detail">
                <Link to="/wiki">
                    <button className='back-button'>{'< BACK'}</button>
                </Link>
                {post ? (
                    <div className="wiki-detail-article">
                        <div className="wiki-detail-main-content">
                            {post.image && (
                                <img
                                src={`${post.image}`}
                                alt={post.title} 
                                className="wiki-detail-image"
                                />
                            )}
                            <h2 className="wiki-detail-title">{post.title}</h2>
                            <div
                                className="wiki-detail-content"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                            />
                        </div>
                        <div className="wiki-detail-meta">
                            <span>Last Updated: {new Date(post.updated_at).toLocaleDateString()}</span>
                        </div>
                        </div>
                ) : null}
            </div>
        </PageAnimation>
    );
}

export default WikiDetailPage;
