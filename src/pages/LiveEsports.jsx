import React, { useState, useEffect } from 'react';
import { Play, Calendar, Trophy, Gamepad2, ArrowRight, CircleDot, MonitorPlay, Users, Loader2 } from 'lucide-react';
import { fetchYouTube } from '../api';

export default function LiveEsports() {
    const [selectedGame, setSelectedGame] = useState('Valorant');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);
    
    const games = ['Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Rocket League', 'Free Fire', 'BGMI'];
    
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        fetchYouTube(`${selectedGame} esports tournament live highlights`).then(data => {
            if (isMounted) {
                setVideos(data || []);
                setLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, [selectedGame]);

    const handleWatchVideo = (videoId) => {
        setActiveVideo(videoId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-8 pb-40 px-6 md:px-12 lg:px-20 overflow-hidden text-white font-sans">
            <div className="max-w-[1920px] mx-auto space-y-16">
                
                {/* Header & Live Player Placeholder */}
                <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.1)] group">
                    <div className="block w-full h-[50vh] md:h-[75vh]">
                        {activeVideo ? (
                            <div className="relative w-full h-full z-20">
                                <iframe 
                                    src={`https://yewtu.be/embed/${activeVideo}?autoplay=1`} 
                                    className="absolute inset-0 w-full h-full"
                                    allow="autoplay; fullscreen; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                                <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
                                    <button onClick={() => window.open(`https://www.youtube.com/watch?v=${activeVideo}`, '_blank')} className="bg-black/60 backdrop-blur-md hover:bg-black text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/20 transition-all flex items-center gap-2 shadow-xl">
                                        Open on YouTube
                                    </button>
                                    <button onClick={() => setActiveVideo(null)} className="bg-black/60 backdrop-blur-md hover:bg-[#a855f7] hover:text-white text-white w-8 h-8 rounded-xl flex items-center justify-center border border-white/20 transition-all shadow-xl font-bold">
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
                                <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000" alt="Live Esports" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                                
                                <div className="absolute inset-0 z-15 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGwyNC0yNHYyaDE0djdIMjBWMjBIMTRWNmgyMnYxNEgzNnYxNGoiIGZpbGw9IiM5QzI3QjAiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')] opacity-50 mix-blend-overlay"></div>

                                <div className="absolute inset-0 z-30 flex flex-col justify-end p-8 md:p-16">
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="flex items-center gap-2 bg-[#a855f7] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.6)]">
                                            <CircleDot size={12} /> Live Event
                                        </span>
                                        <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Gamepad2 size={12} className="text-[#a855f7]" /> {selectedGame || 'Valorant'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
                                        <div className="max-w-3xl">
                                            <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#a855f7]">
                                                Global Masters
                                            </h1>
                                            <p className="text-white/60 text-sm md:text-lg font-medium leading-relaxed">
                                                The ultimate international showdown. Watch top tier teams clash for the global title and championship points.
                                            </p>
                                        </div>
                                    </div>

                                    {videos.length > 0 && (
                                        <button onClick={() => handleWatchVideo(videos[0].videoId)} className="w-fit flex items-center gap-4 bg-[#a855f7] hover:bg-white hover:text-[#a855f7] text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl shadow-[#a855f7]/30 active:scale-95 group/btn border border-[#a855f7]/50 lg:hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]">
                                            <Play size={16} fill="currentColor" className="group-hover/btn:scale-110 transition-transform" /> Watch Latest Top VOD
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Games Filter & Repos */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <h2 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
                            <Trophy className="text-[#a855f7]" /> {selectedGame} Tournaments & VODs
                        </h2>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 hide-scrollbar overflow-x-auto w-full md:w-auto">
                            {games.map(game => (
                                <button
                                    key={game}
                                    onClick={() => setSelectedGame(game)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                        selectedGame === game 
                                            ? 'bg-gradient-to-r from-[#a855f7] to-[#c084fc] text-white shadow-lg shadow-[#a855f7]/30 border border-transparent' 
                                            : 'text-white/40 border border-transparent hover:text-white hover:bg-white/5 hover:border-white/10'
                                    }`}
                                >
                                    {game}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-[#a855f7] animate-pulse">
                             <Loader2 size={32} className="animate-spin mb-4" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Fetching YouTube VODs...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {videos.map((video, idx) => (
                                <div key={video.videoId} onClick={() => handleWatchVideo(video.videoId)} className="cursor-pointer group relative bg-[#121212] rounded-[2rem] border border-white/5 overflow-hidden hover:border-[#a855f7]/50 transition-colors duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="aspect-[16/9] relative overflow-hidden bg-black">
                                         <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-[#a855f7] border border-[#a855f7]/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                             {selectedGame}
                                         </div>
                                        <div className="absolute inset-0 bg-[#a855f7]/20 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10 duration-500"></div>
                                        <img src={video.thumbnail || video.image} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                                        <div className="absolute bottom-4 right-4 z-20 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-white border border-white/10 flex items-center gap-1">
                                            {video.timestamp || 'VOD'}
                                        </div>
                                        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500 delay-100 group-hover:bg-[#a855f7]">
                                                <Play size={24} fill="currentColor" className="ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4 relative z-20 bg-gradient-to-t from-[#0a0a0a] to-[#121212]">
                                        <div className="flex items-center gap-3 text-white/40 text-[9px] font-black uppercase tracking-widest">
                                            <Calendar size={12} className="text-white/20" /> {video.ago || 'Recently added'}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase italic tracking-tight mb-2 group-hover:text-[#a855f7] transition-colors line-clamp-2">{video.title}</h3>
                                            <p className="text-[#a855f7]/80 text-xs font-bold uppercase tracking-widest group-hover:text-[#a855f7] transition-colors">{video.author?.name || 'YouTube'}</p>
                                        </div>
                                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-widest">
                                                <Users size={14} className="text-[#a855f7]" /> {video.views > 1000 ? `${(video.views/1000).toFixed(1)}K` : video.views || 'Many'} Views
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
