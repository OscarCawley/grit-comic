import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chapters.css';
import chapters from '../../data.js';
import volumeCover from '../../assets/volume-cover.png';

const Chapters = () => {
    const [description, setDescription] = useState('');
    const [isEditable, setIsEditable] = useState(false);
    const navigate = useNavigate();

    const isAuthorized = true;

    useEffect(() => {
        const fetchDescription = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/story-description'); // Fetch from backend
                if (!response.ok) {
                    throw new Error('Failed to fetch story description');
                }
                const data = await response.json();
                setDescription(data.description); // Set the description from the backend
            } catch (err) {
                console.error('Error fetching story description:', err);
            }
        };

        fetchDescription();
    }, []);

    const handleEditClick = () => {
        setIsEditable(!isEditable);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    }

    const handleSaveClick = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/story-description', {
                method: 'PUT', // Use PUT for updating
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description }), // Send the updated description
            });

            if (!response.ok) {
                throw new Error('Failed to update story description');
            }

            setIsEditable(false);
        } catch (err) {
            console.error('Error updating story description:', err);
        }
    };

    const handleChapterClick = (index) => {
        navigate(`/?chapter=${index}`); // Navigate to Home with chapter index as a query parameter
    };


    return (
        <div className='chapters-page'>
            <div className='volume-covers'>
                <img src={volumeCover} alt="Volume Cover" />
                <img src={volumeCover} alt="Volume Cover" />
            </div>
            <ul className='chapters-list'>
                <h1>Chapters</h1>
                {chapters.map((chapter, index) => (
                    <li key={index} className='chapter-item' onClick={() => handleChapterClick(index)}>
                        <h2>{chapter.title}</h2>
                        <p>Pages: {chapter.pages.length}</p>
                    </li>
                ))}
            </ul>
            <div className='description'>
                {isEditable ? (
                    <textarea className='textbox'
                        value={description}
                        onChange={handleDescriptionChange}
                        rows="4"
                        cols="50"
                    />
                ) : (
                    <p className='textbox'>{description}</p>
                )}
                {isAuthorized && (
                    <button onClick={isEditable ? handleSaveClick : handleEditClick}>
                        {isEditable ? 'Save' : 'Edit'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Chapters;