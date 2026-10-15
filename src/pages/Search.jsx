import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { Search as SearchIcon, ArrowLeft, Globe, Filter, X, Zap } from 'lucide-react';

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryParam = searchParams.get('q') || '';

    const [searchInput, setSearchInput] = useState(queryParam);
    const [mediaType, setMediaType] = useState('all'); // 'all' | 'anime' | 'movie' | 'tv'
    const [audioLang, setAudioLang] = useState('all'); // 'all' | 'ja' | 'en' | 'hi'
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const debounceTimeout = useRef(null);

    // Sync input with queryParam on change
    useEffect(() => {
        if (queryParam !== searchInput) {
            setSearchInput(queryParam);
        }
    }, [queryParam]);

    // Debounced search execution
    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        if (!searchInput.trim()) {
            setItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceTimeout.current = setTimeout(async () => {
            const params = {
                q: searchInput.trim(),
                type: mediaType !== 'all' ? mediaType : undefined,
                audio_lang: audioLang !== 'all' ? audioLang : undefined
            };

            const data = await fetchApi('/api/tmdb/search', params);
            if (data && data.results) {
                // Filter out non-media items
                const valid = data.results.filter(i => i.media_type !== 'person' && (i.poster_path || i.backdrop_path));
                setItems(valid);
            } else {
                setItems([]);
            }
            setLoading(false);
        }, 350);

        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [searchInput, mediaType, audioLang]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setSearchInput(val);
        setSearchParams(val ? { q: val } : {});
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearchParams({});
        setItems([]);
    };

    return (
        <div className="min-h-screen bg-[#0B0B0E] text-textMain px-4 md:px-12 py-6 max-w-7xl mx-auto">
            {/* Search Header */}
            <div className="mb-8 space-y-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-textMuted hover:text-white"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight">
                            Global <span className="text-primary">Search & Discovery</span>
                        </h1>
                        <p className="text-xs text-textMuted">
                            Search anime, movies, series, and filter by verified audio tracks.
                        </p>
                    </div>
                </div>

                {/* Big Search Input */}
                <div className="relative">
                    <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                    <input 
                        type="text"
                        value={searchInput}
                        onChange={handleInputChange}
                        placeholder="Search Demon Slayer, Attack on Titan, Jujutsu Kaisen, Interstellar..."
                        className="w-full bg-[#121217] border border-white/10 rounded-2xl pl-12 pr-10 py-4 text-sm font-medium text-white placeholder-white/30 outline-none focus:border-primary focus:shadow-[0_0_25px_rgba(139,92,246,0.25)] transition-all"
                        autoFocus
                    />
                    {searchInput && (
                        <button 
                            onClick={clearSearch}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Filter Chips Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121217] border border-white/5 text-xs font-bold">
                        <span className="text-[10px] text-textMuted uppercase px-2 font-black">Type:</span>
                        {['all', 'anime', 'movie', 'tv'].map(t => (
                            <button
                                key={t}
                                onClick={() => setMediaType(t)}
                                className={`px-3 py-1 rounded-lg uppercase tracking-wider text-[10px] font-black transition-all ${mediaType === t ? 'bg-primary text-white shadow-md' : 'text-textMuted hover:text-white'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Audio Language Filter (CRITICAL for Test 9) */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121217] border border-white/5 text-xs font-bold">
                        <span className="flex items-center gap-1 text-[10px] text-textMuted uppercase px-2 font-black">
                            <Globe size={11} className="text-primary" /> Verified Audio:
                        </span>
                        {[
                            { code: 'all', label: 'All' },
                            { code: 'ja', label: 'Japanese' },
                            { code: 'en', label: 'English Dub' },
                            { code: 'hi', label: 'Hindi Dub' }
                        ].map(l => (
                            <button
                                key={l.code}
                                onClick={() => setAudioLang(l.code)}
                                className={`px-3 py-1 rounded-lg uppercase tracking-wider text-[10px] font-black transition-all ${audioLang === l.code ? 'bg-accentViolet text-white shadow-md' : 'text-textMuted hover:text-white'}`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div>
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {Array.from({ length: 10 }).map((_, i) => <MovieSkeleton key={i} />)}
                    </div>
                ) : items.length > 0 ? (
                    <div>
                        <div className="flex items-center justify-between text-xs text-textMuted mb-4 font-bold">
                            <span>Found {items.length} titles</span>
                            {audioLang !== 'all' && (
                                <span className="text-primary">
                                    Filtered by verified {audioLang.toUpperCase()} audio track
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                            {items.map(item => (
                                <MovieCard key={item.id} item={item} type={item.media_type || (mediaType === 'all' ? 'movie' : mediaType)} />
                            ))}
                        </div>
                    </div>
                ) : searchInput ? (
                    <div className="py-24 text-center bg-[#121217] rounded-3xl border border-white/5 p-6">
                        <SearchIcon size={36} className="text-white/20 mx-auto mb-3" />
                        <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">
                            No titles found
                        </h3>
                        <p className="text-xs text-textMuted max-w-sm mx-auto">
                            No results matched "{searchInput}" {audioLang !== 'all' ? `with verified ${audioLang.toUpperCase()} audio` : ''}.
                        </p>
                    </div>
                ) : (
                    <div className="py-20 text-center text-textMuted">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/30">
                            Type to begin searching the AniCine entertainment archive
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
