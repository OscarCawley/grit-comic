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
    const token = localStorage.getItem('token');

    useEffect (() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
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
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

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
        </div>
    );
};

export default UserAdmin;