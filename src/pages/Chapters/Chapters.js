import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore functions
import { db } from '../../firebase'; // Firestore instance
import './Chapters.css';
import chapters, { storyDescription, updateStoryDescription } from '../../data.js';
import volumeCover from '../../assets/volume-cover.png';

const Chapters = () => {
    const [description, setDescription] = useState('');
    const [isEditable, setIsEditable] = useState(false);
    const navigate = useNavigate();

    const isAuthorized = true;

    useEffect(() => {
        const fetchDescription = async () => {
            const docRef = doc(db, 'texts', 'storyDescription'); // Reference to Firestore document
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setDescription(docSnap.data().text); // Set the description from Firestore
            } else {
                console.error('No such document!');
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
            const docRef = doc(db, 'texts', 'storyDescription'); // Reference to Firestore document
            await updateDoc(docRef, { text: description }); // Update the text in Firestore
            setIsEditable(false);
        } catch (err) {
            console.error('Error updating document:', err);
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