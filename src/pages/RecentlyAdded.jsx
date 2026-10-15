import React, { useEffect, useState } from 'react';
import { fetchMovies, fetchTVShows } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { Sparkles, Calendar, Clock } from 'lucide-react';

export default function RecentlyAdded() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchMovies('upcoming'),
            fetchMovies('popular')
        ]).then(([upcoming, popular]) => {
            const merged = [...(upcoming?.results || []), ...(popular?.results || [])];
            // Remove duplicates
            const unique = Array.from(new Map(merged.map(m => [m.id, m])).values());
            setItems(unique);
            setLoading(false);
        });
    }, []);

    return (
        <div className="min-h-screen bg-[#0B0B0E] text-textMain px-4 md:px-12 py-6 max-w-7xl mx-auto">
            <div className="mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-xl">
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight">
                            Recently <span className="text-primary">Added</span>
                        </h1>
                        <p className="text-xs text-textMuted mt-0.5">
                            New theatrical releases, newly added anime seasons, and fresh television premieres.
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {Array.from({ length: 10 }).map((_, i) => <MovieSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {items.map(item => (
                        <MovieCard key={item.id} item={item} type="movie" />
                    ))}
                </div>
            )}
        </div>
    );
}
