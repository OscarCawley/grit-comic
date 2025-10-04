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
      return;
    }

    axios.get(`${process.env.REACT_APP_API_URL}/api/users/unsubscribe?token=${token}`)
      .then(() => setStatus('You are unsubscribed.'))
      .catch((err) => {
        setStatus(err.response?.data?.message || 'Unable to unsubscribe.');
      });
  }, []);

  return (
    <div className="unsubscribe-page">
      <h1>{status}</h1>
      <a href="/">Return to Grit Comic</a>
    </div>
  );
};

export default UnsubscribePage;