import React, { useEffect, useState } from 'react';
import { 
    fetchTrending, 
    fetchAnimeTrending, 
    fetchAnimeTopRated, 
    fetchMovies, 
    fetchTVShows, 
    getImageUrl 
} from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { useAuth } from '../context/AuthContext';
import { 
    Play, Info, Star, Calendar, Flame, Sparkles, 
    Layers, ArrowRight, ShieldCheck, Clock, Heart, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
    const { history, isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth();
    
    const [heroItem, setHeroItem] = useState(null);
    const [trendingAnime, setTrendingAnime] = useState([]);
    const [topRatedAnime, setTopRatedAnime] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [trendingTv, setTrendingTv] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAllHomeData = async () => {
            setLoading(true);
            try {
                const [animeTrend, animeTop, movies, tv] = await Promise.all([
                    fetchAnimeTrending(1),
                    fetchAnimeTopRated(1),
                    fetchMovies('popular', 1),
                    fetchTVShows('popular', 1)
                ]);

                if (animeTrend?.results?.length > 0) {
                    setTrendingAnime(animeTrend.results.slice(0, 10));
                    setHeroItem(animeTrend.results[0]);
                }
                if (animeTop?.results?.length > 0) {
                    setTopRatedAnime(animeTop.results.slice(0, 10));
                }
                if (movies?.results?.length > 0) {
                    setPopularMovies(movies.results.slice(0, 10));
                }
                if (tv?.results?.length > 0) {
                    setTrendingTv(tv.results.slice(0, 10));
                }
            } catch (err) {
                console.error("Home loading error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAllHomeData();
    }, []);

    const heroInWatchlist = heroItem ? isInWatchlist(heroItem.id) : false;

    return (
        <div className="min-h-screen bg-[#0B0B0E] text-textMain pb-24">
            {/* Cinematic Hero Section */}
            {heroItem && (
                <div className="relative w-full h-[65vh] md:h-[75vh] max-h-[750px] overflow-hidden">
                    {/* Background Backdrop with Gradient Overlay */}
                    <div className="absolute inset-0">
                        <img 
                            src={getImageUrl(heroItem.backdrop_path || heroItem.poster_path, 'original')} 
                            alt={heroItem.title || heroItem.name}
                            className="w-full h-full object-cover object-top scale-105 filter brightness-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0E] via-[#0B0B0E]/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0E] via-[#0B0B0E]/70 to-transparent" />
                    </div>

                    {/* Hero Content */}
                    <div className="relative h-full max-w-7xl mx-auto px-4 md:px-12 flex flex-col justify-end pb-12 z-10 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 text-[10px] font-black uppercase tracking-widest shadow-lg">
                                Featured Anime
                            </span>
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] font-black">
                                <Star size={12} className="fill-current" /> {heroItem.vote_average ? heroItem.vote_average.toFixed(1) : '8.8'}
                            </span>
                            <span className="text-xs text-textMuted flex items-center gap-1 font-bold">
                                <Calendar size={12} /> {heroItem.first_air_date?.substring(0, 4) || '2024'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
                                Japanese Audio + English Sub/Dub
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight uppercase max-w-3xl drop-shadow-xl leading-none">
                            {heroItem.title || heroItem.name}
                        </h1>

                        <p className="text-xs md:text-sm text-textMuted max-w-2xl line-clamp-3 leading-relaxed drop-shadow-md">
                            {heroItem.overview}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <Link 
                                to={`/watch/tv/${heroItem.id}`}
                                className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary hover:bg-primaryHover text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(139,92,246,0.4)] active:scale-95"
                            >
                                <Play size={16} className="fill-current" /> Watch Now
                            </Link>

                            <button
                                onClick={() => {
                                    if (heroInWatchlist) {
                                        removeFromWatchlist(heroItem.id);
                                    } else {
                                        addToWatchlist({
                                            id: heroItem.id,
                                            title: heroItem.title || heroItem.name,
                                            poster_path: heroItem.poster_path,
                                            media_type: 'tv',
                                            vote_average: heroItem.vote_average
                                        });
                                    }
                                }}
                                className={`flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${heroInWatchlist ? 'bg-primary text-white border-primary' : 'bg-black/50 hover:bg-white/10 text-white border-white/20'}`}
                            >
                                {heroInWatchlist ? <Check size={16} /> : <Heart size={16} />}
                                <span>{heroInWatchlist ? 'In Watchlist' : 'Add to List'}</span>
                            </button>

                            <Link 
                                to={`/watch/tv/${heroItem.id}`}
                                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider transition-all border border-white/10"
                            >
                                <Info size={16} /> Details
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Rows */}
            <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-12 mt-8">
                
                {/* Continue Watching Row (Personalized) */}
                {history && history.length > 0 && (
                    <section className="animate-entrance">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-primary" />
                                <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-white">
                                    Continue Watching
                                </h2>
                            </div>
                            <Link to="/continue-watching" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1">
                                View All ({history.length}) <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {history.slice(0, 4).map(item => (
                                <Link
                                    key={item.id}
                                    to={`/watch/${item.type || 'movie'}/${item.id}`}
                                    className="p-3 rounded-2xl bg-[#121217] border border-white/10 hover:border-primary/40 transition-all flex flex-col justify-between group"
                                >
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-2">
                                        <img 
                                            src={getImageUrl(item.poster_path, 'w500')} 
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                                                <Play size={16} className="fill-current ml-0.5" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                                            <div style={{ width: `${item.progressPercent || 30}%` }} className="h-full bg-primary" />
                                        </div>
                                    </div>
                                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                                    <span className="text-[10px] text-textMuted mt-0.5">{item.progressPercent || 0}% watched</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Trending Anime Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Flame size={18} className="text-primary" />
                            <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-white">
                                Trending Anime
                            </h2>
                        </div>
                        <Link to="/anime" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1">
                            Explore Anime <ArrowRight size={12} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {Array.from({ length: 5 }).map((_, i) => <MovieSkeleton key={i} />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {trendingAnime.slice(0, 10).map(item => (
                                <MovieCard key={item.id} item={item} type="tv" />
                            ))}
                        </div>
                    )}
                </section>

                {/* Top-Rated Anime Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Star size={18} className="text-yellow-400 fill-current" />
                            <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-white">
                                Top-Rated Anime Classics
                            </h2>
                        </div>
                        <Link to="/anime" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1">
                            See All <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {topRatedAnime.slice(0, 10).map(item => (
                            <MovieCard key={item.id} item={item} type="tv" />
                        ))}
                    </div>
                </section>

                {/* Popular Movies Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-accent" />
                            <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-white">
                                Popular Feature Films
                            </h2>
                        </div>
                        <Link to="/movies" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1">
                            Browse Movies <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {popularMovies.slice(0, 10).map(item => (
                            <MovieCard key={item.id} item={item} type="movie" />
                        ))}
                    </div>
                </section>

                {/* Trending TV Shows Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Layers size={18} className="text-cyan-400" />
                            <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-white">
                                Trending Television Series
                            </h2>
                        </div>
                        <Link to="/tv" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1">
                            View All Series <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {trendingTv.slice(0, 10).map(item => (
                            <MovieCard key={item.id} item={item} type="tv" />
                        ))}
                    </div>
                </section>

                {/* TMDB Attribution Disclaimer */}
                <footer className="pt-8 pb-4 border-t border-white/5 text-center text-xs text-textMuted space-y-1">
                    <p className="font-medium">
                        AniCine Streaming Platform • Real-Time Media Engine
                    </p>
                    <p className="text-[10px] text-white/30">
                        This product uses the TMDB API but is not endorsed or certified by TMDB. All metadata, imagery, and synopsis are provided via authorized TMDB interfaces.
                    </p>
                </footer>
            </div>
        </div>
    );
}
