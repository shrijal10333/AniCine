import React from 'react';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import { History as HistoryIcon, Clock, ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function History() {
    const { history } = useAuth();

    return (
        <div className="min-h-screen bg-[#0B0B0E] text-textMain px-4 md:px-12 py-6 max-w-7xl mx-auto">
            <div className="mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-xl">
                        <HistoryIcon size={22} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight">
                            Watch <span className="text-primary">History</span>
                        </h1>
                        <p className="text-xs text-textMuted mt-0.5">
                            Complete log of previously streamed titles and timestamps.
                        </p>
                    </div>
                </div>
            </div>

            {history && history.length > 0 ? (
                <div>
                    <div className="text-xs text-textMuted font-bold mb-4">
                        <span>{history.length} logged viewing sessions</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {history.map(item => (
                            <div key={item.id} className="relative group flex flex-col justify-between">
                                <MovieCard item={item} type={item.type || 'movie'} />
                                <div className="mt-2 p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[10px]">
                                    <span className="text-primary font-bold">{item.progressPercent || 0}% watched</span>
                                    <span className="text-textMuted">{item.lastWatched ? new Date(item.lastWatched).toLocaleDateString() : 'Recent'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="py-24 text-center rounded-3xl bg-[#121217] border border-white/5 p-6">
                    <HistoryIcon size={36} className="text-white/20 mx-auto mb-3" />
                    <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">
                        No watch history yet
                    </h3>
                    <p className="text-xs text-textMuted max-w-sm mx-auto mb-6">
                        As you watch anime, series, and movies, your playback history will appear here.
                    </p>
                    <Link
                        to="/"
                        className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg inline-block"
                    >
                        Start Watching
                    </Link>
                </div>
            )}
        </div>
    );
}
