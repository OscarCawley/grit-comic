import React, { useState } from 'react';
import './Chapters.css';
import chapters, { storyDescription } from '../../data.js';
import volumeCover from '../../assets/volume-cover.png';

const Chapters = () => {
    const [description, setDescription] = useState('');

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    }


    return (
        <div className='chapters-page'>
            <div className='volume-covers'>
                <img src={volumeCover} alt="Volume Cover" />
                <img src={volumeCover} alt="Volume Cover" />
            </div>
            <ul className='chapters-list'>
                <h1>Chapters</h1>
                {chapters.map((chapter, index) => (
                    <li key={index} className='chapter-item'>
                        <h2>{chapter.title}</h2>
                        <p>Pages: {chapter.pages.length}</p>
                    </li>
                ))}
            </ul>
            <div className='description'>
                <p>{storyDescription}</p>
            </div>
        </div>
    );
};

export default Chapters;