import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import PageAnimation from '../../components/PageAnimation/PageAnimation';
import './Support.css';

const Support = () => {
    const [faqs, setFaqs] = useState([]);

    useEffect (() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/faq`);
            setFaqs(response.data);
        } catch (error) {
            console.error('Error fetching FAQ:', error);
        }
    }

    return (
        <PageAnimation>
            <div className='faq'>
                <h1>FAQ</h1>
                <div className="faq-list">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="faq-item">
                            <h2 className='faq-item-question'>{faq.question}</h2>
                            <div className='faq-item-answer' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.answer) }}></div>
                        </div>
                    ))}
                </div>
            </div>
        </PageAnimation>
    );
};

export default Support;