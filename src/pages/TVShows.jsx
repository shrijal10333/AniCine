import { useEffect, useState } from 'react';
import { fetchApi } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';

export default function TVShows() {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [sort, setSort] = useState('popularity.desc');
    const [language, setLanguage] = useState('');

    const POPULAR_LANGUAGES = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'es', name: 'Spanish' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'ru', name: 'Russian' },
    ];

    useEffect(() => {
        fetchApi('/genre/tv/list').then(data => {
            if (data && data.genres) setGenres(data.genres);
        });
    }, []);

    const fetchTV = async (pageNum, reset = false) => {
        setLoading(true);
        const params = {
            sort_by: sort,
            page: pageNum,
        };
        if (selectedGenre) params.with_genres = selectedGenre;
        if (language) params.with_original_language = language;

        const data = await fetchApi('/discover/tv', params);
        if (data && data.results) {
            if (reset || pageNum === 1) setItems(data.results);
            else setItems(prev => [...prev, ...data.results]);
        }
        setLoading(false);
    };

    useEffect(() => {
        setPage(1);
        fetchTV(1, true);
    }, [selectedGenre, sort, language]);

    useEffect(() => {
        if (page > 1) fetchTV(page);
    }, [page]);

    return (
        <div className="min-h-screen bg-[#080808] pt-8 pb-40 px-6 md:px-12 lg:px-20 overflow-hidden">
            <div className="max-w-[1920px] mx-auto relative z-10 space-y-16">

                {/* Horizontal Top Filters */}
                <div className="bg-[#121212]/80 backdrop-blur-3xl border border-white/5 rounded-xl md:rounded-[2.5rem] p-4 md:p-8 shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center gap-6 md:gap-12 animate-entrance" style={{ animationDelay: '100ms' }}>
                    <div className="flex flex-col md:flex-row items-center gap-8 w-full lg:w-auto">
                        <div className="w-full md:w-64">
                            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 ml-1 mb-2 block">Sort By</label>
                            <select 
                                className="w-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white rounded-2xl p-4 outline-none focus:border-[#ff4d4d]/40 transition-all cursor-pointer"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="popularity.desc">Most Popular</option>
                                <option value="vote_average.desc">Top Rated</option>
                                <option value="first_air_date.desc">New Releases</option>
                            </select>
                        </div>

                        <div className="w-full md:w-64">
                            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 ml-1 mb-2 block">Language</label>
                            <select 
                                className="w-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white rounded-2xl p-4 outline-none focus:border-[#ff4d4d]/40 transition-all cursor-pointer"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="">All Regions</option>
                                {POPULAR_LANGUAGES.map(lang => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="h-[1px] lg:h-12 w-full lg:w-[1px] bg-white/10"></div>

                    <div className="flex-1 w-full overflow-hidden">
                        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 ml-1 mb-2 block">Filter by Genre</label>
                        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
                            <button 
                                onClick={() => setSelectedGenre('')}
                                className={`whitespace-nowrap px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 snap-start ${!selectedGenre ? 'bg-[#ff4d4d] text-white shadow-[0_10px_20px_rgba(255,77,77,0.2)]' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                            >
                                All TV Shows
                            </button>
                            {genres.map(g => (
                                <button 
                                    key={g.id}
                                    onClick={() => setSelectedGenre(g.id)}
                                    className={`whitespace-nowrap px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 snap-start ${selectedGenre == g.id ? 'bg-[#ff4d4d] text-white shadow-[0_10px_20px_rgba(255,77,77,0.2)]' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 gap-y-16 animate-entrance" style={{ animationDelay: '200ms' }}>
                    {items.map((item, idx) => (
                        <div key={`${item.id}-${idx}`}>
                            <MovieCard item={item} type="tv" />
                        </div>
                    ))}
                    {loading && Array.from({ length: 15 }).map((_, i) => <MovieSkeleton key={i} />)}
                </div>

                <div className="flex justify-center pt-20">
                    <button 
                        onClick={() => setPage(p => p + 1)}
                        disabled={loading}
                        className="group relative px-16 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden transition-all hover:bg-white/10 active:scale-95 disabled:opacity-20 shadow-2xl flex items-center justify-center gap-4"
                    >
                        <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.3em]">
                            {loading ? 'Decrypting Files...' : 'Load More Series'}
                        </span>
                        <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#1db954] group-hover:w-full transition-all duration-700"></div>
                    </button>
                </div>
            </div>
        </div>
    );
}
