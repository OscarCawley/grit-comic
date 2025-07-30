import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AssetAdmin.css';
import TipTapEditor from '../TipTapEditor/TipTapEditor';

const AssetAdmin = () => {
    const [images, setImages] = useState([]);
    const [editedImages, setEditedImages] = useState({});

    const [textAssets, setTextAssets] = useState([]);
    const [editedTextAssets, setEditedTextAssets] = useState([]);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        const res1 = await axios.get('http://localhost:5000/api/assets/images');
        setImages(res1.data);
        const res2 = await axios.get('http://localhost:5000/api/assets/text-assets');
        setTextAssets(res2.data);
    };

    const handleFileChange = (id, file) => {
        setEditedImages(prev => ({ ...prev, [id]: file }));
    };

    const handleTextChange = (id, newContent) => {
        setEditedTextAssets(prev => ({...prev, [id]: newContent,
    }));
};

    const handleImageEdit = async (image) => {
        const file = editedImages[image.id];
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            await axios.put(`http://localhost:5000/api/assets/images/${image.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchAssets(); // Refresh the image list
        } catch (err) {
            console.error("Failed to update image:", err);
        }
    };

    const handleTextEdit = async (textAsset) => {
        const updatedContent = editedTextAssets[textAsset.id];
        if (!updatedContent) {
            alert("No changes to save.");
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/assets/text-assets/${textAsset.id}`, {
                content: updatedContent,
            });
            fetchAssets(); // Refresh the text asset list
        } catch (err) {
            console.error("Failed to update text asset:", err);
        }
    };

    return (
        <div className="asset-container">
            <h1>Asset Admin</h1>
            <div className="asset-list">
                <h2>Image Assets</h2>
                <ul className='image-list'>
                    {images.map((image) => (
                        <li key={image.id} className='image-asset'>
                            <h3>{image.name}</h3>
                            <img src={`http://localhost:5000${image.content}`} alt="" />
                            <input
                                type='file'
                                accept='image/*'
                                onChange={(e) => handleFileChange(image.id, e.target.files[0])}
                            />
                            <button className='edit-button' onClick={() => handleImageEdit(image)}>Save</button>
                        </li>
                    ))}
                </ul>
                <h2>Text Assets</h2>
                <ul className='text-list'>
                    { textAssets.map((text) => (
                        <li key={text.id} className='text-asset'>
                            <div className='text-asset-header'>
                                <h3>{text.name}</h3>
                                <button className='edit-button' onClick={() => handleTextEdit(text)}>Save</button>
                            </div>
                            <TipTapEditor
                                content={editedTextAssets[text.id] ?? text.content}
                                onChange={(newContent) => handleTextChange(text.id, newContent)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AssetAdmin;