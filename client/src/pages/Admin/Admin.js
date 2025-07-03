import React, { useState } from 'react';
import ChapterAdmin from '../../components/ChapterAdmin/ChapterAdmin.js';
import WikiAdmin from '../../components/WikiAdmin/WikiAdmin.js';
import UserAdmin from '../../components/UserAdmin/UserAdmin.js';
import './Admin.css';

const Admin = () => {
    const [view, setView] = useState('wiki');

    return (
        <div className="admin-container">
            <div className="toggle-buttons">
                <button onClick={() => setView('chapters')} className={view === 'chapters' ? 'active' : ''}>CHAPTERS</button>
                <button onClick={() => setView('wiki')} className={view === 'wiki' ? 'active' : ''}>WIKI</button>
                <button onClick={() => setView('users')} className={view === 'users' ? 'active' : ''}>USERS</button>
            </div>

            <div className="section-content">
                {view === 'chapters' && <ChapterAdmin />}
                {view === 'wiki' && <WikiAdmin />}
                {view === 'users' && <UserAdmin />}
            </div>
        </div>
    );
};

export default Admin;