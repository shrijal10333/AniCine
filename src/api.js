import { getBackendUrl } from './utils/backend';

export const IMG_URL = 'https://image.tmdb.org/t/p/';

export const getImageUrl = (path, size = 'w500') => {
    if (!path) return 'https://placehold.co/300x450/121217/8B5CF6?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${IMG_URL}${size}${path}`;
};

/**
 * Universal backend proxy fetcher for TMDB and Media Catalog
 * Keeps all API keys server-side
 */
export const fetchApi = async (path, params = {}) => {
    const backendUrl = getBackendUrl();
    
    // Normalize path to backend proxy endpoints
    let endpoint = path;
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.set(key, params[key]);
        }
    });

    if (path.startsWith('/trending/all/')) {
        const timeWindow = path.split('/').pop() || 'day';
        endpoint = `/api/tmdb/trending?time_window=${timeWindow}`;
    } else if (path.startsWith('/discover/tv') && params.with_genres?.includes('16')) {
        endpoint = `/api/tmdb/anime/trending?${queryParams.toString()}`;
    } else if (path.startsWith('/movie/')) {
        const sub = path.replace('/movie/', '');
        if (['popular', 'top_rated', 'upcoming'].includes(sub)) {
            endpoint = `/api/tmdb/movies?category=${sub}&${queryParams.toString()}`;
        } else {
            endpoint = `/api/tmdb/details/movie/${sub}?${queryParams.toString()}`;
        }
    } else if (path.startsWith('/tv/')) {
        const sub = path.replace('/tv/', '');
        if (['popular', 'top_rated'].includes(sub)) {
            endpoint = `/api/tmdb/tv?category=${sub}&${queryParams.toString()}`;
        } else {
            endpoint = `/api/tmdb/details/tv/${sub}?${queryParams.toString()}`;
        }
    } else if (path.startsWith('/search/')) {
        const q = params.query || params.q || '';
        endpoint = `/api/tmdb/search?q=${encodeURIComponent(q)}&${queryParams.toString()}`;
    } else if (path.startsWith('/genre/')) {
        endpoint = `/api/tmdb/genres`;
    } else if (!path.startsWith('/api/')) {
        endpoint = `/api/tmdb/discover?${queryParams.toString()}`;
    }

    try {
        const separator = endpoint.includes('?') ? '&' : '?';
        const url = `${backendUrl}${endpoint}`;
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`Backend fetch failed with ${res.status} for ${endpoint}`);
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
};

export const fetchTrending = async (timeWindow = 'day') => {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/tmdb/trending?time_window=${timeWindow}`);
    return res.ok ? await res.json() : null;
};

export const fetchAnimeTrending = async (page = 1) => {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/tmdb/anime/trending?page=${page}`);
    return res.ok ? await res.json() : null;
};

export const fetchAnimeTopRated = async (page = 1) => {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/tmdb/anime/top-rated?page=${page}`);
    return res.ok ? await res.json() : null;
};

export const fetchMovies = async (category = 'popular', page = 1) => {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/tmdb/movies?category=${category}&page=${page}`);
    return res.ok ? await res.json() : null;
};

export const fetchTVShows = async (category = 'popular', page = 1) => {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/tmdb/tv?category=${category}&page=${page}`);
    return res.ok ? await res.json() : null;
};

export const fetchDetails = async (type, id) => {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/tmdb/details/${type}/${id}`);
    return res.ok ? await res.json() : null;
};

export const fetchSeasonEpisodes = async (id, seasonNumber = 1) => {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/tmdb/season/${id}/${seasonNumber}`);
    return res.ok ? await res.json() : null;
};

export const fetchAvailability = async (type, id, title = '', originalLang = 'ja') => {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/availability/${type}/${id}?title=${encodeURIComponent(title)}&original_lang=${originalLang}`);
    return res.ok ? await res.json() : null;
};

export const fetchCompatibleProviders = async (contentId, audioLang = 'ja') => {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/availability/compatible?contentId=${contentId}&audioLang=${audioLang}`);
    return res.ok ? await res.json() : null;
};

export const verifyStreamHealth = async (providerId, streamUrl) => {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/availability/verify-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, streamUrl })
    });
    return res.ok ? await res.json() : null;
};

export const runSystemTestSuite = async () => {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/tests/run`);
    return res.ok ? await res.json() : null;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let jikanQueue = Promise.resolve();

export const fetchManga = async (path, params = {}, retryCount = 0) => {
    return jikanQueue = jikanQueue.then(async () => {
        const url = new URL(`https://api.jikan.moe/v4${path}`);
        Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));

        try {
            const res = await fetch(url.toString());
            await delay(600);

            if (res.status === 429 && retryCount < 3) {
                await delay(2000 * (retryCount + 1)); 
                return fetchManga(path, params, retryCount + 1);
            }

            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Manga API Error:', error);
            return null;
        }
    });
};

export const fetchYouTube = async (query) => {
    const backendUrl = getBackendUrl();
    try {
        const res = await fetch(`${backendUrl}/api/youtube?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        return data || [];
    } catch (error) {
        console.error('YouTube Fetch Error:', error);
        return [];
    }
};
