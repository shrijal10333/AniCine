import React, { useEffect, useState } from 'react';
import { fetchApi } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { Layers, Sparkles, Filter } from 'lucide-react';

const FEATURED_GENRES = [
    { id: 16, name: 'Animation / Anime', color: 'from-purple-600 to-indigo-600' },
    { id: 28, name: 'Action', color: 'from-red-600 to-rose-600' },
    { id: 12, name: 'Adventure', color: 'from-amber-600 to-orange-600' },
    { id: 878, name: 'Sci-Fi', color: 'from-cyan-600 to-blue-600' },
    { id: 14, name: 'Fantasy', color: 'from-emerald-600 to-teal-600' },
    { id: 18, name: 'Drama', color: 'from-fuchsia-600 to-pink-600' },
    { id: 35, name: 'Comedy', color: 'from-yellow-500 to-amber-500' },
    { id: 27, name: 'Horror', color: 'from-stone-700 to-zinc-900' }
];

export default function Genres() {
    const [selectedGenre, setSelectedGenre] = useState(16); // Default to Animation/Anime
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchApi('/api/tmdb/discover', { with_genres: selectedGenre }).then(data => {
            setItems(data?.results || []);
            setLoading(false);
        });
    }, [selectedGenre]);

    const activeGenreObj = FEATURED_GENRES.find(g => g.id === selectedGenre) || FEATURED_GENRES[0];

    return (
        <div className="min-h-screen bg-[#0B0B0E] text-textMain px-4 md:px-12 py-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-xl">
                        <Layers size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight">
                            Genre <span className="text-primary">Collections</span>
                        </h1>
                        <p className="text-xs text-textMuted mt-0.5">
                            Browse curated entertainment categories across anime, cinema, and television.
                        </p>
                    </div>
                </div>
            </div>

            {/* Genre Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-8">
                {FEATURED_GENRES.map(g => (
                    <button
                        key={g.id}
                        onClick={() => setSelectedGenre(g.id)}
                        className={`p-3 rounded-2xl border text-xs font-black uppercase tracking-wider text-center transition-all ${selectedGenre === g.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105' : 'bg-[#121217] border-white/5 text-textMuted hover:text-white hover:border-white/20'}`}
                    >
                        {g.name}
                    </button>
                ))}
            </div>

            {/* Active Genre Title */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">
                        Showing: {activeGenreObj.name}
                    </h2>
                </div>
                <span className="text-xs text-textMuted font-bold">
                    {items.length} titles
                </span>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {Array.from({ length: 10 }).map((_, i) => <MovieSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {items.map(item => (
                        <MovieCard key={item.id} item={item} type={item.media_type || (selectedGenre === 16 ? 'tv' : 'movie')} />
                    ))}
                </div>
            )}
        </div>
    );
}
