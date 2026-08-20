import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Loader2, Film, MessageCircle, ArrowLeft, Send, Share2, X, Check, Server, Sparkles, CheckCircle2, Search, Play, Tv, RefreshCw, Volume2, Shield } from 'lucide-react';
import { fetchApi, getImageUrl } from '../api';
import { getBackendUrl, createSmartSocket, PartyChannelFallback } from '../utils/backend';
import ServerSettingsModal from '../components/ServerSettingsModal';

const SERVERS = [
    { name: 'Vidlink', url: (id, t, s = 1, e = 1, lang = 'en') => t === 'movie' ? `https://vidlink.pro/movie/${id}?primaryColor=1db954&audio=${lang}&lang=${lang}&ds=${lang}` : `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=1db954&audio=${lang}&lang=${lang}&ds=${lang}` },
    { name: 'VidSrc', url: (id, t, s = 1, e = 1, lang = 'en') => t === 'movie' ? `https://vidsrc.me/embed/movie?tmdb=${id}&lang=${lang}` : `https://vidsrc.me/embed/tv?tmdb=${id}&sea=${s}&epi=${e}&lang=${lang}` },
    { name: 'VidSrc PRO', url: (id, t, s = 1, e = 1, lang = 'en') => t === 'movie' ? `https://vidsrc.pm/embed/movie/${id}?audio=${lang}` : `https://vidsrc.pm/embed/tv/${id}/${s}/${e}?audio=${lang}` },
    { name: 'Embed.su', url: (id, t, s = 1, e = 1, lang = 'en') => t === 'movie' ? `https://embed.su/embed/movie/${id}?audio=${lang}` : `https://embed.su/embed/tv/${id}/${s}/${e}?audio=${lang}` },
];

let socket = null;
let fallbackChannel = null;

export default function PartyRoomWaiting() {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    
    const [roomInfo, setRoomInfo] = useState(null);
    const [playingVideo, setPlayingVideo] = useState(null);
    const [activeServer, setActiveServer] = useState(0);
    const [currentSeason, setCurrentSeason] = useState(1);
    const [currentEpisode, setCurrentEpisode] = useState(1);
    const [episodesList, setEpisodesList] = useState([]);
    const [selectedAudio, setSelectedAudio] = useState('en');

    const [messages, setMessages] = useState([]);
    const [currentMsg, setCurrentMsg] = useState("");
    const [viewers, setViewers] = useState([]);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'info'
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [serverConnected, setServerConnected] = useState(false);
    const [showServerModal, setShowServerModal] = useState(false);
    const [copied, setCopied] = useState(false);

    // In-Room Search & Change Media Modal
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [trendingItems, setTrendingItems] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const lastVideoRef = useRef(null);
    const messagesEndRef = useRef(null);

    const isHost = sessionStorage.getItem('wp_isHost') === 'true';
    const username = sessionStorage.getItem('wp_username') || "Guest_" + Math.floor(1000 + Math.random() * 9000);

    // Load initial room data from backend or local storage cache
    useEffect(() => {
        const baseUrl = getBackendUrl();
        const formattedCode = (roomCode || '').toUpperCase();

        const loadFromData = (data) => {
            if (!data) return;
            setRoomInfo(data);
            const targetMedia = data.playing || data.media;
            if (targetMedia && targetMedia.id && targetMedia.type) {
                setPlayingVideo(targetMedia);
                if (targetMedia.season) setCurrentSeason(Number(targetMedia.season) || 1);
                if (targetMedia.episode) setCurrentEpisode(Number(targetMedia.episode) || 1);
                lastVideoRef.current = `${targetMedia.type}-${targetMedia.id}-${targetMedia.season || 1}-${targetMedia.episode || 1}`;
            }
        };

        fetch(`${baseUrl}/api/rooms/${formattedCode}`)
            .then(res => res.json())
            .then(roomData => {
                if (roomData && !roomData.error) {
                    loadFromData(roomData);
                } else {
                    try {
                        const localRooms = JSON.parse(localStorage.getItem('anicine_local_rooms') || '{}');
                        if (localRooms[formattedCode]) {
                            loadFromData(localRooms[formattedCode]);
                        }
                    } catch (e) {}
                }
            })
            .catch(() => {
                try {
                    const localRooms = JSON.parse(localStorage.getItem('anicine_local_rooms') || '{}');
                    if (localRooms[formattedCode]) {
                        loadFromData(localRooms[formattedCode]);
                    }
                } catch (e) {}
            });

        // Load trending items for quick in-room pick
        fetchApi('/trending/all/day')
            .then(data => {
                if (data?.results) {
                    setTrendingItems(data.results.filter(r => r.media_type !== 'person').slice(0, 8));
                }
            })
            .catch(() => {});
    }, [roomCode]);

    // Load episodes list when playing TV show
    useEffect(() => {
        if (playingVideo && playingVideo.type === 'tv' && playingVideo.id) {
            fetchApi(`/tv/${playingVideo.id}/season/${currentSeason}`)
                .then(data => {
                    if (data?.episodes) setEpisodesList(data.episodes);
                })
                .catch(() => setEpisodesList([]));
        } else {
            setEpisodesList([]);
        }
    }, [playingVideo, currentSeason]);

    // Setup Socket connection & BroadcastChannel fallback
    useEffect(() => {
        const formattedCode = (roomCode || '').toUpperCase();
        
        // Setup local broadcast channel for peer/multi-tab sync
        fallbackChannel = new PartyChannelFallback(formattedCode, username);
        
        fallbackChannel.on('receive_message', (msg) => {
            setMessages(prev => {
                if (prev.some(m => m.id === msg.id || (m.message === msg.message && m.author === msg.author && m.time === msg.time))) {
                    return prev;
                }
                return [...prev, msg];
            });
        });

        fallbackChannel.on('video_sync', (data) => {
            if (data && data.type && data.id) {
                const videoKey = `${data.type}-${data.id}-${data.season || 1}-${data.episode || 1}`;
                if (lastVideoRef.current !== videoKey) {
                    lastVideoRef.current = videoKey;
                    setPlayingVideo(data);
                    if (data.season) setCurrentSeason(Number(data.season) || 1);
                    if (data.episode) setCurrentEpisode(Number(data.episode) || 1);
                }
            }
        });

        // Setup Socket.io
        try {
            socket = createSmartSocket();
            if (socket) {
                socket.on('connect', () => {
                    setServerConnected(true);
                    socket.emit('join_room', { room: formattedCode, username });
                });

                socket.on('connect_error', () => {
                    setServerConnected(false);
                });

                socket.on('video_sync', (data) => {
                    if (data && data.type && data.id) {
                        const videoKey = `${data.type}-${data.id}-${data.season || 1}-${data.episode || 1}`;
                        if (lastVideoRef.current !== videoKey) {
                            lastVideoRef.current = videoKey;
                            setPlayingVideo(data);
                            if (data.season) setCurrentSeason(Number(data.season) || 1);
                            if (data.episode) setCurrentEpisode(Number(data.episode) || 1);
                        }
                    }
                });

                socket.on('receive_message', (msg) => {
                    setMessages(prev => {
                        if (prev.some(m => m.id === msg.id || (m.message === msg.message && m.author === msg.author && m.time === msg.time))) {
                            return prev;
                        }
                        return [...prev, msg];
                    });
                });

                socket.on('room_users', (users) => {
                    if (Array.isArray(users) && users.length > 0) {
                        setViewers(users);
                    }
                });

                socket.on('kicked', () => {
                    alert("You have been removed from the session by the host.");
                    navigate('/party');
                });
            }
        } catch (err) {
            setServerConnected(false);
        }

        // Initialize default viewer list with current user
        setViewers([{ id: 'self', username, isHost }]);

        return () => {
            if (socket) socket.disconnect();
            if (fallbackChannel) fallbackChannel.close();
        };
    }, [roomCode, username, isHost, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!currentMsg.trim()) return;
        const msgData = {
            id: Math.random().toString(36).substring(2, 9),
            room: roomCode,
            author: username,
            message: currentMsg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        if (socket && socket.connected) {
            socket.emit('send_message', msgData);
        }
        if (fallbackChannel) {
            fallbackChannel.emit('receive_message', msgData);
        }

        setMessages(prev => [...prev, msgData]);
        setCurrentMsg("");
    };

    const handleKick = (userId, targetUsername) => {
        if (window.confirm(`Are you sure you want to remove ${targetUsername}?`)) {
            if (socket && socket.connected) {
                socket.emit('kick_user', { room: roomCode, userId });
            }
            setViewers(prev => prev.filter(u => u.id !== userId));
        }
    };

    const handleInvite = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    // In-room media selection by host
    const handleSelectMediaInRoom = (item, seasonNum = 1, episodeNum = 1) => {
        const mediaData = {
            id: item.id,
            type: item.media_type || (item.first_air_date ? 'tv' : 'movie'),
            title: item.title || item.name || 'Stream',
            poster_path: item.poster_path || '',
            season: item.media_type === 'tv' || item.first_air_date ? seasonNum : null,
            episode: item.media_type === 'tv' || item.first_air_date ? episodeNum : null,
        };

        setPlayingVideo(mediaData);
        setCurrentSeason(seasonNum);
        setCurrentEpisode(episodeNum);
        setShowMediaModal(false);
        setSearchQuery('');
        setSearchResults([]);

        const videoKey = `${mediaData.type}-${mediaData.id}-${seasonNum}-${episodeNum}`;
        lastVideoRef.current = videoKey;

        // Broadcast to party room
        if (socket && socket.connected) {
            socket.emit('start_video', {
                room: (roomCode || '').toUpperCase(),
                ...mediaData
            });
        }
        if (fallbackChannel) {
            fallbackChannel.emit('video_sync', mediaData);
        }

        // Update local room cache
        try {
            const raw = localStorage.getItem('anicine_local_rooms');
            const map = raw ? JSON.parse(raw) : {};
            const code = (roomCode || '').toUpperCase();
            if (map[code]) {
                map[code].playing = mediaData;
                map[code].media = mediaData;
                localStorage.setItem('anicine_local_rooms', JSON.stringify(map));
            }
        } catch (e) {}
    };

    const handleEpisodeChange = (newEp) => {
        setCurrentEpisode(newEp);
        if (!playingVideo) return;
        const updated = { ...playingVideo, season: currentSeason, episode: newEp };
        setPlayingVideo(updated);
        
        if (isHost) {
            if (socket && socket.connected) {
                socket.emit('start_video', { room: (roomCode || '').toUpperCase(), ...updated });
            }
            if (fallbackChannel) {
                fallbackChannel.emit('video_sync', updated);
            }
        }
    };

    const handleSearch = async (q) => {
        setSearchQuery(q);
        if (q.length < 2) { 
            setSearchResults([]); 
            return; 
        }
        setIsSearching(true);
        try {
            const data = await fetchApi('/search/multi', { query: q });
            setSearchResults(data?.results?.filter(r => r.media_type !== 'person') || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    };

    const handleBack = () => {
        sessionStorage.removeItem('wp_room');
        sessionStorage.removeItem('wp_isHost');
        navigate('/party');
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#070707] text-white overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
            
            {/* Top Control Bar */}
            <header className="h-14 px-3 sm:px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0d0d0d] z-30 shadow-md">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <button 
                        onClick={handleBack} 
                        className="p-2 hover:bg-white/5 rounded-xl transition text-white/60 hover:text-white shrink-0"
                        title="Back to Watch Party Lobby"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="h-5 w-[1px] bg-white/10 shrink-0"></div>
                    <div className="truncate">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider font-['Syne',sans-serif] text-white">ROOM</span>
                            <span className="text-[#1db954] bg-[#1db954]/10 border border-[#1db954]/20 px-2 py-0.5 rounded-full text-xs font-mono font-black">{roomCode}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-white/40 font-bold uppercase tracking-wider truncate">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{viewers.length} Online</span>
                            <span>•</span>
                            <span className="text-white/30 truncate">{playingVideo?.title || 'Waiting for Stream'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Server status badge */}
                    <button
                        onClick={() => setShowServerModal(true)}
                        className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1.5 ${serverConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
                    >
                        <Server size={13} />
                        <span className="hidden md:inline">{serverConnected ? 'Cloud Active' : 'Offline Peer'}</span>
                    </button>

                    {/* Change Media Button for Host */}
                    {isHost && (
                        <button
                            onClick={() => setShowMediaModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1db954] hover:bg-emerald-400 text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-lg shadow-[#1db954]/20 active:scale-95 cursor-pointer"
                        >
                            <Film size={13} />
                            <span className="hidden sm:inline">{playingVideo ? 'Change Media' : 'Pick Movie/Show'}</span>
                        </button>
                    )}

                    {/* Invite Copy Button */}
                    <button
                        onClick={handleInvite}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition border ${copied ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-white/70 hover:text-white'}`}
                    >
                        {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                        <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Invite'}</span>
                    </button>

                    {/* Chat Toggle Button */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`p-2 rounded-xl transition ${isSidebarOpen ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
                        title="Toggle Chat"
                    >
                        <MessageCircle size={17} />
                    </button>
                </div>
            </header>

            {/* Main Stage & Chat Layout */}
            <div className="flex flex-1 overflow-hidden relative">
                
                {/* Cinema Screen Stage */}
                <main className="flex-1 flex flex-col min-w-0 bg-black overflow-y-auto custom-scrollbar">
                    {playingVideo && playingVideo.id ? (
                        <div className="flex flex-col h-full">
                            {/* Video Player Frame Container */}
                            <div className="w-full bg-black relative flex-1 min-h-[260px] sm:min-h-[380px] lg:min-h-[440px] max-h-[75vh] flex items-center justify-center">
                                <iframe
                                    key={`${activeServer}-${playingVideo.id}-${currentSeason}-${currentEpisode}-${selectedAudio}`}
                                    src={SERVERS[activeServer]?.url(
                                        playingVideo.id, 
                                        playingVideo.type, 
                                        currentSeason, 
                                        currentEpisode, 
                                        selectedAudio
                                    )}
                                    className="w-full h-full border-none"
                                    allowFullScreen
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    title="Watch Party Player"
                                ></iframe>
                            </div>

                            {/* Cinema Bar & Controls under player */}
                            <div className="p-4 sm:p-5 bg-[#0d0d0d] border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/20 text-[9px] font-black uppercase">
                                            {playingVideo.type === 'tv' ? `S${currentSeason} : E${currentEpisode}` : 'MOVIE'}
                                        </span>
                                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                                            Station: {SERVERS[activeServer]?.name}
                                        </span>
                                    </div>
                                    <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-white truncate font-['Syne',sans-serif]">
                                        {playingVideo.title || 'Live Party Stream'}
                                    </h2>
                                </div>

                                {/* Server Switcher Buttons */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30 mr-1 hidden sm:inline">Server:</span>
                                    {SERVERS.map((srv, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveServer(idx)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${activeServer === idx ? 'bg-[#1db954] text-black shadow-md' : 'bg-white/5 text-white/50 hover:text-white border border-white/5'}`}
                                        >
                                            {srv.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* TV Show Episode Picker (if TV series) */}
                            {playingVideo.type === 'tv' && episodesList.length > 0 && (
                                <div className="p-4 bg-[#090909] border-t border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2.5">
                                        Episodes (Season {currentSeason})
                                    </p>
                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                        {episodesList.map((ep) => (
                                            <button
                                                key={ep.id}
                                                onClick={() => handleEpisodeChange(ep.episode_number)}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${currentEpisode === ep.episode_number ? 'bg-[#1db954] text-black font-black' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'}`}
                                            >
                                                <span>EP {ep.episode_number}</span>
                                                <span className="text-[10px] opacity-70 truncate max-w-[120px]">{ep.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Empty / Waiting Stage */
                        <div className="h-full flex flex-col items-center justify-center p-6 sm:p-12 text-center">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-[#1db954]/20 blur-3xl rounded-full"></div>
                                <div className="relative w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-[#1db954] shadow-2xl">
                                    <Film size={32} />
                                </div>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-2 font-['Syne',sans-serif]">
                                {isHost ? "Ready to Stream" : "Waiting for Host"}
                            </h2>
                            <p className="text-white/40 max-w-md text-xs sm:text-sm leading-relaxed mb-6">
                                {isHost
                                    ? "Select any movie, anime, or series to start broadcasting immediately to everyone in this room."
                                    : "The host has not started a video yet. Chat with others while you wait!"}
                            </p>

                            {isHost && (
                                <button
                                    onClick={() => setShowMediaModal(true)}
                                    className="px-8 py-3.5 bg-[#1db954] hover:bg-emerald-400 text-black rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-xl shadow-[#1db954]/20 active:scale-95 flex items-center gap-2 cursor-pointer"
                                >
                                    <Search size={16} /> Choose Movie / Anime / Series
                                </button>
                            )}
                        </div>
                    )}
                </main>

                {/* Right Chat & Viewers Sidebar */}
                <aside className={`
                    ${isSidebarOpen ? 'w-full sm:w-80 md:w-96 flex' : 'hidden'}
                    border-l border-white/5 bg-[#0c0c0c] flex-col shrink-0 z-20 transition-all duration-300
                    h-full
                `}>
                    {/* Sidebar Tabs */}
                    <div className="p-3 border-b border-white/5 flex items-center justify-between gap-2 bg-[#111111]">
                        <div className="flex gap-1.5 flex-1">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${activeTab === 'chat' ? 'bg-[#1db954] text-black' : 'bg-white/5 text-white/50 hover:text-white'}`}
                            >
                                <MessageCircle size={13} /> Chat
                            </button>
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${activeTab === 'info' ? 'bg-[#1db954] text-black' : 'bg-white/5 text-white/50 hover:text-white'}`}
                            >
                                <Users size={13} /> Viewers ({viewers.length})
                            </button>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {/* Chat Content */}
                    {activeTab === 'chat' ? (
                        <div className="flex-1 flex flex-col min-h-0 bg-[#090909]">
                            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-white/30">
                                        <MessageCircle size={28} className="mb-2 opacity-40 text-[#1db954]" />
                                        <p className="text-xs font-bold text-white/60">Party Chat is Ready</p>
                                        <p className="text-[10px] mt-1 text-white/30">Send a message to everyone in the room!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div key={idx} className={`flex flex-col ${msg.author === username ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-1.5 mb-1 px-1">
                                                <span className="text-[10px] font-bold text-white/60">{msg.author}</span>
                                                <span className="text-[9px] text-white/30">{msg.time}</span>
                                            </div>
                                            <div className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed max-w-[88%] font-medium ${msg.author === 'System' ? 'bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/20 w-full text-center text-[10px]' : msg.author === username ? 'bg-[#1db954] text-black font-semibold' : 'bg-white/5 text-white border border-white/5'}`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message input */}
                            <form onSubmit={handleSendMessage} className="p-3 bg-[#0d0d0d] border-t border-white/5 flex gap-2">
                                <input
                                    type="text"
                                    value={currentMsg}
                                    onChange={(e) => setCurrentMsg(e.target.value)}
                                    placeholder="Send a message..."
                                    className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-[#1db954]/50 transition text-xs"
                                />
                                <button
                                    type="submit"
                                    className="w-9 h-9 rounded-xl bg-[#1db954] text-black flex items-center justify-center transition hover:bg-emerald-400 active:scale-95 shrink-0 shadow-md shadow-[#1db954]/20"
                                >
                                    <Send size={14} />
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* Viewers Content */
                        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar bg-[#090909]">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2 px-1">Active Room Participants</p>
                            {viewers.map((u, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-[#1db954]/20 border border-[#1db954]/30 flex items-center justify-center text-[#1db954] font-black text-xs shrink-0">
                                            {u.username?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="truncate">
                                            <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                                {u.username}
                                                {u.isHost && (
                                                    <span className="text-[8px] bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/20 px-1.5 py-0.2 rounded font-black uppercase">HOST</span>
                                                )}
                                            </p>
                                            <p className="text-[9px] text-white/40">In Room</p>
                                        </div>
                                    </div>
                                    {isHost && !u.isHost && u.id !== 'self' && (
                                        <button
                                            onClick={() => handleKick(u.id, u.username)}
                                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition text-[10px] font-bold"
                                            title="Dismiss User"
                                        >
                                            Kick
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
            </div>

            {/* In-Room Select / Change Media Modal */}
            {showMediaModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
                    <div className="bg-[#111111] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#161616]">
                            <div className="flex items-center gap-2">
                                <Film size={18} className="text-[#1db954]" />
                                <h3 className="text-sm font-black uppercase tracking-tight text-white font-['Syne',sans-serif]">Choose Stream for Party</h3>
                            </div>
                            <button onClick={() => setShowMediaModal(false)} className="p-1 text-white/40 hover:text-white transition">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-4 border-b border-white/5 bg-[#0f0f0f]">
                            <div className="relative">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search movies, anime, TV shows by title..."
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[#1db954]/50 transition text-xs font-medium"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Results or Trending */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 bg-[#0a0a0a]">
                            {isSearching ? (
                                <div className="py-12 flex flex-col items-center justify-center text-white/40">
                                    <Loader2 className="animate-spin mb-2" size={24} />
                                    <span className="text-xs">Searching library...</span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Search Results</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {searchResults.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSelectMediaInRoom(item)}
                                                className="group p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#1db954]/50 transition flex flex-col text-left cursor-pointer"
                                            >
                                                <div className="aspect-[2/3] w-full rounded-xl overflow-hidden mb-2 bg-black relative">
                                                    {item.poster_path ? (
                                                        <img src={getImageUrl(item.poster_path, 'w300')} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No Poster</div>
                                                    )}
                                                </div>
                                                <span className="text-[8px] font-black uppercase text-[#1db954] mb-0.5">{item.media_type || 'Movie'}</span>
                                                <h4 className="text-xs font-bold text-white truncate group-hover:text-[#1db954] transition-colors">{item.title || item.name}</h4>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Trending Right Now</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {trendingItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSelectMediaInRoom(item)}
                                                className="group p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#1db954]/50 transition flex flex-col text-left cursor-pointer"
                                            >
                                                <div className="aspect-[2/3] w-full rounded-xl overflow-hidden mb-2 bg-black relative">
                                                    {item.poster_path ? (
                                                        <img src={getImageUrl(item.poster_path, 'w300')} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No Poster</div>
                                                    )}
                                                </div>
                                                <span className="text-[8px] font-black uppercase text-[#1db954] mb-0.5">{item.media_type || 'Movie'}</span>
                                                <h4 className="text-xs font-bold text-white truncate group-hover:text-[#1db954] transition-colors">{item.title || item.name}</h4>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Server Settings Modal */}
            <ServerSettingsModal 
                isOpen={showServerModal} 
                onClose={() => setShowServerModal(false)}
                onSaved={() => {
                    window.location.reload();
                }}
            />
        </div>
    );
}
