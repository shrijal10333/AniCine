import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogIn, Plus, Lock, Unlock, PlayCircle, EyeOff, Eye, Search, X, Loader2, RefreshCw, Calendar, MessageCircle, Sparkles, Film, Tv, Shield, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApi, getImageUrl } from '../api';
import { getBackendUrl, createSmartSocket } from '../utils/backend';
import ServerSettingsModal from '../components/ServerSettingsModal';

let socket = null;

export default function WatchPartyLobby() {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [showCreatePassword, setShowCreatePassword] = useState(false);

    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [serverConnected, setServerConnected] = useState(false);
    const [showServerModal, setShowServerModal] = useState(false);

    const [activeRooms, setActiveRooms] = useState([]);
    const [promptRoom, setPromptRoom] = useState(null);

    // Create Room Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [trendingItems, setTrendingItems] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(1);
    const [episodesList, setEpisodesList] = useState([]);
    const [isPrivate, setIsPrivate] = useState(false);
    const [customRoomName, setCustomRoomName] = useState('');

    const { user } = useAuth();

    const loadLocalRooms = () => {
        try {
            const raw = localStorage.getItem('anicine_local_rooms');
            if (raw) {
                const map = JSON.parse(raw);
                return Object.values(map);
            }
        } catch (e) {}
        return [];
    };

    const saveLocalRoom = (room) => {
        try {
            const raw = localStorage.getItem('anicine_local_rooms');
            const map = raw ? JSON.parse(raw) : {};
            map[room.id] = room;
            localStorage.setItem('anicine_local_rooms', JSON.stringify(map));
        } catch (e) {}
    };

    useEffect(() => {
        try {
            socket = createSmartSocket();
            if (socket) {
                socket.on('connect', () => setServerConnected(true));
                socket.on('connect_error', () => setServerConnected(false));

                socket.on('rooms_updated', (rooms) => {
                    if (Array.isArray(rooms)) setActiveRooms(rooms);
                });
            }
        } catch (err) {
            setServerConnected(false);
        }

        const baseUrl = getBackendUrl();
        fetch(`${baseUrl}/api/rooms`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setActiveRooms(data);
                    setServerConnected(true);
                } else {
                    const fallbackRooms = loadLocalRooms();
                    if (fallbackRooms.length > 0) setActiveRooms(fallbackRooms);
                }
            })
            .catch(() => {
                const fallbackRooms = loadLocalRooms();
                if (fallbackRooms.length > 0) setActiveRooms(fallbackRooms);
            });

        // Fetch trending items for quick room selection
        fetchApi('/trending/all/day')
            .then(data => {
                if (data?.results) {
                    setTrendingItems(data.results.filter(r => r.media_type !== 'person').slice(0, 9));
                }
            })
            .catch(console.error);

        return () => { if (socket) socket.disconnect(); };
    }, []);

    const getFinalUsername = () => {
        return user ? user.name : (username.trim() || 'Guest_' + Math.floor(1000 + Math.random() * 9000));
    };

    const handleRefresh = () => {
        const baseUrl = getBackendUrl();
        fetch(`${baseUrl}/api/rooms`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setActiveRooms(data);
                    setServerConnected(true);
                }
            })
            .catch(() => {
                const fallbackRooms = loadLocalRooms();
                setActiveRooms(fallbackRooms);
            });
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

    const handleSelectMedia = async (media) => {
        setSelectedMedia(media);
        setCustomRoomName(media.title || media.name || '');
        if (media.media_type === 'tv') {
            try {
                const data = await fetchApi(`/tv/${media.id}/season/1`);
                setEpisodesList(data?.episodes || []);
            } catch (e) {
                setEpisodesList([]);
            }
        }
    };

    const handleCreateRoom = async (mediaOverride) => {
        setError('');
        setIsCreating(true);
        const finalUsername = getFinalUsername();
        const mediaToUse = mediaOverride !== undefined ? mediaOverride : selectedMedia;

        let mediaData = null;
        if (mediaToUse) {
            mediaData = {
                id: mediaToUse.id,
                type: mediaToUse.media_type || (mediaToUse.first_air_date ? 'tv' : 'movie'),
                title: mediaToUse.title || mediaToUse.name || 'Featured Stream',
                poster_path: mediaToUse.poster_path || '',
                season: mediaToUse.media_type === 'tv' ? selectedSeason : null,
                episode: mediaToUse.media_type === 'tv' ? selectedEpisode : null
            };
        }

        const roomTitle = customRoomName.trim() || (mediaData ? `${finalUsername}'s ${mediaData.title}` : `${finalUsername}'s Lounge`);

        try {
            const baseUrl = getBackendUrl();
            const res = await fetch(`${baseUrl}/api/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomName: roomTitle,
                    host: finalUsername,
                    password: isPrivate ? createPassword.trim() : '',
                    media: mediaData
                })
            });
            const data = await res.json();

            if (res.ok && data?.room?.id) {
                saveLocalRoom({
                    id: data.room.id,
                    roomName: roomTitle,
                    host: finalUsername,
                    hasPassword: isPrivate,
                    password: isPrivate ? createPassword.trim() : '',
                    media: mediaData,
                    viewers: 1
                });
                sessionStorage.setItem('wp_username', finalUsername);
                sessionStorage.setItem('wp_room', data.room.id);
                sessionStorage.setItem('wp_isHost', 'true');
                navigate('/party/room/' + data.room.id);
                return;
            }
        } catch (err) {
            console.warn('Backend unavailable, creating local room session:', err);
        }

        // Fallback direct room creation for Vercel/offline mode
        const fallbackId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const fallbackRoom = {
            id: fallbackId,
            roomName: roomTitle,
            host: finalUsername,
            hasPassword: isPrivate,
            password: isPrivate ? createPassword.trim() : '',
            media: mediaData,
            viewers: 1
        };
        saveLocalRoom(fallbackRoom);
        sessionStorage.setItem('wp_username', finalUsername);
        sessionStorage.setItem('wp_room', fallbackId);
        sessionStorage.setItem('wp_isHost', 'true');
        navigate('/party/room/' + fallbackId);
        setIsCreating(false);
    };

    const attemptJoinRoom = async (code, pass = '') => {
        setError('');
        setPasswordError('');
        const finalUsername = getFinalUsername();
        const formattedCode = code.trim().toUpperCase();

        try {
            const baseUrl = getBackendUrl();
            const res = await fetch(`${baseUrl}/api/rooms/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ room: formattedCode, password: pass })
            });
            const data = await res.json();

            if (res.ok) {
                sessionStorage.setItem('wp_username', finalUsername);
                sessionStorage.setItem('wp_room', formattedCode);
                sessionStorage.setItem('wp_isHost', 'false');
                navigate('/party/room/' + formattedCode);
                return;
            } else if (res.status === 401) {
                setPasswordError('Incorrect password. Please try again.');
                setPromptRoom(formattedCode);
                return;
            }
        } catch (err) {
            // Check local rooms
            try {
                const raw = localStorage.getItem('anicine_local_rooms');
                if (raw) {
                    const map = JSON.parse(raw);
                    const found = map[formattedCode];
                    if (found && found.hasPassword && found.password && found.password !== pass) {
                        setPasswordError('Incorrect password. Please try again.');
                        setPromptRoom(formattedCode);
                        return;
                    }
                }
            } catch (e) {}
        }

        // Direct navigation fallback
        sessionStorage.setItem('wp_username', finalUsername);
        sessionStorage.setItem('wp_room', formattedCode);
        sessionStorage.setItem('wp_isHost', 'false');
        navigate('/party/room/' + formattedCode);
    };

    const handleJoinWithCode = (e) => {
        e.preventDefault();
        if (!roomCode.trim()) { setError('Please enter a room code.'); return; }
        attemptJoinRoom(roomCode);
    };

    const handleJoinClickFromList = (room) => {
        if (room.hasPassword) {
            setPromptRoom(room.id);
            setJoinPassword('');
            setPasswordError('');
        } else {
            attemptJoinRoom(room.id);
        }
    };

    const submitPasswordPrompt = (e) => {
        e.preventDefault();
        attemptJoinRoom(promptRoom, joinPassword);
    };

    return (
        <div className="min-h-screen bg-[#080808] px-4 md:px-8 lg:px-16 pb-24 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="max-w-[1400px] mx-auto">
                
                {/* Password Prompt Modal */}
                {promptRoom && (
                    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
                        <div className="bg-[#121212] border border-white/10 p-8 rounded-2xl max-w-sm w-full shadow-2xl">
                            <div className="w-12 h-12 rounded-2xl bg-[#ff4d4d]/10 border border-[#ff4d4d]/20 flex items-center justify-center mx-auto mb-4">
                                <Lock size={24} className="text-[#ff4d4d]" />
                            </div>
                            <h3 className="text-xl font-black text-center mb-1 uppercase tracking-tight text-white font-['Syne',sans-serif]">Private Room</h3>
                            <p className="text-white/40 text-center text-xs mb-6">Enter password to join room {promptRoom}</p>

                            <form onSubmit={submitPasswordPrompt} className="space-y-4">
                                <input
                                    type="password"
                                    placeholder="Enter Room Password"
                                    value={joinPassword}
                                    onChange={e => setJoinPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-[#1db954]/50 text-sm text-white text-center transition"
                                    autoFocus
                                />
                                {passwordError && <p className="text-red-400 text-xs text-center">{passwordError}</p>}
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setPromptRoom(null)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl bg-[#1db954] hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition shadow-lg shadow-[#1db954]/20">Join</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Header Banner */}
                <header className="py-8 md:py-12 border-b border-white/5 mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1db954]/10 border border-[#1db954]/20 text-[#1db954] text-[10px] font-black uppercase tracking-widest">
                                    <Sparkles size={12} /> AniCine Watch Hub
                                </div>
                                <button
                                    onClick={() => setShowServerModal(true)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold transition ${serverConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
                                >
                                    <Server size={11} />
                                    <span>{serverConnected ? 'Cloud Active' : 'Standalone Mode'}</span>
                                </button>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white font-['Syne',sans-serif]">
                                Watch <span className="text-[#1db954]">Together</span>
                            </h1>
                            <p className="text-white/40 text-xs md:text-sm mt-2 max-w-xl">
                                Stream synchronized movies, anime, and series in real-time with your friends. Chat, react, and control playback together.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => handleCreateRoom(null)} 
                                disabled={isCreating}
                                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition"
                            >
                                <PlayCircle size={15} className="text-[#1db954]" /> Quick Party
                            </button>
                            <button 
                                onClick={() => {
                                    setSelectedMedia(null);
                                    setCustomRoomName(user ? `${user.name}'s Room` : 'My Watch Party');
                                    setShowCreateModal(true);
                                }} 
                                className="px-6 py-3 rounded-xl bg-[#1db954] hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#1db954]/20 active:scale-95 transition"
                            >
                                <Plus size={16} /> Create Room
                            </button>
                        </div>
                    </div>
                    
                    {error && <p className="mt-4 text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">{error}</p>}
                </header>

                {/* Actions & Room Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <form onSubmit={handleJoinWithCode} className="flex-1 flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Have a room code? (e.g. 7X9K2A)" 
                            value={roomCode}
                            onChange={e => setRoomCode(e.target.value.toUpperCase())}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/20 outline-none focus:border-[#1db954]/50 transition" 
                        />
                        <button type="submit" className="shrink-0 px-6 py-3.5 bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition active:scale-95">
                            Join Code
                        </button>
                    </form>
                    <div className="flex gap-2">
                        <button onClick={handleRefresh} title="Refresh active rooms" className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-[#1db954] transition active:scale-95">
                            <RefreshCw size={16} />
                        </button>
                        <button onClick={() => setShowServerModal(true)} title="Server Settings" className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition active:scale-95">
                            <Server size={16} />
                        </button>
                    </div>
                </div>

                {/* Room List Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-white/40 font-['Syne',sans-serif]">
                        Live Public Rooms ({activeRooms.length})
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Realtime Ready
                    </div>
                </div>

                {/* Room Grid */}
                {activeRooms.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center border border-white/5 rounded-3xl bg-white/[0.02] text-center p-6">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/20 mb-4">
                            <Users size={32} />
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">No Active Watch Parties</h3>
                        <p className="text-xs text-white/40 max-w-sm mb-6">Be the first to host a synchronized cinema session for you and your friends.</p>
                        <button 
                            onClick={() => {
                                setSelectedMedia(null);
                                setCustomRoomName(user ? `${user.name}'s Party` : 'AniCine Lounge');
                                setShowCreateModal(true);
                            }} 
                            className="px-6 py-3 rounded-xl bg-[#1db954] hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition shadow-lg shadow-[#1db954]/20"
                        >
                            Create Watch Party Now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {activeRooms.map((room) => (
                            <div key={room.id} className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-[#1db954]/40 transition duration-300 group flex flex-col justify-between">
                                {/* Room poster */}
                                <div className="relative aspect-video overflow-hidden bg-black/40">
                                    {room.media?.poster_path ? (
                                        <img 
                                            src={getImageUrl(room.media.poster_path, 'w500')} 
                                            alt="" 
                                            className="w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                                            <Film size={36} className="text-white/10" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent"></div>
                                    
                                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Live
                                    </div>
                                    {room.hasPassword && (
                                        <div className="absolute top-3 right-3 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-[#ff4d4d] border border-[#ff4d4d]/20">
                                            <Lock size={12} />
                                        </div>
                                    )}

                                    <div className="absolute bottom-3 left-3 right-3">
                                        <h3 className="text-sm font-black text-white truncate font-['Syne',sans-serif]">{room.roomName}</h3>
                                        <p className="text-[10px] text-[#1db954] font-bold uppercase tracking-wider">CODE: {room.id}</p>
                                    </div>
                                </div>

                                {/* Room info */}
                                <div className="p-3.5 flex items-center justify-between border-t border-white/5 bg-[#0d0d0d]">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-xl bg-[#1db954]/20 border border-[#1db954]/30 flex items-center justify-center text-xs font-black text-[#1db954]">
                                            {room.host?.charAt(0)?.toUpperCase() || 'H'}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-xs font-bold text-white truncate block">{room.host}</span>
                                            <span className="text-[10px] text-white/30">{room.viewers || 1} online</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleJoinClickFromList(room)}
                                        className="px-4 py-2 bg-white/10 hover:bg-[#1db954] hover:text-black rounded-xl text-xs font-bold text-white active:scale-95 transition"
                                    >
                                        Join
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-[#111] border border-white/10 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/5">
                            <div>
                                <h2 className="text-lg font-black uppercase tracking-tight text-white font-['Syne',sans-serif]">Create Watch Party</h2>
                                <p className="text-xs text-white/40">Select content or start an open lounge</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                            {/* Room Name Input */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1.5 block">Party Title</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter a room name..."
                                    value={customRoomName}
                                    onChange={e => setCustomRoomName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-[#1db954]/50 transition"
                                />
                            </div>

                            {/* Search media input */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1.5 block">Search Movie / TV / Anime (Optional)</label>
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={15} />
                                    <input 
                                        type="text" 
                                        placeholder="Search title to stream..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-[#1db954]/50 transition"
                                    />
                                </div>
                            </div>

                            {/* Selected media badge */}
                            {selectedMedia ? (
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {selectedMedia.poster_path && (
                                            <img src={getImageUrl(selectedMedia.poster_path, 'w92')} className="w-10 h-14 object-cover rounded-lg" alt="" />
                                        )}
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-white truncate">{selectedMedia.title || selectedMedia.name}</h4>
                                            <span className="text-[9px] font-black text-[#1db954] uppercase tracking-wider">{selectedMedia.media_type || 'Movie'}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedMedia(null)} className="p-2 text-white/40 hover:text-red-400 transition">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                                        {searchResults.length > 0 ? 'Search Results' : 'Popular Suggestions'}
                                    </p>
                                    <div className="grid grid-cols-3 gap-2.5">
                                        {(searchResults.length > 0 ? searchResults.slice(0, 6) : trendingItems).map(item => (
                                            <button 
                                                key={item.id} 
                                                onClick={() => handleSelectMedia(item)} 
                                                type="button"
                                                className="text-left group bg-white/5 p-1.5 rounded-xl border border-white/5 hover:border-[#1db954]/40 transition"
                                            >
                                                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white/5">
                                                    {item.poster_path && (
                                                        <img src={getImageUrl(item.poster_path, 'w185')} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                                    )}
                                                </div>
                                                <p className="mt-1.5 text-[10px] font-bold truncate text-white/60 group-hover:text-white">{item.title || item.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Password Toggle */}
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-white">Password Protection</span>
                                        <p className="text-[10px] text-white/30">Make this room private</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1db954]"></div>
                                    </label>
                                </div>

                                {isPrivate && (
                                    <input 
                                        type="password" 
                                        placeholder="Set room password..." 
                                        value={createPassword} 
                                        onChange={e => setCreatePassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#1db954]/50 transition" 
                                    />
                                )}
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="p-5 border-t border-white/5 bg-[#0d0d0d] flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setShowCreateModal(false)} 
                                className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleCreateRoom()} 
                                disabled={isCreating}
                                className="flex-1 py-3.5 rounded-xl bg-[#1db954] hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition shadow-lg shadow-[#1db954]/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                {isCreating ? 'Creating...' : 'Launch Room'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Server Settings Modal */}
            <ServerSettingsModal 
                isOpen={showServerModal} 
                onClose={() => setShowServerModal(false)}
                onSaved={() => {
                    handleRefresh();
                }}
            />
        </div>
    );
}
