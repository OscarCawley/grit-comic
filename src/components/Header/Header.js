import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../../firebase'; // Ensure db is imported
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Firestore functions
import './Header.css';


const Header = () => {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                const fetchUsername = async () => {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        setUsername(userDoc.data().username); // Set the username
                    }
                };

                fetchUsername(); // Call the async function
            } else {
                setUser(null);
                setUsername(''); // Clear the username when logged out
            }
        });

        return () => unsubscribe(); // Cleanup the listener on unmount
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            alert('Signed out successfully!');
        } catch (err) {
            console.error('Error signing out:', err.message);
        }
    };

    return (
        <div className='header'>
            <Link to='/' className='header-title-link'><h1>GRIT COMIC</h1></Link>
            <div className='account-container'>
            {user ? (
                    <div className="user-info">
                        <span>{username}</span>
                        <button onClick={handleSignOut}>SIGN OUT</button>
                    </div>
                ) : (
                    <Link to="/login"><button>LOGIN</button></Link>
                )}
            </div>
            
        </div>
    );
};

export default Header;