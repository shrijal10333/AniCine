import React from 'react';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import { Heart, Plus, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyList() {
    const { watchlist } = useAuth();

    return (
        <div className="min-h-screen bg-[#0B0B0E] text-textMain px-4 md:px-12 py-6 max-w-7xl mx-auto">
            <div className="mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-xl">
                        <Heart size={22} className="fill-current text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight">
                            Personal <span className="text-primary">Watchlist</span>
                        </h1>
                        <p className="text-xs text-textMuted mt-0.5">
                            Saved movies, anime, and series. Automatically synchronized to your account.
                        </p>
                    </div>
                </div>
            </div>

            {watchlist && watchlist.length > 0 ? (
                <div>
                    <div className="text-xs text-textMuted font-bold mb-4">
                        <span>{watchlist.length} saved titles</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {watchlist.map(item => (
                            <MovieCard key={item.id} item={item} type={item.media_type || 'movie'} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="py-24 text-center rounded-3xl bg-[#121217] border border-white/5 p-6">
                    <Film size={36} className="text-white/20 mx-auto mb-3" />
                    <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">
                        Your watchlist is empty
                    </h3>
                    <p className="text-xs text-textMuted max-w-sm mx-auto mb-6">
                        Tap "Add to Watchlist" on any title to save it for later viewing.
                    </p>
                    <Link
                        to="/"
                        className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg inline-block"
                    >
                        Browse Catalog
                    </Link>
                </div>
            )}
        </div>
    );
}
