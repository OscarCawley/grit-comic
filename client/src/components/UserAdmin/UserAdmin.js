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

    return (
        <div className="user-container">
            <h1>User List</h1>
            <ul className="user-list">
                {users.map(user => (
                    <li key={user.id}>
                        <span>{user.username} ({user.email})</span>
                        <button onClick={() => handleDelete(user.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserAdmin;