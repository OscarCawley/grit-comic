import React, { useState } from 'react';
import UserList from '../../components/UserList/UserList.js';
import WikiList from '../../components/WikiList/WikiList.js';

const Admin = () => {

    const [view, setView] = useState('posts');

    return (
        <div>
            <button onClick={() => setView('wiki')}>WIKI</button>
            <button onClick={() => setView('users')}>USERS</button>

            {view === 'wiki' && <WikiList />}
            {view === 'users' && <UserList />}
        </div>
    );
};

export default Admin;