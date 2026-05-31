import PropTypes from 'prop-types';
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('habit_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('habit_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('habit_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        // Clear ALL app data so next user starts fresh
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
