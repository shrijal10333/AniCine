import React, { useEffect, useState, useRef } from 'react';
import { fetchApi, getImageUrl } from '../api';
import { Heart, MessageCircle, Share2, Play, Music2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Feed() {
    const [videos, setVideos] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                setLoading(true);
                // Fetch popular movies to populate the feed
                const data = await fetchApi('/trending/all/day');
                const results = data.results.slice(0, 15);
                
                // For each result, try to get a trailer
                const feedItems = await Promise.all(results.map(async (item) => {
                    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                    const videoData = await fetchApi(`/${type}/${item.id}/videos`);
                    const trailer = videoData.results.find(v => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube');
                    return {
                        ...item,
                        trailerId: trailer ? trailer.key : null,
                        type: type
                    };
                }));

                // Filter out items without trailers
                setVideos(feedItems.filter(v => v.trailerId));
            } catch (err) {
                console.error("Feed failure:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    const handleScroll = (e) => {
        const index = Math.round(e.target.scrollTop / window.innerHeight);
        if (index !== activeIndex) setActiveIndex(index);
    };

    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center font-black italic uppercase tracking-tighter text-white/20 animate-pulse">
            ANICINE_FEED_LOADING...
        </div>
    );

    return (
        <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="h-screen bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar selection:bg-[#ff4d4d]"
        >
            {videos.map((video, idx) => (
                <div key={video.id} className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden">
                    {/* Video Background */}
                    <div className="absolute inset-0 z-0 bg-black">
                        <img 
                            src={getImageUrl(video.backdrop_path || video.poster_path, 'original')} 
                            alt="" 
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${activeIndex === idx ? 'opacity-20' : 'opacity-40'}`} 
                        />
                        {activeIndex === idx && (
                            <iframe 
                                src={`https://www.youtube.com/embed/${video.trailerId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.trailerId}&modestbranding=1&rel=0&showinfo=0`}
                                className="absolute inset-0 w-full h-full scale-[1.7] brightness-[0.4]"
                                allow="autoplay; fullscreen; picture-in-picture"
                                title={video.title || video.name}
                            ></iframe>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60"></div>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-16 md:bottom-20 left-4 md:left-20 right-16 md:right-24 z-20">
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-3 md:mb-6">
                            <div className="px-3 md:px-4 py-1 md:py-1.5 bg-[#ff4d4d] rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white shadow-2xl animate-pulse">
                                Trending Now
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-6xl lg:text-8xl font-black italic uppercase tracking-tighter text-white mb-2 md:mb-6 leading-[0.85] drop-shadow-2xl line-clamp-2">
                            {video.title || video.name}
                        </h2>
                        <p className="text-white/40 text-xs md:text-lg font-medium leading-relaxed max-w-xl line-clamp-2 md:line-clamp-3 mb-4 md:mb-12 italic hidden sm:block">
                            {video.overview}
                        </p>
                        
                        <div className="flex items-center gap-3 md:gap-6">
                            <Link to={`/watch/${video.type}/${video.id}`} className="px-6 md:px-12 py-3 md:py-5 bg-[#ff4d4d] text-white rounded-full font-black uppercase tracking-widest text-[9px] md:text-[11px] shadow-[0_0_30px_rgba(255,77,77,0.3)] hover:scale-105 transition-all">
                                Watch Now
                            </Link>
                            <button className="p-3 md:p-5 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 hover:border-[#ff4d4d] transition-all">
                                <Info size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Interaction Sidebar (TikTok Style) */}
                    <div className="absolute right-3 md:right-12 bottom-24 md:bottom-32 z-30 flex flex-col items-center gap-5 md:gap-10">
                        <div className="flex flex-col items-center gap-1 md:gap-2 group cursor-pointer">
                            <div className="w-11 md:w-16 h-11 md:h-16 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#ff4d4d] hover:border-[#ff4d4d] hover:scale-110 transition-all shadow-xl">
                                <Heart size={20} className="md:w-7 md:h-7" />
                            </div>
                            <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">8.4k</span>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1 md:gap-2 group cursor-pointer">
                            <div className="w-11 md:w-16 h-11 md:h-16 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black hover:scale-110 transition-all shadow-xl">
                                <MessageCircle size={20} className="md:w-7 md:h-7" />
                            </div>
                            <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">2.1k</span>
                        </div>

                        <div className="flex flex-col items-center gap-1 md:gap-2 group cursor-pointer">
                            <div className="w-11 md:w-16 h-11 md:h-16 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all shadow-xl">
                                <Share2 size={20} className="md:w-7 md:h-7" />
                            </div>
                            <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">Share</span>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 flex flex-col gap-2 md:gap-3 z-30 hidden sm:flex">
                        {videos.map((_, i) => (
                            <div 
                                key={i}
                                className={`w-1 transition-all duration-500 rounded-full ${i === activeIndex ? 'h-8 md:h-12 bg-[#ff4d4d] shadow-[0_0_15px_#ff4d4d]' : 'h-1.5 bg-white/20'}`}
                            ></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
