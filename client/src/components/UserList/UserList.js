import axios from 'axios';
import React, { useState, useEffect } from 'react';



const UserList = () => {

    const [users, setUsers] = useState([]);

    useEffect (() => {
        axios.get('http://localhost:5000/api/users').then(res  => {
            setUsers(res.data);
        }).catch(err => {
            console.error(err);
        })
    }, []);

    const handleDelete = (userId) => {
        axios.delete(`http://localhost:5000/api/users/${userId}`).then(() => {
            setUsers(users.filter(user => user.id !== userId));
        }).catch(err => {
            console.error(err);
        });
    };

    return (
        <div>{users.map(user => (
            <li key={user.id}>
                {user.username} ({user.email})
                <button onClick={(e) => handleDelete(user.id)}>Delete</button>
            </li>
            
        ))}</div>
    );
};

export default UserList;