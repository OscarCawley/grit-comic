import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './SupportAdmin.css';
import TipTapEditor from '../TipTapEditor/TipTapEditor';

const SupportAdmin = () => {

	const [faqs, setFaqs] = useState([]);
	const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({title: '', content: ''});
    const formRef = useRef(null);

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

    const handleCreate = async () => {
        const { question, answer } = formData;

        if (!question.trim() || !answer.trim()) {
            alert('Please fill out all fields before creating the FAQ.');
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/support/faq/create`, { question, answer });
            alert('FAQ created!');
            setFormData({ question: '', answer: '' });
            fetchFaqs();
        } catch (error) {
            console.error('Error creating FAQ:', error);
        }
    };

    const handleUpdate = async () => {
        const { question, answer } = formData;

        if (!question.trim() || !answer.trim()) {
            alert('Please fill out all fields before editing the FAQ.');
            return;
        }

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/support/faq/${editingId}`, { question, answer });
            alert('FAQ edited!');
            setFormData({ question: '', answer: '' });
            setEditingId(null);
            fetchFaqs();
        } catch (error) {
            console.error('Error editing FAQ:', error);
        }
    };

    const handleEdit = (faq) => {
        setEditingId(faq.id);
        setFormData({ question: faq.question, answer: faq.answer });
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/support/faq/${id}`);
                alert('FAQ deleted!');
                fetchFaqs();
            } catch (error) {
                console.error('Error deleting FAQ:', error);
            }
        }
    };

    return (
        <div className='faqs-container'>
			<h1>FAQs List</h1>
			<form className='faqs-form' onSubmit={(e) => {
				e.preventDefault();
				editingId ? handleUpdate() : handleCreate();
			}}>
				<input
					type="text"
					maxLength={120}
					placeholder="Question"
					value={formData.question}
					onChange={(e) => {
						setFormData({ ...formData, question: e.target.value })
					}}
				/>
				<TipTapEditor
					content={formData.answer}
					onChange={(html) => setFormData({ ...formData, answer: html })}
                    limit={1000} // Set a limit if needed
				/>
				<button className='submit-button' type="submit">{editingId ? 'Update' : 'Create'}</button>
			</form>
			<div className='faqs-posts'>
				<ul>
					{faqs.map(faq => (
					<li key={faq.id}>
						{faq.question}
						<span>
							<button onClick={() => handleEdit(faq)}>Edit</button>
							<button onClick={() => handleDelete(faq.id)}>Delete</button>
						</span>
					</li>))}
				</ul>
			</div>
		</div>
    );
};

export default SupportAdmin;