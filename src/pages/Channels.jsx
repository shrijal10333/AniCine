import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi, getImageUrl } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { Radio, Play, Users } from 'lucide-react';

const CARTOON_CHANNELS = [
    { id: 'hungama', name: 'Hungama TV', networkId: 1045, query: 'Doraemon', description: 'Home of Doraemon & Shin-chan' },
    { id: 'cn', name: 'Cartoon Network', networkId: 56, query: 'Ben 10', description: 'Classic animation hub' },
    { id: 'disney-xd', name: 'Disney XD', networkId: 44, query: 'Pokemon', description: 'Action & adventure' },
    { id: 'disney-channel', name: 'Disney Channel', networkId: 54, query: 'Disney', description: 'Disney originals' },
    { id: 'nick', name: 'Nickelodeon', networkId: 13, query: 'SpongeBob', description: 'SpongeBob & TMNT' },
    { id: 'boomerang', name: 'Boomerang', networkId: 88, query: 'Tom and Jerry', description: 'Cartoon classics' },
    { id: 'sonyyay', name: 'Sony YAY!', networkId: 1993, query: 'Oggy', description: 'Non-stop laughter' },
    { id: 'animax', name: 'Animax', networkId: 204, query: 'Naruto', description: 'Anime network' },
    { id: 'pogo', name: 'Pogo TV', networkId: 1046, query: 'Chhota Bheem', description: 'Indian kids channel' },
    { id: 'toonami', name: 'Toonami', networkId: 878, query: 'Batman', description: 'Action animation' },
    { id: 'teletoon', name: 'Teletoon', networkId: 145, query: 'Total Drama', description: 'Serious about cartoons' },
    { id: 'power-rangers', name: 'Power Rangers', networkId: null, query: 'Power Rangers', description: 'All Legacy & Modern Seasons' }
];

export default function Channels() {
    const [selectedChannel, setSelectedChannel] = useState(CARTOON_CHANNELS[0]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeHero, setActiveHero] = useState(null);

    useEffect(() => {
        const fetchChannelContent = async () => {
            setLoading(true);
            let data;
            if (selectedChannel.networkId) {
                data = await fetchApi('/discover/tv', { with_networks: selectedChannel.networkId, sort_by: 'popularity.desc' });
            }
            if (!data || !data.results || data.results.length === 0) {
                // Fetch deep for Power Rangers: Both TV and Movies across multiple pages
                if (selectedChannel.id === 'power-rangers') {
                    const allResults = [];
                    // Fetch TV Shows (More pages)
                    for (let p = 1; p <= 8; p++) {
                        const pageData = await fetchApi('/search/tv', { query: selectedChannel.query, page: p });
                        if (pageData && pageData.results) {
                            allResults.push(...pageData.results.map(i => ({ ...i, media_type: 'tv' })));
                            if (pageData.total_pages <= p) break;
                        } else { break; }
                    }
                    // Fetch Movies too!
                    for (let p = 1; p <= 3; p++) {
                        const pageData = await fetchApi('/search/movie', { query: selectedChannel.query, page: p });
                        if (pageData && pageData.results) {
                            allResults.push(...pageData.results.map(i => ({ ...i, media_type: 'movie' })));
                            if (pageData.total_pages <= p) break;
                        } else { break; }
                    }
                    data = { results: allResults };
                } else {
                    data = await fetchApi('/search/tv', { query: selectedChannel.query });
                }
            }
            if (data && data.results) {
                let sortedResults = [...data.results];
                // If Power Rangers, sort by oldest first to show "from starting"
                if (selectedChannel.id === 'power-rangers') {
                    // Comprehensive filtering
                    sortedResults = sortedResults.filter(item => {
                        const name = (item.name || item.title || item.original_name || '').toLowerCase();
                        const matchesName = name.includes('power rangers') || name.includes('powerrangers') || name.includes('power ranger');
                        const hasImage = item.poster_path || item.backdrop_path;
                        return matchesName && hasImage;
                    });
                    
                    // Strict Deduplication
                    const seenMetadata = new Set();
                    sortedResults = sortedResults.filter(item => {
                        const title = (item.name || item.title || '').toLowerCase().trim();
                        const year = (item.first_air_date || item.release_date || '').slice(0, 4);
                        const id = item.id;
                        const type = item.media_type;
                        
                        // Create multiple unique keys to catch all forms of duplication
                        const keys = [
                            `${type}-${id}`, // Same entry on different search pages
                            `${title}-${year}` // Same show entry under different IDs (rare but happens in TMDB)
                        ];

                        for (const key of keys) {
                            if (seenMetadata.has(key)) return false;
                        }
                        
                        keys.forEach(key => seenMetadata.add(key));
                        return true;
                    });

                    // Sort chronologically
                    sortedResults.sort((a, b) => {
                        const dateA = (a.first_air_date || a.release_date) ? new Date(a.first_air_date || a.release_date) : new Date('9999-12-31');
                        const dateB = (b.first_air_date || b.release_date) ? new Date(b.first_air_date || b.release_date) : new Date('9999-12-31');
                        return dateA - dateB;
                    });
                }
                setItems(sortedResults);
                setActiveHero(sortedResults[0]);
            }
            setLoading(false);
        };
        fetchChannelContent();
    }, [selectedChannel]);

    return (
        <div className="min-h-screen bg-[#080808]">
            {/* Channel Selector - Horizontal scroll on mobile, sidebar on desktop */}
            <div className="lg:hidden overflow-x-auto px-4 py-4 flex gap-2 scrollbar-hide border-b border-white/5">
                {CARTOON_CHANNELS.map((ch) => (
                    <button
                        key={ch.id}
                        onClick={() => setSelectedChannel(ch)}
                        className={`whitespace-nowrap px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                            selectedChannel?.id === ch.id
                                ? 'bg-[#1db954] text-black'
                                : 'bg-white/5 text-white/50 active:bg-white/10'
                        }`}
                    >
                        {ch.name}
                    </button>
                ))}
            </div>

            <div className="flex">
                {/* Desktop Sidebar */}
                <div className="hidden lg:flex w-80 shrink-0 flex-col border-r border-white/5 h-[calc(100vh-80px)] sticky top-20">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Channels</h2>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Live Networks</p>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                        {CARTOON_CHANNELS.map((ch) => (
                            <button
                                key={ch.id}
                                onClick={() => setSelectedChannel(ch)}
                                className={`w-full p-4 rounded-xl transition-all flex items-center gap-3 ${
                                    selectedChannel?.id === ch.id
                                        ? 'bg-[#1db954] text-black'
                                        : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Radio size={14} className={selectedChannel?.id === ch.id ? 'text-black' : 'text-[#1db954]'} />
                                <div className="text-left">
                                    <p className="text-sm font-black uppercase tracking-tight">{ch.name}</p>
                                    <p className="text-[9px] opacity-60">{ch.description}</p>
                                </div>
                                {selectedChannel?.id === ch.id && (
                                    <Play size={12} fill="currentColor" className="ml-auto" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Hero */}
                    {activeHero ? (
                        <section className="relative h-[40vh] md:h-[55vh] overflow-hidden">
                            <img
                                src={getImageUrl(activeHero.backdrop_path || activeHero.poster_path, 'original')}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover opacity-50 transition-opacity duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-transparent to-transparent"></div>
                            
                            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur rounded-full border border-white/10">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">LIVE</span>
                                </div>
                            </div>

                            <div className="absolute bottom-6 left-4 right-4 md:bottom-10 md:left-10 md:right-10 z-20">
                                <p className="text-[10px] font-bold text-[#1db954] uppercase tracking-widest mb-2">{selectedChannel.name}</p>
                                <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter text-white mb-3 leading-tight">
                                    {activeHero.name || activeHero.title}
                                </h1>
                                <p className="text-white/40 text-xs md:text-sm max-w-lg line-clamp-2 mb-4">{activeHero.overview}</p>
                                <Link to={`/watch/tv/${activeHero.id}`} className="inline-flex items-center gap-2 px-6 md:px-8 py-3 bg-[#ff4d4d] text-white rounded-lg font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-transform">
                                    <Play size={14} fill="white" /> Watch Now
                                </Link>
                            </div>
                        </section>
                    ) : (
                        <div className="h-[40vh] md:h-[55vh] bg-white/[0.02] animate-pulse"></div>
                    )}

                    {/* Content Grid */}
                    <section className="p-4 md:p-10">
                        <div className="flex items-center gap-3 mb-6 md:mb-10">
                            <div className="w-8 h-[2px] bg-[#ff4d4d]"></div>
                            <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter text-white">Shows on {selectedChannel.name}</h2>
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-auto">{items.length} shows</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => <MovieSkeleton key={i} />)
                            ) : (
                                items.slice(1).map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="animate-entrance" style={{ animationDelay: `${idx * 30}ms` }}>
                                        <MovieCard item={item} type="tv" />
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
