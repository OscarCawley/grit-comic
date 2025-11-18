import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import axios from 'axios';
import './UnsubscribePage.css';
import useMinLoading from '../../hooks/useMinLoading';

const UnsubscribePage = () => {
	const [status, setStatus] = useState('CHECKING…');
	const [loading, showLoading, hideLoading] = useMinLoading(true, 3000);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('token');

		if (!token) {
			setStatus('MISSING UNSUBSCRIBE TOKEN.');
			hideLoading();
			return;
		}

		showLoading();
		axios.get(`${process.env.REACT_APP_API_URL}/api/users/unsubscribe?token=${token}`)
			.then(() => setStatus('YOU ARE UNSUBSCRIBED.'))
			.catch((err) => {
				setStatus(err.response?.data?.message || 'UNABLE TO SUBSCRIBE.');
			})
			.finally(() => hideLoading());
	}, []);

	return (
		<div className="unsubscribe-page">
			{loading ? (
				<div className="page-loading" role="status" aria-live="polite" aria-label="Loading content">
					<div className="spinner" />
				</div>
			) : (
				<>
					<h1>{status}</h1>
					<Link to="/"><button className="unsubscribe-button">Return to Home</button></Link>
				</>
			)}
		</div>
	);
};

export default UnsubscribePage;
