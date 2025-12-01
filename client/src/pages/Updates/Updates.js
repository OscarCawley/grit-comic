import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import './Updates.css';
import PageAnimation from '../../components/PageAnimation/PageAnimation.js';
import useMinLoading from '../../hooks/useMinLoading';

const Updates = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, showLoading, hideLoading] = useMinLoading(true);

    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [updatesLoading, setUpdatesLoading] = useState(false);
    const limit = 10;

    const fetchUpdates = async (reset = false) => {
        if (updatesLoading) return;
        setUpdatesLoading(true);

        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/updates`,
                {
                    params: {
                        offset: reset ? 0 : offset,
                        limit
                    }
                }
            );

            const newUpdates = res.data.updates;

            if (reset) {
                setUpdates(newUpdates);
                setOffset(newUpdates.length);
            } else {
                setUpdates(prev => [...prev, ...newUpdates]);
                setOffset(prev => prev + newUpdates.length);
            }

            setHasMore(res.data.hasMore);

        } catch (err) {
            console.error("Failed to load updates:", err);
        } finally {
            setUpdatesLoading(false);
        }
    };

    useEffect(() => {
        const initLoad = async () => {
            try {
                showLoading();
                await fetchUpdates(true);
            } finally {
                hideLoading();
            }
        };

        initLoad();
    }, []);

    if (loading) {
        return (
            <div className="page-loading" role="status" aria-live="polite" aria-label="Loading updates">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <PageAnimation>
            <div className='updates'>
                <h1>Updates</h1>

                <div className="updates-list">
                    {updates.map(update => (
                        <div key={update.id} className="updates-item">
                            <h2 className='updates-item-header'>{update.title}</h2>
                            <div
                                className='updates-item-content'
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(update.content) }}
                            ></div>
                            <p className='updates-item-updated'>{update.updated_at_formatted}</p>
                        </div>
                    ))}

                    {!updatesLoading && hasMore && (
                        <button
                            className="load-more-button"
                            onClick={() => fetchUpdates(false)}
                        >
                            Load More...
                        </button>
                    )}
                    {updatesLoading && hasMore && (
                        <div className="small-spinner" />
                    )}
                </div>
            </div>
        </PageAnimation>
    );
};

export default Updates;