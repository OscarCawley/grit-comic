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
    };
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
        <UserContext.Provider value={{ user, setUser, signOut }}>
            {children}
        </UserContext.Provider>
    );
};
