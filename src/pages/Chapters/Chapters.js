import React from 'react';
import './Chapters.css';
import chapters from '../../chaptersData.js';

const Chapters = () => {


    return (
        <div className='chapters-page'>
            <h1>Chapters</h1>
            <ul className='chapters-list'>
                {chapters.map((chapter, index) => (
                    <li key={index} className='chapter-item'>
                        <h2>{chapter.title}</h2>
                        <p>Pages: {chapter.pages.length}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Chapters;