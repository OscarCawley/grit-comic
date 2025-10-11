import { useEffect, useState } from 'react';
import axios from 'axios';
import './VerifyEmailPage.css';

const VerifyEmailPage = () => {
	const [status, setStatus] = useState('Verifying…');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('token');

		if (!token) {
			setStatus('Missing verification token.');
			setLoading(false);
			return;
		}

		axios.get(`${process.env.REACT_APP_API_URL}/api/users/verify-email?token=${token}`)
			.then(() => setStatus('Your email is verified! You can now log in.'))
			.catch((err) => {
				setStatus(err.response?.data?.message || 'Unable to verify email.');
			})
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className="verify-email-page">
			{loading ? (
				<div className="page-loading" role="status" aria-live="polite" aria-label="Loading content">
					<div className="spinner" />
				</div>
			) : (
				<>
					<h1>{status}</h1>
					<a href="/login">Go to Login</a>
				</>
			)}
		</div>
	);
};

export default VerifyEmailPage;