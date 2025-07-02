import React, { useState } from 'react';
import UserAdmin from '../../components/UserAdmin/UserAdmin.js';
import WikiAdmin from '../../components/WikiAdmin/WikiAdmin.js';
import './Admin.css';

const Admin = () => {
    const [view, setView] = useState('wiki');

    return (
        <div className="admin-container">
            <div className="toggle-buttons">
                <button onClick={() => setView('wiki')} className={view === 'wiki' ? 'active' : ''}>WIKI</button>
                <button onClick={() => setView('users')} className={view === 'users' ? 'active' : ''}>USERS</button>
            </div>

            <div className="section-content">
                {view === 'wiki' && <WikiAdmin />}
                {view === 'users' && <UserAdmin />}
            </div>
        </div>
    );
};

export default Admin;