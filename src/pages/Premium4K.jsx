import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi, getImageUrl } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { Zap, Crown, Star, Play } from 'lucide-react';

export default function Premium4K() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [featured, setFeatured] = useState(null);

    useEffect(() => {
        setLoading(true);
        // Fetch top rated movies as "Premium" content
        fetchApi('/movie/top_rated', { page: 1 }).then(data => {
            if (data && data.results) {
                setItems(data.results);
                setFeatured(data.results[0]);
            }
            setLoading(false);
        });
    }, []);

    return (
        <div className="pb-10">
            {/* Hero Section */}
            {featured && (
                <div className="px-8 mb-16 w-full max-w-[1600px] mx-auto mt-6">
                    <div className="h-[60vh] rounded-[40px] bg-background border border-primary/20 flex items-center p-10 sm:p-20 relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(251,191,36,0.1)]">
                        <img
                            src={getImageUrl(featured.backdrop_path, 'w1280')}
                            alt={featured.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-20 transition-all duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent"></div>

                        <div className="relative z-10 max-w-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                                    <Crown size={14} className="fill-current" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">Premium Cinema</span>
                                </div>
                                <div className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                                    <Zap size={14} className="fill-current" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">4K Ultra HD</span>
                                </div>
                            </div>

                            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-none">{featured.title}</h1>
                            <p className="text-textMuted text-sm lg:text-base mb-10 line-clamp-3 leading-relaxed max-w-lg">
                                Watch {featured.title} in stunning 4K Ultra HD with enhanced audio for the ultimate viewing experience.
                            </p>

                            <div className="flex items-center gap-4">
                                <Link to={`/watch/movie/${featured.id}`} className="bg-primary text-background font-black py-4 px-10 rounded-2xl flex items-center gap-3 shadow-xl hover:bg-primaryDark transition-all group">
                                    <Play size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" /> WATCH NOW
                                </Link>
                                <div className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                                    4K • HDR
                                </div>
                            </div>
                        </div>

                        {/* Visual Decoration */}
                        <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-6">
                            <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center animate-spin-slow">
                                <div className="w-16 h-16 rounded-full border-2 border-primary/40 flex items-center justify-center animate-reverse-spin">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Zap size={24} className="text-primary" />
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] transform rotate-90 whitespace-nowrap">High Fidelity</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Grid */}
            <div className="px-8 max-w-[1600px] mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(251,191,36,0.3)]"></div>
                        <h2 className="text-4xl font-bold text-white tracking-tighter uppercase whitespace-nowrap">
                            Premium 4K
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 gap-y-12">
                    {loading ? (
                        Array.from({ length: 12 }).map((_, i) => <MovieSkeleton key={i} />)
                    ) : (
                        items.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="relative group overflow-hidden rounded-[24px]">
                                <MovieCard item={item} type="movie" />
                                <div className="absolute top-4 right-4 z-20 pointer-events-none">
                                    <div className="bg-background/60 backdrop-blur-md border border-primary/30 px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-xl transition-all group-hover:bg-primary group-hover:text-background group-hover:border-primary">
                                        <Zap size={10} className="fill-current" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">4K</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
