import { useWatchlist } from '../hooks/useWatchlist';
import MovieCard from '../components/MovieCard';
import { Plus } from 'lucide-react';

export default function MyList() {
    const { watchlist } = useWatchlist();

    return (
        <div className="px-8 max-w-[1600px] mx-auto py-10">
            <div className="flex items-center gap-4 mb-14">
                <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(255,184,0,0.4)]"></div>
                <h1 className="text-4xl font-bold text-white tracking-tighter uppercase whitespace-nowrap">
                    My List
                </h1>
            </div>

            {watchlist.length === 0 ? (
                <div className="bg-card/50 border border-white/5 rounded-[48px] p-24 flex flex-col items-center justify-center text-center shadow-inner mt-4 backdrop-blur-md">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"></div>
                        <div className="relative w-24 h-24 rounded-[32px] bg-background border border-white/10 flex items-center justify-center">
                            <Plus size={40} className="text-primary" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-3 tracking-tighter uppercase">List is Empty</h3>
                    <p className="text-textMuted max-w-sm font-medium uppercase tracking-wider text-[11px] leading-relaxed">Add movies and shows to your list to find them here later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 gap-y-12">
                    {watchlist.slice().reverse().map((item, idx) => (
                        <MovieCard key={`${item.id}-${idx}`} item={item} type={item.media_type} />
                    ))}
                </div>
            )}
        </div>
    );
}
