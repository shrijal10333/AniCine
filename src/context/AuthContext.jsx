import { createContext, useState, useEffect, useContext } from 'react';
import { getBackendUrl } from '../utils/backend';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [watchlist, setWatchlist] = useState([]);
    const [history, setHistory] = useState([]);
    const [preferences, setPreferences] = useState({
        preferredAudio: 'ja',
        preferredSubtitle: 'en',
        autoplayNext: true,
        qualityPreference: 'auto'
    });

    const getAuthHeader = () => {
        const token = localStorage.getItem('anicine_token') || localStorage.getItem('sxr_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    // Load user and sync data on initial mount
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('anicine_user') || localStorage.getItem('sxr_user');
            const storedToken = localStorage.getItem('anicine_token') || localStorage.getItem('sxr_token');
            
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    setUser(parsed);
                } catch (e) {}
            }

            // Sync with backend if token present
            if (storedToken) {
                try {
                    const baseUrl = getBackendUrl();
                    const res = await fetch(`${baseUrl}/api/auth/me`, {
                        headers: { 'Authorization': `Bearer ${storedToken}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data.user);
                        localStorage.setItem('anicine_user', JSON.stringify(data.user));
                    }
                } catch (e) {}
            }

            // Load watchlist & history from localStorage
            try {
                const storedWatchlist = localStorage.getItem('anicine_watchlist');
                if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));
                const storedHistory = localStorage.getItem('anicine_history');
                if (storedHistory) setHistory(JSON.parse(storedHistory));
                const storedPref = localStorage.getItem('anicine_preferences');
                if (storedPref) setPreferences(prev => ({ ...prev, ...JSON.parse(storedPref) }));
            } catch (e) {}

            setLoading(false);
        };

        initAuth();
    }, []);

    // Fetch user-specific watchlist & history from backend when user logs in
    useEffect(() => {
        if (!user || !user.id) return;
        const fetchUserData = async () => {
            const baseUrl = getBackendUrl();
            const headers = getAuthHeader();
            if (!headers.Authorization) return;

            try {
                const [wlRes, histRes] = await Promise.all([
                    fetch(`${baseUrl}/api/user/watchlist`, { headers }),
                    fetch(`${baseUrl}/api/user/history`, { headers })
                ]);
                if (wlRes.ok) {
                    const wlData = await wlRes.json();
                    if (Array.isArray(wlData) && wlData.length > 0) {
                        setWatchlist(wlData);
                        localStorage.setItem('anicine_watchlist', JSON.stringify(wlData));
                    }
                }
                if (histRes.ok) {
                    const histData = await histRes.json();
                    if (Array.isArray(histData) && histData.length > 0) {
                        setHistory(histData);
                        localStorage.setItem('anicine_history', JSON.stringify(histData));
                    }
                }
            } catch (e) {}
        };
        fetchUserData();
    }, [user?.id]);

    const login = async (email, password) => {
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
    };

    const signup = async (name, email, password) => {
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
    };

    const updateProfile = async (updates) => {
        const baseUrl = getBackendUrl();
        const token = localStorage.getItem('anicine_token');
        if (token) {
            try {
                const res = await fetch(`${baseUrl}/api/auth/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updates)
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    localStorage.setItem('anicine_user', JSON.stringify(data.user));
                    return data.user;
                }
            } catch (e) {}
        }

        const updated = { ...(user || {}), ...updates };
        setUser(updated);
        localStorage.setItem('anicine_user', JSON.stringify(updated));
        return updated;
    };

    const addToWatchlist = async (item) => {
        if (!item || !item.id) return;
        const exists = watchlist.some(w => w.id === item.id);
        if (exists) return;

        const updated = [{ ...item, addedAt: new Date().toISOString() }, ...watchlist];
        setWatchlist(updated);
        localStorage.setItem('anicine_watchlist', JSON.stringify(updated));

        const baseUrl = getBackendUrl();
        const headers = getAuthHeader();
        if (headers.Authorization) {
            try {
                await fetch(`${baseUrl}/api/user/watchlist`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...headers },
                    body: JSON.stringify(item)
                });
            } catch (e) {}
        }
    };

    const removeFromWatchlist = async (id) => {
        const updated = watchlist.filter(w => w.id.toString() !== id.toString());
        setWatchlist(updated);
        localStorage.setItem('anicine_watchlist', JSON.stringify(updated));

        const baseUrl = getBackendUrl();
        const headers = getAuthHeader();
        if (headers.Authorization) {
            try {
                await fetch(`${baseUrl}/api/user/watchlist/${id}`, {
                    method: 'DELETE',
                    headers
                });
            } catch (e) {}
        }
    };

    const isInWatchlist = (id) => {
        if (!id) return false;
        return watchlist.some(w => w.id.toString() === id.toString());
    };

    const saveWatchProgress = async (progressData) => {
        const { id, title, type, poster_path, currentTime, duration, season, episode } = progressData;
        if (!id) return;

        const progressPercent = duration ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
        const entry = {
            id,
            title,
            type: type || 'movie',
            poster_path,
            currentTime: Math.floor(currentTime),
            duration: Math.floor(duration),
            progressPercent,
            season,
            episode,
            lastWatched: new Date().toISOString()
        };

        const filtered = history.filter(h => h.id.toString() !== id.toString());
        const updated = [entry, ...filtered].slice(0, 30);
        setHistory(updated);
        localStorage.setItem('anicine_history', JSON.stringify(updated));

        const baseUrl = getBackendUrl();
        const headers = getAuthHeader();
        if (headers.Authorization) {
            try {
                await fetch(`${baseUrl}/api/user/history`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...headers },
                    body: JSON.stringify(entry)
                });
            } catch (e) {}
        }
    };

    const updatePreferences = (newPrefs) => {
        const updated = { ...preferences, ...newPrefs };
        setPreferences(updated);
        localStorage.setItem('anicine_preferences', JSON.stringify(updated));
        if (user) {
            updateProfile({ preferences: updated });
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('anicine_user');
        localStorage.removeItem('anicine_token');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAdmin: user?.role === 'admin',
            login,
            signup,
            logout,
            updateProfile,
            loading,
            watchlist,
            addToWatchlist,
            removeFromWatchlist,
            isInWatchlist,
            history,
            saveWatchProgress,
            preferences,
            updatePreferences
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
