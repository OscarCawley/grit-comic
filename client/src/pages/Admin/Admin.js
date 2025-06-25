import React, { useState } from 'react';
import UserList from '../../components/UserList/UserList.js';
import WikiList from '../../components/WikiList/WikiList.js';
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
                {view === 'wiki' && <WikiList />}
                {view === 'users' && <UserList />}
            </div>
        </div>
    );
};

export default Admin;