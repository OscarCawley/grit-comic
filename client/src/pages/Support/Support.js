import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import './Support.css';

const Support = () => {
    const [faq, setFaq] = useState([]);

    useEffect (() => {
        fetchFaq();
    }, []);

    const fetchFaq = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/faq');
            setFaq(response.data);
        } catch (error) {
            console.error('Error fetching FAQ:', error);
        }
    }

    return (
        <div>
            <h1>Support</h1>
            <div className="faq-list">
                {faq.map((item) => (
                    <div key={item.id} className="faq-item">
                        <h2 className='faq-item-question'>{item.question}</h2>
                        <div className='faq-item-answer' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.answer) }}></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Support;