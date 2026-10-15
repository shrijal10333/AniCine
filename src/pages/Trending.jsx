import React, { useEffect, useState } from 'react';
import { fetchTrending, fetchAnimeTrending } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { TrendingUp, Flame, Play, Star, Calendar } from 'lucide-react';

export default function Trending() {
    const [filter, setFilter] = useState('all'); // 'all' | 'anime' | 'movie' | 'tv'
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (filter === 'anime') {
            fetchAnimeTrending().then(data => {
                setItems(data?.results || []);
                setLoading(false);
            });
        } else {
            fetchTrending('day').then(data => {
                let results = data?.results || [];
                if (filter === 'movie') results = results.filter(i => i.media_type === 'movie');
                if (filter === 'tv') results = results.filter(i => i.media_type === 'tv');
                setItems(results);
                setLoading(false);
            });
        }
    }, [filter]);

    return (
        <div className="min-h-screen bg-[#0B0B0E] text-textMain px-4 md:px-12 py-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-xl">
                        <Flame size={24} className="text-primary fill-primary/20" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight">
                            Trending <span className="text-primary">Worldwide</span>
                        </h1>
                        <p className="text-xs text-textMuted mt-0.5">
                            Today's most popular anime, films, and series based on live audience momentum.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#121217] border border-white/10 self-start sm:self-auto">
                    {[
                        { id: 'all', label: 'All Media' },
                        { id: 'anime', label: 'Anime Only' },
                        { id: 'movie', label: 'Movies' },
                        { id: 'tv', label: 'TV Shows' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filter === f.id ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-textMuted hover:text-white'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {Array.from({ length: 15 }).map((_, i) => <MovieSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {items.map((item, idx) => (
                        <div key={item.id} className="relative group">
                            <span className="absolute top-2 left-2 z-10 w-6 h-6 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-black text-primary flex items-center justify-center shadow-lg">
                                #{idx + 1}
                            </span>
                            <MovieCard item={item} type={item.media_type || (filter === 'anime' ? 'tv' : 'movie')} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
