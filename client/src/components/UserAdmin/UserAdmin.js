import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './UserAdmin.css';

const UserAdmin = () => {

    const [users, setUsers] = useState([]);
    const token = localStorage.getItem('token');

    useEffect (() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res  => {
            setUsers(res.data);
        }).catch(err => {
            console.error(err);
        })
    }, []);

    const handleDelete = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(() => {
                setUsers(users.filter(user => user.id !== userId));
            }).catch(err => {
                console.error(err);
            });
        }
    };

    const handleAdminToggle = (userId, auth) => {
        if (window.confirm(`Are you sure you want to ${auth ? 'revoke' : 'grant'} admin rights for this user?`)) {
            axios.put(`${process.env.REACT_APP_API_URL}/api/users/${userId}/admin`, {
                auth: !auth
            }, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(() => {
                setUsers(users.map(user => user.id === userId ? { ...user, auth: !auth } : user));
            }).catch(err => {
                console.error(err);
            });
        }
    };

    return (
        <div className="user-container">
            <h1>User List</h1>
            <ul className="user-list">
                {users.map(user => (
                    <li key={user.id}>
                        <span>{user.username} ({user.email})</span>
                        <div className='admin-actions'>
                            <label className='admin-checkbox-label'>
                                Admin:
                                <input
                                    className='admin-checkbox'
                                    type="checkbox"
                                    checked={user.auth}
                                    onChange={() => handleAdminToggle(user.id, user.auth)}
                                />
                            </label>
                            <button className='delete-button' onClick={() => handleDelete(user.id)}>Delete</button>
                        </div>
                        
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserAdmin;