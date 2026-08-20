import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { Search as SearchIcon, Zap, ArrowLeft, TrendingUp, Star } from 'lucide-react';

export default function Search() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q');

    const [items, setItems] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load trending for sidebar
        fetchApi('/trending/all/day').then(data => {
            if (data && data.results) setTrending(data.results.slice(0, 8));
        });
    }, []);

    useEffect(() => {
        if (query) {
            setLoading(true);
            fetchApi('/search/multi', { query, include_adult: false }).then(data => {
                if (data && data.results) {
                    setItems(data.results.filter(i => i.media_type !== 'person' && i.poster_path));
                }
                setLoading(false);
            });
        }
    }, [query]);

    return (
        <div className="min-h-screen bg-[#080808] pt-4 pb-60 px-4 md:px-16 overflow-hidden">
            <div className="max-w-[1920px] mx-auto relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-16">
                {/* Main Results Column */}
                <div className="xl:col-span-9 space-y-24">
                    {/* Editorial Header */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 animate-entrance">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                 <button onClick={() => navigate(-1)} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                                     <ArrowLeft size={18} />
                                 </button>
                                 <div className="h-[1px] w-12 bg-[#ff4d4d] opacity-60"></div>
                                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#ff4d4d]">Search Results</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl lg:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85] mb-4 md:mb-8 break-words drop-shadow-2xl">
                                Results <br /> <span className="text-white/20">{query || 'Search'}</span>
                            </h1>
                            <div className="flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                                 <span className="flex items-center gap-2"><Zap size={14} className="text-[#ff4d4d]" /> Archive Query Active</span>
                                 <span>Found: {items.length} Nodes</span>
                                 <span className="px-3 py-1 border border-white/5 rounded-md text-[#1db954]">GLOBAL_SYNC</span>
                            </div>
                        </div>
                    </header>

                    {/* Results Grid */}
                    <section>
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                                {Array.from({ length: 12 }).map((_, i) => <MovieSkeleton key={i} />)}
                            </div>
                        ) : items.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 gap-y-20">
                                {items.map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="animate-entrance" style={{ animationDelay: `${idx * 50}ms` }}>
                                        <MovieCard item={item} type={item.media_type} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-40 text-center bg-white/5 rounded-[60px] border border-white/5 italic">
                                 <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.5em]">Transmission Offline: No Matches for "{query}" in Archive</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Trending Sidebar (Image 3 Inspiration) */}
                <aside className="xl:col-span-3 space-y-12">
                      <div className="flex items-center gap-4 mb-4">
                           <TrendingUp size={20} className="text-[#ff4d4d]" />
                           <h2 className="text-2xl font-black uppercase tracking-tighter italic">Top Trending</h2>
                      </div>
                      
                      <div className="flex flex-col gap-6">
                         {trending.map((item, idx) => (
                             <Link key={item.id} to={`/watch/${item.media_type}/${item.id}`} className="flex items-center gap-6 group p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-500">
                                 <div className="text-2xl font-black italic tracking-tighter text-white/5 group-hover:text-[#ff4d4d] transition-colors">
                                     0{idx + 1}
                                 </div>
                                 <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                                     <img src={item.poster_path ? `https://image.tmdb.org/t/p/w154${item.poster_path}` : ''} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                      <h4 className="text-[12px] font-black uppercase tracking-tight truncate group-hover:text-[#ff4d4d] transition-colors">{item.title || item.name}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                           <Star size={10} className="text-[#1db954] fill-[#1db954]" />
                                           <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.vote_average?.toFixed(1)}</span>
                                      </div>
                                 </div>
                             </Link>
                         ))}
                      </div>


                </aside>
            </div>
        </div>
    );
}
