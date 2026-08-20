import { useEffect, useState } from 'react';
import { fetchApi, getImageUrl } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { Play, Plus, Info, Zap, ArrowRight, Star, Clock, Calendar, Heart, ShieldQuestion as Headphones, Compass, History } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
    const [featured, setFeatured] = useState(null);
    const [dailyFilms, setDailyFilms] = useState([]);
    const [popularTv, setPopularTv] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [trend, daily, tv, arrivals] = await Promise.all([
                    fetchApi('/trending/all/day'),
                    fetchApi('/movie/popular'),
                    fetchApi('/tv/popular'),
                    fetchApi('/movie/now_playing')
                ]);

                if (trend?.results) setFeatured(trend.results[0]);
                if (daily?.results) setDailyFilms(daily.results.slice(0, 10));
                if (tv?.results) setPopularTv(tv.results.slice(0, 10));
                if (arrivals?.results) setNewArrivals(arrivals.results.slice(0, 12));
            } catch (err) {
                console.error("Home Load Error:", err);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="min-h-screen bg-[#0b0b0b] text-white selection:bg-[#1db954] selection:text-black pb-40">
            {/* Top Navigation Spacing */}
            <div className="h-20"></div>

            <main className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 space-y-12">
                
                {/* Spotify Dashboard Header */}
                <section className="animate-entrance">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-8 mb-8">{getGreeting()}</h1>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {loading 
                            ? Array.from({length: 8}).map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse"></div>)
                            : [...dailyFilms.slice(0, 4), ...popularTv.slice(0, 4)].map((item, idx) => (
                                <Link 
                                    key={item.id + idx} 
                                    to={`/watch/${item.media_type || (idx < 4 ? 'movie' : 'tv')}/${item.id}`}
                                    className="group relative flex items-center gap-4 bg-white/[0.03] backdrop-blur-md rounded-lg overflow-hidden border border-white/[0.05] hover:bg-white/[0.08] transition-all duration-300 shadow-lg"
                                >
                                    <div className="w-20 h-20 flex-shrink-0 shadow-2xl">
                                        <img src={getImageUrl(item.poster_path, 'w185')} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-sm font-bold truncate leading-tight uppercase tracking-wide">
                                            {item.title || item.name}
                                        </p>
                                    </div>
                                    <div className="mr-4 w-12 h-12 bg-[#1db954] rounded-full flex items-center justify-center shadow-[0_8px_16px_rgba(29,185,84,0.3)] opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                        <Play fill="black" size={20} className="ml-1 text-black" />
                                    </div>
                                </Link>
                            ))
                        }
                    </div>
                </section>

                {/* Hero Feature Banner - Less intense than full screen */}
                {featured && !loading && (
                    <section className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden group shadow-2xl animate-entrance border border-white/5">
                        <img
                            src={getImageUrl(featured.backdrop_path, 'original')}
                            className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] transition-transform duration-[5000ms] group-hover:scale-105"
                            alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        <div className="relative h-full flex flex-col justify-end p-8 md:p-16">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-[#1db954] text-black px-3 py-1 rounded text-[10px] font-black uppercase">Trending Now</span>
                                <span className="bg-white/10 backdrop-blur-md text-white/60 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10">Featured</span>
                            </div>
                            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6 max-w-4xl italic">{featured.title || featured.name}</h2>
                            <div className="flex gap-4">
                                <Link to={`/watch/${featured.media_type}/${featured.id}`} className="bg-[#1db954] hover:bg-[#1ed760] text-black px-10 py-4 rounded-full font-black uppercase text-xs transition-all flex items-center gap-3 active:scale-95 shadow-xl">
                                    <Play size={18} fill="currentColor" /> Stream
                                </Link>
                                <button className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white px-10 py-4 rounded-full font-black uppercase text-xs transition-all">
                                    <Plus size={18} /> Add to Watchlist
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Grid Rows - Discovery Mode */}
                <section className="pt-10">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-widest text-white border-l-4 border-[#1db954] pl-4 mb-2 italic">Critics Choices</h2>
                            <p className="text-white/40 text-sm font-medium">Top picks from the global cinema scene.</p>
                        </div>
                        <Link to="/movies" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-[#1db954] transition-colors flex items-center gap-2 group">
                            Explore All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
                        {loading 
                            ? Array.from({length: 5}).map((_, i) => <MovieSkeleton key={i} />)
                            : dailyFilms.slice(0, 5).map((item, idx) => (
                                <div key={item.id} className="animate-entrance" style={{ animationDelay: `${idx * 100}ms` }}>
                                     <PosterNode item={item} type="movie" />
                                </div>
                            ))
                        }
                    </div>
                </section>

                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-widest text-white border-l-4 border-[#ff4d4d] pl-4 mb-2 italic">Prime Time</h2>
                            <p className="text-white/40 text-sm font-medium">Shows that everyone is talking about.</p>
                        </div>
                        <Link to="/anime" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-[#ff4d4d] transition-colors flex items-center gap-2 group">
                            Full Lineup <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
                        {loading 
                            ? Array.from({length: 5}).map((_, i) => <MovieSkeleton key={i} />)
                            : popularTv.slice(0, 5).map((item, idx) => (
                                <div key={item.id} className="animate-entrance" style={{ animationDelay: `${idx * 100}ms` }}>
                                     <PosterNode item={item} type="tv" />
                                </div>
                            ))
                        }
                    </div>
                </section>

                {/* Spotify-style New Arrivals List */}
                <section className="pb-20">
                     <div className="mb-10 flex items-center gap-4">
                        <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl">
                             <Compass size={24} className="text-[#1db954]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Next Discoveries</h2>
                            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Fresh drops arriving in your orbit</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {loading 
                            ? Array.from({length: 6}).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl"></div>)
                            : newArrivals.slice(0, 6).map((item, idx) => (
                                <Link 
                                    key={item.id} 
                                    to={`/watch/movie/${item.id}`} 
                                    className="flex items-center gap-5 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                                >
                                    <div className="w-16 h-20 rounded-lg overflow-hidden shadow-xl shrink-0 group-hover:scale-105 transition-transform">
                                        <img src={getImageUrl(item.poster_path, 'w185')} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h4 className="text-sm font-black uppercase tracking-tight truncate group-hover:text-[#1db954] transition-colors">{item.title}</h4>
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1 italic line-clamp-1">{item.overview}</p>
                                        <div className="flex items-center gap-3 mt-3 text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/60 transition-colors">
                                            <span>{item.release_date?.slice(0,4)}</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                            <span>New Release</span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight size={18} className="text-[#1db954]" />
                                    </div>
                                </Link>
                            ))
                         }
                     </div>
                </section>
            </main>

            <footer className="mt-20 border-t border-white/5 bg-[#080808] py-20 px-4 md:px-12">
                 <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                     <div className="space-y-6">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1db954] via-emerald-400 to-teal-300 p-[1.5px] shadow-[0_0_20px_rgba(29,185,84,0.3)]">
                                 <div className="w-full h-full bg-[#0d0d0d] rounded-[14px] flex items-center justify-center">
                                     <Zap size={18} className="text-[#1db954] fill-[#1db954]" />
                                 </div>
                             </div>
                             <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none font-['Syne',sans-serif]">
                                 Ani<span className="text-[#1db954]">Cine</span>
                             </h2>
                         </div>
                         <div className="flex gap-8 text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
                             <span className="hover:text-white cursor-pointer">Security</span>
                             <span className="hover:text-white cursor-pointer">Protocol</span>
                             <span className="hover:text-white cursor-pointer">Access</span>
                         </div>
                     </div>
                     <div className="flex flex-col md:items-end gap-6">
                         <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 font-['Syne',sans-serif]">ANICINE STREAM NETWORK</div>
                         <div className="px-8 py-3 bg-white/[0.03] border border-white/5 rounded-full text-[10px] font-black text-[#1db954] uppercase tracking-widest shadow-inner">
                             Status: Online
                         </div>
                     </div>
                 </div>
            </footer>
        </div>
    );
}

function PosterNode({ item, type }) {
    return (
        <Link to={`/watch/${type}/${item.id}`} className="group block relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/5 transition-all duration-500 hover:scale-[1.02] hover:border-[#1db954]/50 bg-black">
            <img
                src={getImageUrl(item.poster_path, 'w500')}
                className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110 ease-out opacity-80 group-hover:opacity-100"
                alt=""
                loading="lazy"
            />
            {/* Year Badge */}
            <div className="absolute top-4 right-4 z-20">
                <div className="bg-[#1db954] text-black px-2 py-1 rounded text-[9px] font-black shadow-2xl transform transition-transform group-hover:scale-110">
                    {(item.release_date || item.first_air_date || '').slice(0, 4)}
                </div>
            </div>
            {/* Hover Shadow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500">
                <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 italic">
                        {item.title || item.name}
                    </h3>
                </div>
            </div>
        </Link>
    );
}
