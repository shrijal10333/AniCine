import { io } from 'socket.io-client';

export const getBackendUrl = () => {
    const customUrl = localStorage.getItem('anicine_backend_url');
    if (customUrl && customUrl.trim()) return customUrl.trim().replace(/\/+$/, '');
    
    const envUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
    if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/+$/, '');
    
    // In local development or fullstack container, window.location.origin is fine
    if (typeof window !== 'undefined') {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocal) return '';
    }
    return '';
};

export const setCustomBackendUrl = (url) => {
    if (!url || !url.trim()) {
        localStorage.removeItem('anicine_backend_url');
    } else {
        localStorage.setItem('anicine_backend_url', url.trim().replace(/\/+$/, ''));
    }
    window.dispatchEvent(new CustomEvent('anicine_backend_changed', { detail: url }));
};

/**
 * Creates a smart Socket.io client with automatic fallback
 */
export const createSmartSocket = (options = {}) => {
    const backendUrl = getBackendUrl();
    try {
        return io(backendUrl || undefined, {
            timeout: 6000,
            reconnectionAttempts: 4,
            reconnectionDelay: 2000,
            transports: ['websocket', 'polling'],
            ...options
        });
    } catch (e) {
        console.warn('Socket initialization fallback:', e);
        return null;
    }
};

/**
 * BroadcastChannel Fallback for cross-tab local synchronization when no backend server is available (e.g. static Vercel)
 */
export class PartyChannelFallback {
    constructor(roomCode, username) {
        this.roomCode = (roomCode || 'DEFAULT').toUpperCase();
        this.username = username || 'Guest';
        this.channelName = `anicine_party_${this.roomCode}`;
        this.listeners = {};
        
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                this.bc = new BroadcastChannel(this.channelName);
                this.bc.onmessage = (event) => {
                    const { eventName, data } = event.data || {};
                    if (eventName && this.listeners[eventName]) {
                        this.listeners[eventName].forEach(fn => fn(data));
                    }
                };
            }
        } catch (e) {
            console.warn('BroadcastChannel not supported:', e);
        }
    }

    on(eventName, callback) {
        if (!this.listeners[eventName]) this.listeners[eventName] = [];
        this.listeners[eventName].push(callback);
    }

    emit(eventName, data) {
        if (this.bc) {
            try {
                this.bc.postMessage({ eventName, data });
            } catch (e) {}
        }
        // Also trigger local listener for self if relevant
        if (eventName === 'receive_message' && this.listeners['receive_message']) {
            // this.listeners['receive_message'].forEach(fn => fn(data));
        }
    }

    close() {
        if (this.bc) {
            try {
                this.bc.close();
            } catch (e) {}
        }
    }
}
