import { createContext, useState, useEffect, useContext } from 'react';
import { getBackendUrl } from '../utils/backend';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from local storage on startup
        const storedUser = localStorage.getItem('anicine_user') || localStorage.getItem('sxr_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                // ignore
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const baseUrl = getBackendUrl();
            const res = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            setUser(data.user);
            localStorage.setItem('anicine_user', JSON.stringify(data.user));
            localStorage.setItem('anicine_token', data.token);
            return data.user;
        } catch (error) {
            // Local guest fallback if backend is unreachable
            if (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('Failed to fetch')) {
                const guestUser = { id: 'local_' + Date.now(), name: email.split('@')[0] || 'User', email };
                setUser(guestUser);
                localStorage.setItem('anicine_user', JSON.stringify(guestUser));
                return guestUser;
            }
            throw error;
        }
    };

    const signup = async (name, email, password) => {
        try {
            const baseUrl = getBackendUrl();
            const res = await fetch(`${baseUrl}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            setUser(data.user);
            localStorage.setItem('anicine_user', JSON.stringify(data.user));
            localStorage.setItem('anicine_token', data.token);
            return data.user;
        } catch (error) {
            if (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('Failed to fetch')) {
                const guestUser = { id: 'local_' + Date.now(), name: name || 'User', email };
                setUser(guestUser);
                localStorage.setItem('anicine_user', JSON.stringify(guestUser));
                return guestUser;
            }
            throw error;
        }
    };

    const updateProfile = async (updates) => {
        try {
            const token = localStorage.getItem('anicine_token') || localStorage.getItem('sxr_token');
            const baseUrl = getBackendUrl();
            const res = await fetch(`${baseUrl}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Update failed');
            }

            setUser(data.user);
            localStorage.setItem('anicine_user', JSON.stringify(data.user));
            return data.user;
        } catch (error) {
            const updated = { ...(user || {}), ...updates };
            setUser(updated);
            localStorage.setItem('anicine_user', JSON.stringify(updated));
            return updated;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('anicine_user');
        localStorage.removeItem('anicine_token');
        localStorage.removeItem('sxr_user');
        localStorage.removeItem('sxr_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
