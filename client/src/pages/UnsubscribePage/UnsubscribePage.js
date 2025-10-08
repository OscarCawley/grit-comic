import { useEffect, useState } from 'react';
import axios from 'axios';
import './UnsubscribePage.css';

const UnsubscribePage = () => {
  const [status, setStatus] = useState('Checking…');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('Missing unsubscribe token.');
      setLoading(false);
      return;
    }

    axios.get(`${process.env.REACT_APP_API_URL}/api/users/unsubscribe?token=${token}`)
      .then(() => setStatus('You are unsubscribed.'))
      .catch((err) => {
        setStatus(err.response?.data?.message || 'Unable to unsubscribe.');
      })
      .finally(() => setLoading(false));
  }, []);

  const [loading, setLoading] = useState(true);

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
