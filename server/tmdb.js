// Server-side TMDB API integration with caching and resilience

const TMDB_BASE = 'https://api.tmdb.org/3';
const TMDB_KEY = process.env.TMDB_API_KEY || '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_BEARER = process.env.TMDB_BEARER_TOKEN || '';

// In-memory cache with 5-minute TTL
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function tmdbFetch(endpoint, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (!TMDB_BEARER && TMDB_KEY) {
        queryParams.set('api_key', TMDB_KEY);
    }
    
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
            queryParams.set(k, v);
        }
    });

    const cacheKey = `${endpoint}?${queryParams.toString()}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }

    const url = `${TMDB_BASE}${endpoint}?${queryParams.toString()}`;
    const headers = {
        'Accept': 'application/json',
        'User-Agent': 'AniCine/2.0'
    };

    if (TMDB_BEARER) {
        headers['Authorization'] = `Bearer ${TMDB_BEARER}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            console.warn(`TMDB request to ${endpoint} responded with status: ${response.status}`);
            if (cached) return cached.data; // Serve stale cache if available
            return null;
        }

        const data = await response.json();
        cache.set(cacheKey, { timestamp: Date.now(), data });
        return data;
    } catch (err) {
        console.error(`TMDB fetch error for ${endpoint}:`, err.message);
        if (cached) return cached.data;
        return null;
    }
}

// Curated backup highlights for Anime & Movies in case of network isolation or strict proxy
export const CURATED_ANIME = [
    {
        id: 85937,
        title: 'Demon Slayer: Kimetsu no Yaiba',
        original_title: '鬼滅の刃',
        overview: 'It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon.',
        poster_path: '/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
        backdrop_path: '/nTvM4mhqZlHIvUkIvdUdUR6kSp7.jpg',
        vote_average: 8.7,
        first_air_date: '2019-04-06',
        genre_ids: [16, 10759, 10765],
        media_type: 'tv',
        original_language: 'ja',
        verifiedAudio: ['ja', 'en'], // Japanese & English Dub. NO Hindi Dub.
        verifiedSubtitles: ['en', 'hi', 'es', 'ja'], // Hindi subtitle exists!
    },
    {
        id: 1429,
        title: 'Attack on Titan',
        original_title: '進撃の巨人',
        overview: 'Several hundred years ago, humans were nearly exterminated by Titans. Titans are typically several stories tall, seem to have no intelligence, devour human beings and, worst of all, seem to do it for the pleasure rather than as a food source.',
        poster_path: '/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
        backdrop_path: '/7i6EbFl6KnFlsrGsqwwhUoxnKZZ.jpg',
        vote_average: 8.6,
        first_air_date: '2013-04-07',
        genre_ids: [16, 10759, 10765],
        media_type: 'tv',
        original_language: 'ja',
        verifiedAudio: ['ja', 'en'],
        verifiedSubtitles: ['en', 'hi', 'fr', 'ja'],
    },
    {
        id: 95479,
        title: 'Jujutsu Kaisen',
        original_title: '呪術廻戦',
        overview: 'Yuji Itadori is a boy with tremendous physical strength, though he lives a completely ordinary high school life. One day, to save a classmate who has been attacked by curses, he eats the finger of Ryomen Sukuna, taking the curse into his own soul.',
        poster_path: '/hFWqu9y4ga7wSycx4JzPqG627iW.jpg',
        backdrop_path: '/gmECkdDc7941Ywz4u56zP1z7u2k.jpg',
        vote_average: 8.6,
        first_air_date: '2020-10-03',
        genre_ids: [16, 10759, 10765],
        media_type: 'tv',
        original_language: 'ja',
        verifiedAudio: ['ja', 'en'],
        verifiedSubtitles: ['en', 'hi', 'de', 'ja'],
    },
    {
        id: 37854,
        title: 'One Piece',
        original_title: 'ONE PIECE',
        overview: 'Years ago, the fearsome Pirate King, Gol D. Roger was executed leaving behind a huge cache of riches and the famous legendary treasure known as "One Piece".',
        poster_path: '/cMD9Ygz11yjJnz3BpwhMyZgcXF1.jpg',
        backdrop_path: '/4woSOUD0equAYzvwhWBHIJDCM88.jpg',
        vote_average: 8.7,
        first_air_date: '1999-10-20',
        genre_ids: [16, 10759, 35],
        media_type: 'tv',
        original_language: 'ja',
        verifiedAudio: ['ja', 'en'],
        verifiedSubtitles: ['en', 'hi', 'ja'],
    },
    {
        id: 129,
        title: 'Spirited Away',
        original_title: '千と千尋の神隠し',
        overview: 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.',
        poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
        backdrop_path: '/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
        vote_average: 8.5,
        release_date: '2001-07-20',
        genre_ids: [16, 10751, 14],
        media_type: 'movie',
        original_language: 'ja',
        verifiedAudio: ['ja', 'en', 'fr'],
        verifiedSubtitles: ['en', 'hi', 'es', 'ja'],
    },
    {
        id: 157336,
        title: 'Interstellar',
        original_title: 'Interstellar',
        overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
        poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
        vote_average: 8.4,
        release_date: '2014-11-05',
        genre_ids: [12, 18, 878],
        media_type: 'movie',
        original_language: 'en',
        verifiedAudio: ['en', 'hi', 'es'], // Movie with verified Hindi Dub!
        verifiedSubtitles: ['en', 'hi', 'es'],
    }
];
