import { useEffect, useState } from 'react';
import axios from 'axios';
import './UnsubscribePage.css';
import useMinLoading from '../../hooks/useMinLoading';

const UnsubscribePage = () => {
	const [status, setStatus] = useState('Checking…');
	const [loading, showLoading, hideLoading] = useMinLoading(true, 3000);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('token');

		if (!token) {
			setStatus('Missing unsubscribe token.');
			hideLoading();
			return;
		}

		showLoading();
		axios.get(`${process.env.REACT_APP_API_URL}/api/users/unsubscribe?token=${token}`)
			.then(() => setStatus('You are unsubscribed.'))
			.catch((err) => {
				setStatus(err.response?.data?.message || 'Unable to unsubscribe.');
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
					<a href="/">Return to Grit Comic</a>
				</>
			)}
		</div>
	);
};

export default UnsubscribePage;
