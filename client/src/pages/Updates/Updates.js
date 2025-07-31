import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './Updates.css';
import PageAnimation from '../../components/PageAnimation/PageAnimation.js';

const Updates = () => {
    const [updates, setUpdates] = useState([]);

    useEffect (() => {
        fetchUpdates();
    }, []);

    const fetchUpdates = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/updates');
            console.log('API raw response:', response);
            console.log('API response data:', response.data);
            setUpdates(response.data);
        } catch (error) {
            console.error('Error fetching updates:', error);
        }
    }

    return (
        <PageAnimation>
            <div className='updates'>
                <h1>Updates</h1>
                <div className="updates-list">
                    {updates.map((update) => (
                        <div key={update.id} className="update-item">
                            <h2>{update.title}</h2>
                            <p>{update.content}</p>
                            <p>{update.updated_at}</p>
                        </div>
                    ))}
                </div>
            </div>
        </PageAnimation>
    );
};

export default Updates;