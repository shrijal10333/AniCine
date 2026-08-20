import { useState, useEffect, useCallback } from 'react';

export function useContinueWatching() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('anicine_history') || localStorage.getItem('sxr_history');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                // ignore
            }
        }
    }, []);

    const addToHistory = useCallback((item, type, season = 1, episode = 1) => {
        if (!item || !item.id) return;

        setHistory((prev) => {
            let list = [...prev];
            const index = list.findIndex(i => i.id === item.id && i.media_type === type);

            if (index >= 0) {
                list.splice(index, 1);
            }

            list.unshift({
                id: item.id,
                media_type: type,
                title: item.title || item.name,
                poster_path: item.poster_path,
                vote_average: item.vote_average,
                release_date: item.release_date || item.first_air_date,
                season,
                episode,
                timestamp: new Date().getTime()
            });

            if (list.length > 20) list = list.slice(0, 20);

            localStorage.setItem('anicine_history', JSON.stringify(list));
            return list;
        });
    }, []);

    const clearHistory = useCallback(() => {
        localStorage.removeItem('anicine_history');
        localStorage.removeItem('sxr_history');
        setHistory([]);
    }, []);

    const removeFromHistory = useCallback((id, type) => {
        setHistory((prev) => {
            const list = prev.filter(i => !(i.id === id && i.media_type === type));
            localStorage.setItem('anicine_history', JSON.stringify(list));
            return list;
        });
    }, []);

    return { history, addToHistory, clearHistory, removeFromHistory };
}
