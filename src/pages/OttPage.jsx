import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi, getImageUrl } from '../api';
import MovieCard from '../components/MovieCard';
import { Loader2 } from 'lucide-react';

const PROVIDERS = {
    '8': { name: 'Netflix', color: 'from-[#E50914]/20', border: 'border-[#E50914]/50', text: 'text-[#E50914]', shadow: 'shadow-[#E50914]/20', region: 'US' },
    '119': { name: 'Amazon Prime Video', color: 'from-[#00A8E1]/20', border: 'border-[#00A8E1]/50', text: 'text-[#00A8E1]', shadow: 'shadow-[#00A8E1]/20', region: 'US' },
    '337': { name: 'Disney+', color: 'from-[#113CCF]/20', border: 'border-[#113CCF]/50', text: 'text-[#113CCF]', shadow: 'shadow-[#113CCF]/20', region: 'US' },
    '350': { name: 'Apple TV+', color: 'from-white/20', border: 'border-white/50', text: 'text-white', shadow: 'shadow-white/20', region: 'US' },
    '384': { name: 'HBO Max', color: 'from-[#5822b4]/20', border: 'border-[#5822b4]/50', text: 'text-[#5822b4]', shadow: 'shadow-[#5822b4]/20', region: 'US' },
    '122': { name: 'JioHotstar', color: 'from-[#10b981]/20', border: 'border-[#10b981]/50', text: 'text-[#10b981]', shadow: 'shadow-[#10b981]/20', region: 'IN' },
    '232': { name: 'Zee5', color: 'from-[#8b5cf6]/20', border: 'border-[#8b5cf6]/50', text: 'text-[#8b5cf6]', shadow: 'shadow-[#8b5cf6]/20', region: 'IN' },
    '237': { name: 'Sony LIV', color: 'from-[#f97316]/20', border: 'border-[#f97316]/50', text: 'text-[#f97316]', shadow: 'shadow-[#f97316]/20', region: 'IN' },
    '220': { name: 'JioCinema', color: 'from-[#db2777]/20', border: 'border-[#db2777]/50', text: 'text-[#db2777]', shadow: 'shadow-[#db2777]/20', region: 'IN' },
    '437': { name: 'MX Player', color: 'from-[#3b82f6]/20', border: 'border-[#3b82f6]/50', text: 'text-[#3b82f6]', shadow: 'shadow-[#3b82f6]/20', region: 'IN' },
    '310': { name: 'ALTBalaji', color: 'from-[#ef4444]/20', border: 'border-[#ef4444]/50', text: 'text-[#ef4444]', shadow: 'shadow-[#ef4444]/20', region: 'IN' },
    '218': { name: 'Eros Now', color: 'from-[#f59e0b]/20', border: 'border-[#f59e0b]/50', text: 'text-[#f59e0b]', shadow: 'shadow-[#f59e0b]/20', region: 'IN' },
    '309': { name: 'Sun NXT', color: 'from-[#eab308]/20', border: 'border-[#eab308]/50', text: 'text-[#eab308]', shadow: 'shadow-[#eab308]/20', region: 'IN' },
};

export default function OttPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const provider = PROVIDERS[id] || { name: 'Streaming Channel', color: 'from-[#1db954]/20', border: 'border-[#1db954]/50', text: 'text-[#1db954]', shadow: 'shadow-[#1db954]/20', region: 'US' };
    
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [allContent, setAllContent] = useState([]);

    useEffect(() => {
        setLoading(true);
        const region = provider.region;
        
        Promise.all([
            fetchApi(`/discover/movie?with_watch_providers=${id}&watch_region=${region}&sort_by=popularity.desc`),
            fetchApi(`/discover/tv?with_watch_providers=${id}&watch_region=${region}&sort_by=vote_average.desc&vote_count.gte=100`),
            fetchApi(`/discover/movie?with_watch_providers=${id}&watch_region=${region}&sort_by=vote_average.desc&vote_count.gte=300`),
            fetchApi(`/discover/tv?with_watch_providers=${id}&watch_region=${region}&sort_by=vote_average.desc&vote_count.gte=100`),
            fetchApi(`/discover/movie?with_watch_providers=${id}&watch_region=${region}&sort_by=revenue.desc`),
        ]).then(([trendingMovies, trendingShows, topMovies, topShows, blockbusters]) => {
            let rowData = [
                { title: `Trending Movies`, data: trendingMovies?.results || [], type: 'movie' },
                { title: `Popular Series`, data: trendingShows?.results || [], type: 'tv' },
                { title: 'Critically Acclaimed Movies', data: topMovies?.results || [], type: 'movie' },
                { title: 'Top Rated Series', data: topShows?.results || [], type: 'tv' },
                { title: 'Highest Grossing', data: blockbusters?.results || [], type: 'movie' },
            ].filter(r => r.data.length && r.data.length > 0);
            
            const handleData = (finalRows) => {
                setRows(finalRows);
                let aggregated = [];
                const seen = new Set();
                finalRows.forEach(r => {
                    r.data.forEach(item => {
                        if (!seen.has(item.id)) {
                            seen.add(item.id);
                            aggregated.push({ ...item, media_type: r.type });
                        }
                    });
                });
                setAllContent(aggregated);
                setLoading(false);
            };

            // FALBACK: If the provider ID or Region yields 0 local results, GUARANTEE content is populated with global fallbacks!
            if (rowData.length === 0) {
                Promise.all([
                    fetchApi(`/trending/movie/day`),
                    fetchApi(`/trending/tv/day`),
                    fetchApi(`/movie/top_rated`),
                    fetchApi(`/tv/top_rated`),
                    fetchApi(`/movie/popular`),
                ]).then(([tm, tt, trm, trt, pm]) => {
                    handleData([
                        { title: `Trending Movies on ${provider.name}`, data: tm?.results || [], type: 'movie' },
                        { title: `Popular Series`, data: tt?.results || [], type: 'tv' },
                        { title: 'Critically Acclaimed Movies', data: trm?.results || [], type: 'movie' },
                        { title: 'Top Rated Series', data: trt?.results || [], type: 'tv' },
                        { title: 'Global Hits', data: pm?.results || [], type: 'movie' },
                    ]);
                });
            } else {
                handleData(rowData);
            }
        });
    }, [id]);

    const filteredContent = allContent.filter(item => 
        (item.title || item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const heroContent = allContent.length > 0 ? allContent[0] : null;

    return (
        <div className="min-h-screen bg-[#080808] text-white">
            {/* Ultra-Premium Cinematic OTT Header */}
            <div className="relative pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-12 lg:px-20 min-h-[35vh] md:min-h-[50vh] flex flex-col justify-end border-b border-white/5">
                {heroContent && heroContent.backdrop_path ? (
                    <>
                        <div className="absolute inset-0 z-0">
                            <img src={getImageUrl(heroContent.backdrop_path, 'original')} alt="" className="w-full h-full object-cover opacity-30" />
                        </div>
                        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent"></div>
                        <div className={`absolute inset-0 z-0 bg-gradient-to-b ${provider.color} to-transparent opacity-20`}></div>
                    </>
                ) : (
                    <div className={`absolute inset-0 z-0 bg-gradient-to-b ${provider.color} to-[#080808] opacity-10`}></div>
                )}
                
                <div className="max-w-[1920px] w-full mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-6 md:gap-8 pt-4 md:pt-0 relative z-10 mt-8">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 min-w-0 w-full">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse"></div>
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-white/50">Exclusive Network</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-2 md:mb-3 break-words w-full">
                            {provider.name}
                        </h1>
                        <p className="text-white/40 text-xs sm:text-sm font-medium max-w-xl px-2 md:px-0">
                            Streaming the entire premium library natively. Discover what's trending now on your selected network.
                        </p>
                    </div>

                    <div className="flex flex-col items-center shrink-0 w-full md:w-auto px-4 md:px-0">
                        <input 
                            type="text" 
                            placeholder={`Search ${provider.name}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-72 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-3.5 text-xs md:text-sm font-medium text-white placeholder-white/30 outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-xl"
                        />
                    </div>
                </div>
            </div>

            {/* OTT Styled Rows Grid */}
            <div className="max-w-[1920px] mx-auto py-8 md:py-12 pb-40 flex flex-col gap-10 md:gap-12 overflow-hidden w-full">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-pulse space-y-4">
                        <Loader2 size={48} className={`animate-spin ${provider.text}`} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Establishing Secure Connection to {provider.name} Database...</p>
                    </div>
                ) : searchQuery ? (
                    <div className="px-4 md:px-12 lg:px-20 w-full">
                        <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-white/40 mb-6 md:mb-8 border-b border-white/10 pb-4">Search Results for "{searchQuery}"</h2>
                        {filteredContent.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 w-full">
                                {filteredContent.map(item => (
                                    <MovieCard key={item.id} item={item} type={item.media_type} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-white/20 text-lg md:text-xl font-bold uppercase tracking-widest break-words px-4">No Matches Found</div>
                        )}
                    </div>
                ) : rows.length > 0 && (
                    rows.map((row, rowIdx) => (
                        <div key={rowIdx} className="w-full">
                            <h2 className="text-lg md:text-3xl font-black italic tracking-tighter uppercase px-4 md:px-12 lg:px-20 mb-4 md:mb-6 border-l-4 border-current leading-none" style={{ color: provider.text.replace('text-[', '').replace(']', '') }}>
                                {row.title}
                            </h2>
                            <div className="flex gap-3 md:gap-4 overflow-x-auto px-4 md:px-12 lg:px-20 pb-8 custom-scrollbar snap-x snap-mandatory">
                                {row.data.map((item, idx) => (
                                    <div key={item.id} className="w-32 sm:w-40 md:w-56 shrink-0 snap-start transform transition-transform duration-500 hover:scale-[1.03] hover:z-30">
                                        <MovieCard item={item} type={row.type} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
