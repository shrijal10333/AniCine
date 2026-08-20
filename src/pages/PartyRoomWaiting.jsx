import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Loader2, Film, MessageCircle, ArrowLeft, Send, Share2, X, Check, Server, Sparkles, CheckCircle2, Globe } from 'lucide-react';
import Watch from './Watch';
import { getBackendUrl, createSmartSocket, PartyChannelFallback } from '../utils/backend';
import ServerSettingsModal from '../components/ServerSettingsModal';

let socket = null;
let fallbackChannel = null;

export default function PartyRoomWaiting() {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("Waiting for Host...");
    const [playingVideo, setPlayingVideo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentMsg, setCurrentMsg] = useState("");
    const [viewers, setViewers] = useState([]);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'info'
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [serverConnected, setServerConnected] = useState(false);
    const [showServerModal, setShowServerModal] = useState(false);
    const lastVideoRef = useRef(null); // format: "type-id"

    const isHost = sessionStorage.getItem('wp_isHost') === 'true';
    const username = sessionStorage.getItem('wp_username') || "Guest";
    const messagesEndRef = useRef(null);

    // Load initial room data from backend or local storage cache
    useEffect(() => {
        const baseUrl = getBackendUrl();
        if (roomCode) {
            fetch(`${baseUrl}/api/rooms/${roomCode}`)
                .then(res => res.json())
                .then(roomData => {
                    if (roomData && (roomData.playing || roomData.media)) {
                        const targetMedia = roomData.playing || roomData.media;
                        if (targetMedia.type && targetMedia.id) {
                            setPlayingVideo({
                                type: targetMedia.type,
                                id: targetMedia.id,
                                currentTime: roomData.currentTime || 0
                            });
                            lastVideoRef.current = `${targetMedia.type}-${targetMedia.id}`;
                        }
                    }
                })
                .catch(() => {
                    // Check local room cache for Vercel offline/standalone fallback
                    try {
                        const localRooms = JSON.parse(localStorage.getItem('anicine_local_rooms') || '{}');
                        const localRoom = localRooms[roomCode];
                        if (localRoom && (localRoom.playing || localRoom.media)) {
                            const targetMedia = localRoom.playing || localRoom.media;
                            if (targetMedia.type && targetMedia.id) {
                                setPlayingVideo({
                                    type: targetMedia.type,
                                    id: targetMedia.id,
                                    currentTime: 0
                                });
                                lastVideoRef.current = `${targetMedia.type}-${targetMedia.id}`;
                            }
                        }
                    } catch (e) {}
                });
        }
    }, [roomCode]);

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
            if (data.type && data.id) {
                const videoKey = `${data.type}-${data.id}`;
                if (lastVideoRef.current !== videoKey) {
                    lastVideoRef.current = videoKey;
                    setPlayingVideo({
                        type: data.type,
                        id: data.id,
                        currentTime: data.currentTime || 0
                    });
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
                    if (data.type && data.id) {
                        const videoKey = `${data.type}-${data.id}`;
                        if (lastVideoRef.current !== videoKey) {
                            lastVideoRef.current = videoKey;
                            setPlayingVideo({
                                type: data.type,
                                id: data.id,
                                currentTime: data.currentTime || 0
                            });
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
        if (window.confirm(`Are you sure you want to dismiss ${targetUsername}?`)) {
            if (socket && socket.connected) {
                socket.emit('kick_user', { room: roomCode, userId });
            }
            setViewers(prev => prev.filter(u => u.id !== userId));
        }
    };

    const handleInvite = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert('Watch Party link copied to clipboard!');
    };

    const forceSync = () => {
        lastVideoRef.current = null;
        if (socket && socket.connected) {
            socket.emit('sync_request', { room: roomCode });
        }
    };

    const handleBack = () => {
        sessionStorage.removeItem('wp_room');
        sessionStorage.removeItem('wp_isHost');
        navigate('/party');
    };

    return (
        <div className="flex flex-col h-screen bg-[#080808] text-white overflow-y-auto custom-scrollbar font-['Plus_Jakarta_Sans',sans-serif]">
            
            {/* Top Bar */}
            <div className="h-16 px-4 md:px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0c0c0c]/80 backdrop-blur-xl z-20">
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                    <button onClick={handleBack} className="p-2 hover:bg-white/5 rounded-xl transition text-white/50 hover:text-white shrink-0">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="h-6 w-[1px] bg-white/10 mx-1 md:mx-2 shrink-0"></div>
                    <div className="truncate">
                        <h1 className="text-sm md:text-base font-black tracking-tight flex items-center gap-2 truncate font-['Syne',sans-serif]">
                            ROOM <span className="text-[#1db954] bg-[#1db954]/10 border border-[#1db954]/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">{roomCode}</span>
                        </h1>
                        <div className="flex items-center gap-2 text-[9px] text-white/40 font-bold uppercase tracking-wider whitespace-nowrap">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                            {viewers.length} Online
                            <span className="text-white/20">•</span>
                            <button 
                                onClick={() => setShowServerModal(true)} 
                                className={`inline-flex items-center gap-1 hover:underline cursor-pointer ${serverConnected ? 'text-emerald-400' : 'text-amber-400/80'}`}
                            >
                                {serverConnected ? 'Cloud Sync Active' : 'Standalone Mode'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowServerModal(true)}
                        title="Backend Server Configuration"
                        className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-[10px] font-bold ${serverConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
                    >
                        <Server size={14} />
                        <span className="hidden sm:inline">{serverConnected ? 'Connected' : 'Server'}</span>
                    </button>

                    {!isHost && playingVideo && (
                        <button
                            onClick={forceSync}
                            className="flex items-center gap-1.5 px-3 py-2 bg-[#ff4d4d]/10 hover:bg-[#ff4d4d]/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition border border-[#ff4d4d]/20 text-[#ff4d4d]"
                        >
                            <Check size={12} /> Sync
                        </button>
                    )}
                    <button
                        onClick={handleInvite}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition border border-white/5 text-white/70 hover:text-white"
                    >
                        <Share2 size={12} /> <span className="hidden sm:inline">Invite</span>
                    </button>
                    {isHost && (
                        <Link to="/" className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-[#1db954] hover:bg-emerald-400 text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-lg shadow-[#1db954]/20">
                            <Film size={12} /> <span className="hidden sm:inline">Library</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`p-2 rounded-xl transition ${isSidebarOpen ? 'bg-[#1db954] text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
                    >
                        <MessageCircle size={18} />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Content Area: Player or Waiting */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#080808] relative">
                    {playingVideo ? (
                        <div className="flex-1 bg-black flex flex-col overflow-y-auto relative custom-scrollbar">
                            <Watch 
                                explicitType={playingVideo.type} 
                                explicitId={playingVideo.id} 
                                startTime={playingVideo.currentTime} 
                                partyRoom={roomCode} 
                                isHost={isHost} 
                                username={username} 
                                socket={socket} 
                            />

                            {/* Floating Overlay Toggle when Sidebar is closed */}
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={`absolute bottom-6 right-6 z-[60] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all cursor-pointer ${isSidebarOpen ? 'bg-white text-black' : 'bg-[#1db954] text-black'}`}
                                title="Open Chat"
                            >
                                {isSidebarOpen ? <X size={24} /> : <MessageCircle size={24} />}
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center bg-[#080808] overflow-y-auto">
                            <div className="relative mb-6 md:mb-8 shrink-0">
                                <div className="absolute inset-0 bg-[#1db954]/10 blur-3xl rounded-full"></div>
                                <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-[#1db954] shadow-2xl">
                                    <Loader2 className="animate-spin" size={32} />
                                </div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2 font-['Syne',sans-serif]">
                                Waiting for Content
                            </h2>
                            <p className="text-white/40 max-w-sm text-xs md:text-sm leading-relaxed mb-6">
                                {isHost
                                    ? "Browse AniCine's catalog and pick a movie, anime, or series to stream for the party."
                                    : "The host is currently selecting a movie or anime to stream."}
                            </p>

                            {isHost && (
                                <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                                    <Link to="/movies" className="px-6 py-3.5 bg-white text-black rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white/90 active:scale-95 transition">
                                        Browse Movies
                                    </Link>
                                    <Link to="/anime" className="px-6 py-3.5 bg-[#1db954] text-black rounded-xl font-black text-xs uppercase tracking-wider hover:bg-emerald-400 active:scale-95 transition shadow-lg shadow-[#1db954]/20">
                                        Browse Anime
                                    </Link>
                                    <Link to="/tv" className="px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white/10 active:scale-95 transition">
                                        TV Shows
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar: Chat & Participants */}
                <div className={`
                    fixed md:relative inset-y-0 right-0 z-40 
                    w-full md:w-80 border-l border-white/10 bg-[#0e0e0e]/95 backdrop-blur-3xl flex flex-col shrink-0
                    transform transition-all duration-500 ease-in-out shadow-[-20px_0_40px_rgba(0,0,0,0.8)]
                    ${isSidebarOpen 
                        ? 'translate-y-0 md:translate-y-0 opacity-100' 
                        : 'translate-y-full md:translate-x-full md:translate-y-0 opacity-0 pointer-events-none md:w-0 md:opacity-0 md:border-none'
                    }
                    h-[65vh] md:h-full top-auto bottom-0 md:top-0 md:bottom-auto
                    rounded-t-[32px] md:rounded-none
                `}>
                    <div className="md:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2 shrink-0" onClick={() => setIsSidebarOpen(false)}></div>
                    <div className="p-3.5 flex gap-2 border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${activeTab === 'chat' ? 'bg-[#1db954] text-black shadow-lg shadow-[#1db954]/20' : 'bg-white/5 text-white/50 hover:text-white'}`}
                        >
                            <MessageCircle size={14} /> Chat
                        </button>
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${activeTab === 'info' ? 'bg-[#1db954] text-black shadow-lg shadow-[#1db954]/20' : 'bg-white/5 text-white/50 hover:text-white'}`}
                        >
                            <Users size={14} /> Viewers
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {activeTab === 'chat' ? (
                            <div className="h-full flex flex-col">
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-10">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-4 text-white/20">
                                            <MessageCircle size={28} className="mb-2" />
                                            <p className="text-xs font-bold text-white/40">Watch Party Chat</p>
                                            <p className="text-[10px]">Say hello to everyone in the room!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, i) => (
                                            <div key={i} className={`flex flex-col ${msg.author === username ? 'items-end' : 'items-start'}`}>
                                                <div className="flex items-center gap-1.5 mb-1 px-1">
                                                    <span className="text-[10px] font-bold text-white/60">{msg.author}</span>
                                                    <span className="text-[9px] text-white/30">{msg.time}</span>
                                                </div>
                                                <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed max-w-[90%] font-medium ${msg.author === username ? 'bg-[#1db954] text-black font-semibold' : 'bg-white/5 text-white border border-white/5'}`}>
                                                    {msg.message}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="p-3 bg-[#0a0a0a] border-t border-white/5">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={currentMsg}
                                            onChange={(e) => setCurrentMsg(e.target.value)}
                                            placeholder="Type a message..."
                                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-4 pr-12 outline-none focus:border-[#1db954]/50 transition text-xs"
                                        />
                                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#1db954] text-black flex items-center justify-center transition hover:scale-105 active:scale-95">
                                            <Send size={14} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="p-4 space-y-3 h-full overflow-y-auto custom-scrollbar">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1 px-1">Active Viewers ({viewers.length})</p>
                                {viewers.map((u, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/5 group transition-all hover:bg-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-[#1db954]/20 border border-[#1db954]/30 flex items-center justify-center text-[#1db954] font-black text-xs">
                                            {u.username?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white truncate flex items-center gap-2">
                                                {u.username}
                                                {u.isHost && <span className="text-[8px] bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/20 px-1.5 py-0.5 rounded font-bold uppercase">Host</span>}
                                            </p>
                                            <p className="text-[9px] text-white/30 font-medium">Joined Party</p>
                                        </div>

                                        {isHost && !u.isHost && u.id !== 'self' && (
                                            <button
                                                onClick={() => handleKick(u.id, u.username)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                                                title="Remove User"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Server Settings Modal */}
            <ServerSettingsModal 
                isOpen={showServerModal} 
                onClose={() => setShowServerModal(false)}
                onSaved={() => {
                    // Trigger reconnect
                    window.location.reload();
                }}
            />
        </div>
    );
}
