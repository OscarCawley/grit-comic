import axios from 'axios';
import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import './UserAdmin.css';

const UserAdmin = () => {

    const { user } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [owners, setOwners] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const token = localStorage.getItem('token');

    useEffect (() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            let response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.filter(user => {
                return user.auth === 0;
            }));
            setAdmins(response.data.filter(user => {
                return user.auth === 1 && user.owner === 0;
            }));
            setOwners(response.data.filter(user => {
                return user.owner === 1;
            }));
            response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleDelete = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            axios.delete(`${process.env.REACT_APP_API_URL}/api/users/delete-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(() => {
                setUsers(users.filter(user => user.id !== userId));
            }).catch(err => {
                console.error(err);
            });
        }
    };

        const handlePendingDelete = (userId) => {
        if (window.confirm('Are you sure you want to delete this pending user?')) {
            axios.delete(`${process.env.REACT_APP_API_URL}/api/users/delete-pending-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(() => {
                setPendingUsers(pendingUsers.filter(user => user.id !== userId));
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

    function timeSince(dateString) {
        const now = new Date();
        const created = new Date(dateString);
        const seconds = Math.floor((now - created) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }

        return 'just now';
    }

    return (
        <div className="user-container">
            <h1>Users</h1>
            <ul className="user-list">
                {owners.map(ownerUser => (
                    <li key={ownerUser.id}>
                        <span>{ownerUser.username} ({ownerUser.email}) - Owner</span>
                    </li>
                ))}
                {admins.map(adminUser => (
                    <li key={adminUser.id}>
                        <span>{adminUser.username} ({adminUser.email}) - Admin</span>
                        <div className='admin-actions'>
                            {/* Only owners can toggle admin status for admins */}
                            {user?.owner === true && (
                                <>
                                    <label className='admin-checkbox-label'>
                                        Admin:
                                        <input
                                            className='admin-checkbox'
                                            type="checkbox"
                                            checked={adminUser.auth}
                                            onChange={() => handleAdminToggle(adminUser.id, adminUser.auth)}
                                        />
                                    </label>
                                    <button className='delete-button' onClick={() => handleDelete(adminUser.id)}>Delete</button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
                <hr />
                {users.map(normalUser => (
                    <li key={normalUser.id}>
                        <span>{normalUser.username} ({normalUser.email})</span>
                        <div className='admin-actions'>
                            {/* Only owners can toggle admin status for normal users */}
                            {user?.owner === true && (
                                <label className='admin-checkbox-label'>
                                    Admin:
                                    <input
                                        className='admin-checkbox'
                                        type="checkbox"
                                        checked={normalUser.auth}
                                        onChange={() => handleAdminToggle(normalUser.id, normalUser.auth)}
                                    />
                                </label>
                            )}
                            {/* Owners and admins can delete normal users */}
                            {(user?.owner === true || user?.auth === true) && (
                                <button className='delete-button' onClick={() => handleDelete(normalUser.id)}>Delete</button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            <h1>Pending Users</h1>
            <ul className='user-list'>
                {pendingUsers.map(pendingUser => (
                    <li key={pendingUser.id}>
                        <span>{pendingUser.username} ({pendingUser.email}) - ({timeSince(pendingUser.created_at)})</span>
                        <div className='admin-actions'>
                            {/* Owners and admins can delete pending users */}
                            {(user?.owner === true || user?.auth === true) && (
                                <button className='delete-button' onClick={() => handlePendingDelete(pendingUser.id)}>Delete</button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserAdmin;