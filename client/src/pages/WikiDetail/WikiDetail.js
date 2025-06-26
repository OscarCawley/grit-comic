import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import './WikiDetail.css';

function WikiDetailPage() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() => {
        if (slug) {
            fetchPostBySlug(slug);
        }
    }, [slug]);

    const fetchPostBySlug = async (slug) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/wiki/posts/${slug}`);
            setPost(response.data);
        } catch (error) {
            console.error('Error fetching wiki data:', error);
        }
    }

    return (
        <div className="wiki-detail">
            {post ? (
                <div className="wiki-detail-article">
                    <div className="wiki-detail-main-content">
                        <img
                            src={`http://localhost:5000${post.image}`}
                            alt={post.title} 
                            className="wiki-detail-image"
                        />
                        <h2 className="wiki-detail-title">{post.title}</h2>
                        <div
                            className="wiki-detail-content"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                        />
                    </div>
                    <div className="wiki-detail-meta">
                        <span>Category: {post.category_name}</span>
                        <span>Last Updated: {new Date(post.updated_at).toLocaleDateString()}</span>
                    </div>
                    </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default WikiDetailPage;