import React, { useState } from 'react';
import ChapterAdmin from '../../components/ChapterAdmin/ChapterAdmin.js';
import WikiAdmin from '../../components/WikiAdmin/WikiAdmin.js';
import UserAdmin from '../../components/UserAdmin/UserAdmin.js';
import PageAdmin from '../../components/PageAdmin/PageAdmin.js';
import './Admin.css';

const Admin = () => {
    const [view, setView] = useState('wiki');
    const [selectedChapter, setSelectedChapter] = useState(null);

    return (
        <div className="admin-container">
            <div className="toggle-buttons">
                <button onClick={() => setView('chapters')} className={view === 'chapters' ? 'active' : ''}>CHAPTERS</button>
                <button onClick={() => setView('wiki')} className={view === 'wiki' ? 'active' : ''}>WIKI</button>
                <button onClick={() => setView('users')} className={view === 'users' ? 'active' : ''}>USERS</button>
            </div>

            <div className="section-content">
                {view === 'chapters' && <ChapterAdmin setView={setView} setSelectedChapter={setSelectedChapter}/>}
                {view === 'wiki' && <WikiAdmin />}
                {view === 'users' && <UserAdmin />}
                {view === 'pages' && <PageAdmin selectedChapter={selectedChapter}/>}
            </div>
        </div>
    );
};

export default Admin;