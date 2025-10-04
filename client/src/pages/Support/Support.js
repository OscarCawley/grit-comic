import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import PageAnimation from '../../components/PageAnimation/PageAnimation';
import { UserContext } from '../../context/UserContext';
import './Support.css';

const Support = () => {
    const [faqs, setFaqs] = useState([]);
    const [message, setMessage] = useState('');
    const [submitStatus, setSubmitStatus] = useState(null);
    const { user } = useContext(UserContext);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/support/faq`);
            setFaqs(response.data);
        } catch (error) {
            console.error('Error fetching FAQ:', error);
        }
    };

    const handleSubmit = async () => {
        if (!user?.username || !user?.email) {
            console.error(user?.username, user?.email);
            setSubmitStatus({ type: 'error', text: 'You need to be logged in with a valid email to submit a support request.' });
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/support/submit`, {
                username: user.username,
                email: user.email,
                message,
            });
            setSubmitStatus({ type: 'success', text: 'Support request sent. We\'ll be in touch soon.' });
            setMessage('');
        } catch (error) {
            console.error('Error submitting support request:', error);
            const errorMessage = error.response?.data?.message ?? 'Error submitting support request. Please try again later.';
            setSubmitStatus({ type: 'error', text: errorMessage });
        }
    };

    return (
        <PageAnimation>
            <div className='support'>
                <h1>Support</h1>
                <p>If you have any questions or need assistance, please fill out the form below:</p>
                <form
                    className='support-form'
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <textarea
                        className='support-textarea'
                        name='message'
                        placeholder={!user ? 'Log in to submit a support request.' : 'Describe your issue or question here...'}
                        required
                        rows={10}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={!user}
                        maxLength={2000}
                    ></textarea>
                    <button type='submit' className='support-submit-button' disabled={!message.trim() || !user}>
                        Submit
                    </button>
                    {submitStatus && (
                        <p className={`support-form-status support-form-status-${submitStatus.type}`}>
                            {submitStatus.text}
                        </p>
                    )}
                </form>
            </div>
            <div className='faq'>
                <h1>FAQ</h1>
                <div className='faq-list'>
                    {faqs.map((faq) => (
                        <div key={faq.id} className='faq-item'>
                            <h2 className='faq-item-question'>{faq.question}</h2>
                            <div
                                className='faq-item-answer'
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.answer) }}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
        </PageAnimation>
    );
};

export default Support;
