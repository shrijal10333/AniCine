import { useState, useEffect } from 'react';

export function useWatchlist() {
    const [watchlist, setWatchlist] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('anicine_watchlist') || localStorage.getItem('sxr_watchlist');
        if (saved) {
            try {
                setWatchlist(JSON.parse(saved));
            } catch (e) {
                // ignore
            }
        }
    }, []);

    const toggleWatchlist = (item, type) => {
        let list = [...watchlist];
        const index = list.findIndex(i => i.id === item.id && i.media_type === type);

        if (index >= 0) {
            list.splice(index, 1);
        } else {
            list.push({
                id: item.id,
                media_type: type,
                title: item.title || item.name,
                poster_path: item.poster_path,
                vote_average: item.vote_average,
                release_date: item.release_date || item.first_air_date
            });
        }

        setWatchlist(list);
        localStorage.setItem('anicine_watchlist', JSON.stringify(list));
    };

    const isInWatchlist = (id, type) => {
        return watchlist.some(i => i.id === id && i.media_type === type);
    };

    return { watchlist, toggleWatchlist, isInWatchlist };
}
