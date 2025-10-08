import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import './Updates.css';
import PageAnimation from '../../components/PageAnimation/PageAnimation.js';

const Updates = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect (() => {
        const initLoad = async () => {
            try {
                await fetchUpdates();
            } finally {
                setLoading(false);
            }
        };
        initLoad();
    }, []);

    const fetchUpdates = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/updates`);
            setUpdates(response.data);
        } catch (error) {
            console.error('Error fetching updates:', error);
        }
    }

    if (loading) {
        return (
            <PageAnimation>
                <div className="page-loading" role="status" aria-live="polite" aria-label="Loading content">
                    <div className="spinner" />
                </div>
            </PageAnimation>
        );
    }

    return (
        <PageAnimation>
            <div className='updates'>
                <h1>Updates</h1>
                <div className="updates-list">
                    {updates.map((update) => (
                        <div key={update.id} className="updates-item">
                            <h2 className='updates-item-header'>{update.title}</h2>
                            <div className='updates-item-content' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(update.content) }}></div>
                            <p className='updates-item-updated'>{update.updated_at_formatted}</p>
                        </div>
                    ))}
                </div>
            </div>
        </PageAnimation>
    );
};

export default Updates;
