import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './VerifyEmailPage.css';
import useMinLoading from '../../hooks/useMinLoading';

const VerifyEmailPage = () => {
	const [status, setStatus] = useState('VERIFYING…');
	const [loading, showLoading, hideLoading] = useMinLoading(true);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('token');

		if (!token) {
			setStatus('MISSING VERIFICATION TOKEN.');
			hideLoading();
			return;
		}

		showLoading();
		axios.get(`${process.env.REACT_APP_API_URL}/api/users/verify-email?token=${token}`)
			.then(() => setStatus('YOUR EMAIL HAS NOW BEEN VERIFIED! YOU CAN NOW LOG IN.'))
			.catch((err) => {
				setStatus(err.response?.data?.message || 'UNABLE TO VERIFY EMAIL.');
			})
			.finally(() => hideLoading());
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
					<Link to="/login"><button className="verify-email-button">Go to Login</button></Link>
				</>
			)}
		</div>
	);
};

export default VerifyEmailPage;