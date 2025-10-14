import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const UserContext = createContext(null);

export const normalizeUser = (decodedUser) => {
    if (!decodedUser) {
        return null;
    }

    return {
        id: decodedUser.userId ?? decodedUser.id ?? null,
        username: decodedUser.username ?? null,
        email: decodedUser.email ?? null,
        subscribe: decodedUser.subscribe ?? false,
        auth: decodedUser.auth ?? false,
        owner: decodedUser.owner ?? false,
    };
};

// Utility to ensure token is valid, refresh if needed
export const ensureValidToken = async () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
            // Token expired, try to refresh
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            const data = await response.json();
            if (data.accessToken) {
                localStorage.setItem('token', data.accessToken);
                return true;
            } else {
                return false;
            }
        }
        return true;
    } catch {
        return false;
    }
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                setUser(normalizeUser(decodedUser));
            } catch (err) {
                console.error("Invalid token:", err);
                localStorage.removeItem("token");
            }
        }
    }, []);

    const signOut = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, signOut, ensureValidToken }}>
            {children}
        </UserContext.Provider>
    );
};
