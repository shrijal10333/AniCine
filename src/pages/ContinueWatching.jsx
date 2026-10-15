import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Clock, ArrowRight, Trash2, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api';

export default function ContinueWatching() {
    const { history } = useAuth();

    return (
        <div className="min-h-screen bg-[#0B0B0E] text-textMain px-4 md:px-12 py-6 max-w-7xl mx-auto">
            <div className="mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-xl">
                        <Clock size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight">
                            Continue <span className="text-primary">Watching</span>
                        </h1>
                        <p className="text-xs text-textMuted mt-0.5">
                            Resume viewing exactly where you left off across all devices.
                        </p>
                    </div>
                </div>
            </div>

            {history && history.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {history.map(item => (
                        <div key={item.id} className="p-4 rounded-3xl bg-[#121217] border border-white/10 hover:border-primary/40 transition-all flex flex-col justify-between group">
                            <div className="space-y-3">
                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                                    <img 
                                        src={getImageUrl(item.poster_path, 'w500')} 
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-xl">
                                            <Play size={20} className="fill-current ml-1" />
                                        </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20">
                                        <div 
                                            style={{ width: `${item.progressPercent || 25}%` }} 
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-[10px] text-textMuted font-bold mb-1">
                                        <span className="uppercase tracking-widest text-primary">
                                            {item.type || 'Movie'} {item.season ? `• S${item.season} E${item.episode}` : ''}
                                        </span>
                                        <span>{item.progressPercent || 0}% watched</span>
                                    </div>
                                    <h3 className="text-sm font-black text-white truncate tracking-wide">
                                        {item.title}
                                    </h3>
                                </div>
                            </div>

                            <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] text-textMuted">
                                    {item.lastWatched ? new Date(item.lastWatched).toLocaleDateString() : 'Recent'}
                                </span>
                                <Link
                                    to={`/watch/${item.type || 'movie'}/${item.id}`}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-wider hover:bg-primaryHover transition-all shadow-md"
                                >
                                    Resume <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center rounded-3xl bg-[#121217] border border-white/5 p-6">
                    <Film size={36} className="text-white/20 mx-auto mb-3" />
                    <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">
                        No in-progress titles
                    </h3>
                    <p className="text-xs text-textMuted max-w-sm mx-auto mb-6">
                        Titles you begin watching will automatically appear here with exact timestamp tracking.
                    </p>
                    <Link
                        to="/"
                        className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg inline-block"
                    >
                        Explore Anime & Movies
                    </Link>
                </div>
            )}
        </div>
    );
}
