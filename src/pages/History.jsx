import { useContinueWatching } from '../hooks/useContinueWatching';
import MovieCard from '../components/MovieCard';
import { History as HistoryIcon, Trash2, Clock } from 'lucide-react';

export default function History() {
    const { history, clearHistory, removeFromHistory } = useContinueWatching();

    return (
        <div className="px-4 md:px-8 max-w-[1600px] mx-auto py-6 md:py-10">
            <div className="flex items-center justify-between mb-8 md:mb-14 gap-4">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="w-1 md:w-1.5 h-8 md:h-10 bg-primary rounded-full shrink-0"></div>
                    <h1 className="text-xl md:text-4xl font-bold text-white tracking-tighter uppercase truncate">
                        Watch History
                    </h1>
                </div>

                {history.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="shrink-0 flex items-center gap-2 bg-white/5 border border-white/10 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 hover:border-red-500/30 transition-all active:scale-95"
                    >
                        <Trash2 size={14} /> Clear All
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-[48px] p-12 md:p-24 flex flex-col items-center justify-center text-center">
                    <div className="w-16 md:w-24 h-16 md:h-24 rounded-2xl md:rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mb-6 md:mb-8">
                        <HistoryIcon size={32} className="text-white/20" />
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-3 tracking-tighter uppercase">No Watch History</h3>
                    <p className="text-white/30 max-w-sm text-xs md:text-sm">Start watching movies and shows to build your history.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 gap-y-10 md:gap-y-16">
                    {history.slice().reverse().map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="relative group">
                            <MovieCard item={item} type={item.media_type} />

                            {/* Info + Delete */}
                            <div className="mt-2 flex items-center justify-between px-1">
                                <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-widest">
                                    <Clock size={10} className="text-[#1db954]" />
                                    {item.media_type === 'tv' ? `S${item.season} E${item.episode}` : 'Watched'}
                                </div>
                                <button
                                    onClick={() => removeFromHistory(item.id, item.media_type)}
                                    className="p-1.5 rounded-lg bg-white/5 text-white/30 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
