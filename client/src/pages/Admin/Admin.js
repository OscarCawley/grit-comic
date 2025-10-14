import React, { useState } from 'react';
import ChapterAdmin from '../../components/ChapterAdmin/ChapterAdmin.js';
import PageAdmin from '../../components/PageAdmin/PageAdmin.js';
import WikiAdmin from '../../components/WikiAdmin/WikiAdmin.js';
import UpdatesAdmin from '../../components/UpdatesAdmin/UpdatesAdmin.js';
import UserAdmin from '../../components/UserAdmin/UserAdmin.js';
import AssetAdmin from '../../components/AssetAdmin/AssetAdmin.js';
import SupportAdmin from '../../components/SupportAdmin/SupportAdmin.js';
import CommentAdmin from '../../components/CommentAdmin/CommentAdmin.js';
import './Admin.css';

const Admin = () => {
    const [view, setView] = useState('chapters');
    const [selectedChapter, setSelectedChapter] = useState(null);

    return (
        <div className="admin-container">
            <div className="toggle-buttons">
                <button onClick={() => setView('chapters')} className={view === 'chapters' ? 'active' : ''}>CHAPTERS</button>
                <button onClick={() => setView('wiki')} className={view === 'wiki' ? 'active' : ''}>WIKI</button>
                <button onClick={() => setView('updates')} className={view === 'updates' ? 'active' : ''}>UPDATES</button>
                <button onClick={() => setView('users')} className={view === 'users' ? 'active' : ''}>USERS</button>
                <button onClick={() => setView('assets')} className={view === 'assets' ? 'active' : ''}>ASSETS</button>
                <button onClick={() => setView('support')} className={view === 'support' ? 'active' : ''}>SUPPORT</button>
                <button onClick={() => setView('comments')} className={view === 'comments' ? 'active' : ''}>COMMENTS</button>
                
            </div>

            <div className="section-content">
                {view === 'chapters' && <ChapterAdmin setView={setView} setSelectedChapter={setSelectedChapter}/>}
                {view === 'pages' && <PageAdmin selectedChapter={selectedChapter}/>}
                {view === 'wiki' && <WikiAdmin />}
                {view === 'updates' && <UpdatesAdmin />}
                {view === 'users' && <UserAdmin />}
                {view === 'assets' && <AssetAdmin />}
                {view === 'support' && <SupportAdmin />}
                {view === 'comments' && <CommentAdmin />}
                
            </div>
        </div>
    );
};

export default Admin;