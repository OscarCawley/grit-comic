import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chapters.css';
import chapters, { storyDescription, updateStoryDescription } from '../../data.js';
import volumeCover from '../../assets/volume-cover.png';

const Chapters = () => {
    const [description, setDescription] = useState(storyDescription);
    const [isEditable, setIsEditable] = useState(false);
    const navigate = useNavigate();

    const isAuthorized = true;

    const handleEditClick = () => {
        setIsEditable(!isEditable);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
        updateStoryDescription(e.target.value); // change when database is implemented
    }

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
                    <button onClick={handleEditClick}>
                        {isEditable ? 'Save' : 'Edit'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Chapters;