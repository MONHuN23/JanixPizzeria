import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            if (localStorage.getItem('token')) {
                const response = await api.get('/user');
                setUser(response.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/login', { email, password });
        if (response.data.status && response.data.token) {
            localStorage.setItem('token', response.data.token);
            await fetchUser();
            return true;
        }
        return false;
    };

    const register = async (name, email, password) => {
        const response = await api.post('/register', { name, email, password });
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
