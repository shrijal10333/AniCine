import React, { useState, useEffect } from 'react';
import { Play, Calendar, Trophy, MapPin, ArrowRight, CircleDot, Flag, Loader2 } from 'lucide-react';
import { fetchYouTube } from '../api';

export default function LiveF1() {
    const [selectedSeason, setSelectedSeason] = useState('2024');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);
    
    const seasons = ['2024', '2023', '2022', '2021', '2020'];
    
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        fetchYouTube(`Formula 1 full race highlights f1 live ${selectedSeason}`).then(data => {
            if (isMounted) {
                setVideos(data || []);
                setLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, [selectedSeason]);

    const handleWatchVideo = (videoId) => {
        setActiveVideo(videoId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-8 pb-40 px-6 md:px-12 lg:px-20 overflow-hidden text-white font-sans">
            <div className="max-w-[1920px] mx-auto space-y-16">
                
                {/* Header & Live Player Placeholder */}
                <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(225,6,0,0.1)] group">
                    <div className="block w-full h-[50vh] md:h-[70vh]">
                        {activeVideo ? (
                            <div className="relative w-full h-full z-20 flex flex-col items-center justify-center">
                                <div className="absolute inset-0 bg-black/80 z-10"></div>
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1622200294715-9c98ba8b42fc?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-30 blur-xl"></div>
                                
                                <div className="relative z-30 flex flex-col items-center gap-6 text-center px-6 md:px-12">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-2 shadow-[0_0_50px_rgba(225,6,0,0.2)]">
                                        <Play size={32} className="text-[#e10600] ml-2" fill="currentColor" />
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">Native Player<br/>Coming Soon...</h2>
                                    <p className="text-white/60 max-w-lg font-medium text-sm md:text-base">To bypass Formula 1 publisher restrictions, we are building a custom stream proxy. For now, enjoy the full broadcast directly on YouTube.</p>
                                    
                                    <div className="flex flex-col md:flex-row gap-4 mt-6">
                                        <button onClick={() => window.open(`https://www.youtube.com/watch?v=${activeVideo}`, '_blank')} className="bg-[#e10600] hover:bg-white text-white hover:text-[#e10600] px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-[#e10600]/30 active:scale-95 flex items-center justify-center gap-3">
                                            Continue Watching on YT <ArrowRight size={14} />
                                        </button>
                                        <button onClick={() => setActiveVideo(null)} className="px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 flex items-center justify-center">
                                            Go Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
                                <img src="https://images.unsplash.com/photo-1622200294715-9c98ba8b42fc?auto=format&fit=crop&q=80&w=2000" alt="F1 Racing" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                    
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-16">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="flex items-center gap-2 bg-[#e10600] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_20px_rgba(225,6,0,0.6)]">
                                <CircleDot size={12} /> Live Now
                            </span>
                            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {selectedSeason} Events
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                            Grand Prix
                        </h1>
                        <p className="text-white/60 text-sm md:text-lg max-w-2xl mb-8 font-medium">
                            Experience the thrill of the Formula 1 World Championship. Feel the speed.
                        </p>
                        
                                    {videos.length > 0 && (
                                        <button onClick={() => handleWatchVideo(videos[0].videoId)} className="w-fit flex items-center gap-4 bg-[#e10600] hover:bg-white hover:text-[#e10600] text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl shadow-[#e10600]/30 active:scale-95 group/btn border border-[#e10600]/50 lg:hover:shadow-[0_0_40px_rgba(225,6,0,0.6)]">
                                            <Play size={16} fill="currentColor" className="group-hover/btn:scale-110 transition-transform" /> Watch Latest VOD
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Seasons Filter & Content */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <h2 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
                            <Flag className="text-[#e10600]" /> Race Replays & Highlights
                        </h2>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 hide-scrollbar overflow-x-auto w-full md:w-auto">
                            {seasons.map(season => (
                                <button
                                    key={season}
                                    onClick={() => setSelectedSeason(season)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                        selectedSeason === season 
                                            ? 'bg-[#e10600] text-white shadow-lg shadow-[#e10600]/30' 
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {season}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-[#e10600] animate-pulse">
                             <Loader2 size={32} className="animate-spin mb-4" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Fetching F1 Database...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {videos.map((video, idx) => (
                                <div key={video.videoId} onClick={() => handleWatchVideo(video.videoId)} className="cursor-pointer group relative bg-[#121212] rounded-[2rem] border border-white/5 overflow-hidden hover:border-[#e10600]/50 transition-colors duration-500 hover:shadow-[0_0_30px_rgba(225,6,0,0.15)] overflow-hidden" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="aspect-[16/9] relative overflow-hidden bg-black">
                                         <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white border border-white/10">
                                             YouTube
                                         </div>
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                                        <img src={video.thumbnail || video.image} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
                                        <div className="absolute bottom-4 right-4 z-20 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-white border border-white/10 flex items-center gap-1">
                                            {video.timestamp || 'VOD'}
                                        </div>
                                        <button className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-16 h-16 rounded-full bg-[#e10600] text-white flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500 delay-100">
                                                <Play size={24} fill="currentColor" className="ml-1" />
                                            </div>
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4 relative z-20 bg-gradient-to-t from-[#121212] via-[#121212] to-transparent">
                                        <div className="flex items-center gap-3 text-white/40 text-[9px] font-black uppercase tracking-widest">
                                            <Calendar size={12} className="text-[#e10600]" /> {video.ago || 'Recently added'}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase italic tracking-tight mb-1 group-hover:text-[#e10600] transition-colors line-clamp-2">{video.title}</h3>
                                            <p className="text-white/40 text-xs flex items-center gap-2 truncate">{video.author?.name || 'YouTube'}</p>
                                        </div>
                                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-bold text-white/80 uppercase tracking-tight">
                                                <Trophy size={14} className="text-[#fbbf24]" /> Views: {video.views > 1000 ? `${(video.views/1000).toFixed(1)}K` : video.views || 'Many'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
