import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchApi, getImageUrl } from '../api';
import { PlayCircle, ArrowLeft, Server, Star, List, Heart, SkipBack, SkipForward, Plus, Share2, Zap, Triangle, Hexagon, Play, Users } from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import { useContinueWatching } from '../hooks/useContinueWatching';
import { getBackendUrl, createSmartSocket, PartyChannelFallback } from '../utils/backend';

const SERVERS = [
    { name: 'Vidlink', url: (id, t, s, e, lang = 'en') => t === 'movie' ? `https://vidlink.pro/movie/${id}?primaryColor=ffcc00&audio=${lang}&lang=${lang}&ds=${lang}` : `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=ffcc00&audio=${lang}&lang=${lang}&ds=${lang}` },
    { name: 'VidSrc', url: (id, t, s, e, lang = 'en') => t === 'movie' ? `https://vidsrc.me/embed/movie?tmdb=${id}&lang=${lang}` : `https://vidsrc.me/embed/tv?tmdb=${id}&sea=${s}&epi=${e}&lang=${lang}` },
    { name: 'VidSrc PRO', url: (id, t, s, e, lang = 'en') => t === 'movie' ? `https://vidsrc.pm/embed/movie/${id}?audio=${lang}` : `https://vidsrc.pm/embed/tv/${id}/${s}/${e}?audio=${lang}` },
    { name: 'Embed.su', url: (id, t, s, e, lang = 'en') => t === 'movie' ? `https://embed.su/embed/movie/${id}?audio=${lang}` : `https://embed.su/embed/tv/${id}/${s}/${e}?audio=${lang}` },
];




export default function Watch({ explicitType, explicitId, startTime, partyRoom, isHost, username, socket }) {
    const params = useParams();
    const type = explicitType || params.type;
    const id = explicitId || params.id;
    const navigate = useNavigate();
    
    const [detail, setDetail] = useState(null);
    const [season, setSeason] = useState(1);
    const [episode, setEpisode] = useState(1);
    const [activeServer, setActiveServer] = useState(0);
    const [episodesList, setEpisodesList] = useState([]);
    const [activeTab, setActiveTab] = useState('Synopsis');
    const [selectedAudio, setSelectedAudio] = useState('Original');

    const AUDIO_TRACKS = [
        { id: 'en', label: 'Original', available: true },
        { id: 'hi', label: 'Hindi Dub', available: detail?.spoken_languages?.some(l => l.iso_639_1 === 'hi') || true }, // Mocking availability for premium feel
        { id: 'ja', label: 'Japanese', available: detail?.original_language === 'ja' || type === 'anime' },
        { id: 'en-dub', label: 'English Dub', available: type === 'anime' || type === 'tv' }
    ].filter(t => t.available);

    const { toggleWatchlist, isInWatchlist } = useWatchlist();
    const { history, addToHistory } = useContinueWatching();
    const inList = detail ? isInWatchlist(detail.id, type) : false;

    useEffect(() => {
        const savedItem = history.find(i => String(i.id) === String(id) && i.media_type === type);
        if (savedItem && savedItem.season && savedItem.episode) {
            setSeason(savedItem.season);
            setEpisode(savedItem.episode);
        }
    }, [id, type]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchApi(`/${type}/${id}?append_to_response=credits,recommendations`).then(data => {
            setDetail(data);
        });

        // Socket logic for Watch Party
        let tempSocket = socket;
        const storedRoom = sessionStorage.getItem('wp_room');
        const storedUser = sessionStorage.getItem('wp_username') || "Guest";
        const storedIsHost = sessionStorage.getItem('wp_isHost') === 'true';

        if (!tempSocket && storedRoom) {
            tempSocket = createSmartSocket();
            if (tempSocket) {
                tempSocket.on('connect', () => {
                    tempSocket.emit('join_room', { room: storedRoom, username: storedUser });
                    if (storedIsHost || isHost) {
                        tempSocket.emit('start_video', { room: storedRoom, type, id, title: document.title });
                    }
                });
            }
        } else if (tempSocket && partyRoom) {
             if (isHost || storedIsHost) {
                tempSocket.emit('start_video', { room: partyRoom, type, id, title: document.title });
             }
        }
        
        return () => {
            if (tempSocket && !socket) tempSocket.disconnect();
        };
    }, [id, type, partyRoom, isHost, socket]);

    // Host periodic sync
    useEffect(() => {
        if (partyRoom && isHost && socket) {
            const interval = setInterval(() => {
                if (socket.connected) {
                    socket.emit('time_update', { 
                        room: partyRoom, 
                        type, 
                        id, 
                        currentTime: 0, 
                        isPlaying: true 
                    });
                }
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [partyRoom, isHost, id, type, socket]);

    useEffect(() => {
        if (detail) addToHistory(detail, type, season, episode);
    }, [detail, type, season, episode]);

    useEffect(() => {
        if (type === 'tv' && detail) {
            fetchApi(`/tv/${id}/season/${season}`).then(data => {
                if (data && data.episodes) setEpisodesList(data.episodes);
            });
        }
    }, [season, id, type, detail]);

    const handleStartParty = async () => {
        const username = sessionStorage.getItem('wp_username') || localStorage.getItem('anicine_username') || 'Host_' + Math.floor(1000 + Math.random() * 9000);
        const mediaObj = {
            id,
            type,
            title: detail?.title || detail?.name || 'Stream',
            poster_path: detail?.poster_path || '',
            season: type === 'tv' ? season : null,
            episode: type === 'tv' ? episode : null
        };
        try {
            const baseUrl = getBackendUrl();
            const res = await fetch(`${baseUrl}/api/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomName: `${username}'s ${detail?.title || detail?.name || 'Party'}`,
                    host: username,
                    password: '',
                    media: mediaObj
                })
            });
            const data = await res.json();
            if (data?.room?.id) {
                // Save locally too for quick recall
                try {
                    const raw = localStorage.getItem('anicine_local_rooms');
                    const map = raw ? JSON.parse(raw) : {};
                    map[data.room.id] = {
                        id: data.room.id,
                        roomName: `${username}'s ${detail?.title || detail?.name || 'Party'}`,
                        host: username,
                        hasPassword: false,
                        media: mediaObj,
                        viewers: 1
                    };
                    localStorage.setItem('anicine_local_rooms', JSON.stringify(map));
                } catch (e) {}

                sessionStorage.setItem('wp_username', username);
                sessionStorage.setItem('wp_room', data.room.id);
                sessionStorage.setItem('wp_isHost', 'true');
                navigate('/party/room/' + data.room.id);
                return;
            }
        } catch (e) {
            console.warn('Watch party creation backend fallback:', e);
        }
        const fallbackCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        try {
            const raw = localStorage.getItem('anicine_local_rooms');
            const map = raw ? JSON.parse(raw) : {};
            map[fallbackCode] = {
                id: fallbackCode,
                roomName: `${username}'s ${detail?.title || detail?.name || 'Party'}`,
                host: username,
                hasPassword: false,
                media: mediaObj,
                viewers: 1
            };
            localStorage.setItem('anicine_local_rooms', JSON.stringify(map));
        } catch (e) {}

        sessionStorage.setItem('wp_username', username);
        sessionStorage.setItem('wp_room', fallbackCode);
        sessionStorage.setItem('wp_isHost', 'true');
        navigate('/party/room/' + fallbackCode);
    };

    if (!detail || !detail.id) return <div className="min-h-screen bg-[#080808] flex items-center justify-center animate-pulse text-[#ff4d4d] font-black uppercase tracking-[0.5em] text-xs pb-40">Loading...</div>;

    const currentEpisodeData = episodesList.find(e => e.episode_number === episode) || { name: 'Episode Info', overview: detail.overview };

    return (
        <div className="min-h-screen bg-[#080808] text-white overflow-y-auto relative selection:bg-[#ff4d4d] selection:text-white pb-40 custom-scrollbar">
            {/* Immersive HUD Backdrop (Image 1/4 Style) */}
            <div className="fixed inset-0 z-0">
                <img 
                    src={getImageUrl(detail.backdrop_path, 'original')} 
                    className="w-full h-full object-cover opacity-15 blur-2xl scale-110" 
                    alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/80"></div>
                
                {/* HUD Geometric Elements */}
                <div className="absolute top-[20%] left-[5%] opacity-10 animate-pulse text-[#ff4d4d]">
                     <Triangle size={400} strokeWidth={0.5} />
                </div>
                <div className="absolute bottom-[10%] right-[-5%] opacity-10 text-[#ff4d4d]">
                     <Hexagon size={600} strokeWidth={0.5} />
                </div>
            </div>

            <div className="relative z-10 max-w-[1920px] mx-auto pt-8 pb-40 px-4 md:px-8 lg:px-16 flex flex-col gap-12 md:gap-24">
                {/* Tactical Header (Image 4 Style Rating Star) */}
                <header className="animate-entrance grid grid-cols-1 md:grid-cols-12 items-end gap-12">
                    <div className="md:col-span-8 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-4 mb-6">
                             <div className="w-1.5 h-6 bg-[#ff4d4d]"></div>
                             <span className="text-[12px] font-black uppercase tracking-widest text-[#ff4d4d]">INFO / ID: {detail.id}</span>
                        </div>
                        <h1 className="text-xl md:text-3xl lg:text-5xl font-black uppercase tracking-tight leading-tight mb-4 md:mb-8 break-words">
                            {detail.title || detail.name}
                        </h1>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-12 text-[11px] font-bold uppercase tracking-[0.3em] text-white/40 mb-10">
                             <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-3">
                                       <Star size={40} className="text-[#1db954] fill-[#1db954] animate-pulse" />
                                       <div className="flex flex-col">
                                            <span className="text-white/20 text-[8px] font-black tracking-widest">IMDB Rating</span>
                                            <span className="text-2xl font-black tracking-tight text-white">{detail.vote_average?.toFixed(1)} <span className="opacity-20 text-sm">/ 10</span></span>
                                       </div>
                                  </div>
                             </div>
                             <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>
                             <span>Released {(detail.release_date || detail.first_air_date || '').slice(0, 4)}</span>
                             <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>
                             <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-md">{type} Station</span>
                        </div>

                        <p className="text-white/60 text-sm md:text-lg lg:text-2xl max-w-3xl leading-relaxed mb-6 md:mb-12 line-clamp-2 md:line-clamp-3">
                            {detail.overview}
                        </p>

                        <div className="flex flex-wrap gap-3 md:gap-6 mb-6 md:mb-12">
                            <button className="bg-[#ff4d4d] text-white px-6 md:px-12 py-3 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-[11px] shadow-2xl hover:scale-[1.03] transition-all flex items-center justify-center gap-3">
                                <Play size={16} fill="white" /> Watch Now
                            </button>
                            <button onClick={() => toggleWatchlist(detail, type)} className={`px-6 md:px-12 py-3 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-[11px] transition-all flex items-center justify-center gap-3 ${inList ? 'bg-white text-black' : 'bg-white/10 border border-white/10 text-white hover:bg-white/20'}`}>
                                <Plus size={16} /> {inList ? 'Added' : 'Add to List'}
                            </button>
                            <button onClick={handleStartParty} className="px-6 md:px-12 py-3 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-[11px] bg-[#1db954]/15 border border-[#1db954]/30 text-[#1db954] hover:bg-[#1db954]/25 transition-all flex items-center justify-center gap-3">
                                <Users size={16} /> Watch Party
                            </button>
                        </div>

                        {/* Interactive 3D Audio Selector (Floating) */}
                        <div className="relative group w-full md:w-fit overflow-x-auto">
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[2.5rem] p-1.5 md:p-2 flex gap-1 md:gap-2 items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-fit">
                                <div className="px-4 py-2 border-r border-white/5 opacity-40 text-[8px] md:text-[9px] font-black uppercase tracking-widest hidden sm:block shrink-0">Audio</div>
                                <div className="flex gap-1 md:gap-2">
                                    {AUDIO_TRACKS.map((track) => (
                                        <button
                                            key={track.id}
                                            onClick={() => setSelectedAudio(track.label)}
                                            className={`relative px-3 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all duration-500 overflow-hidden whitespace-nowrap ${selectedAudio === track.label ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
                                        >
                                            {selectedAudio === track.label && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#ff4d4d] to-[#1db954] opacity-100 animate-pulse"></div>
                                            )}
                                            <span className="relative z-10 flex items-center gap-1.5">
                                                {track.label}
                                                {selectedAudio === track.label && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"></div>}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <div className="ml-2 pr-4 hidden lg:block shrink-0">
                                     <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-[0.2em] animate-pulse">Dub Available</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image 4 Right Snippets Style */}
                    <div className="md:col-span-4 flex flex-col gap-6">
                         <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-4 border-b border-white/10 pb-4">Episode List</div>
                         {type === 'tv' && episodesList.slice(episode, episode + 3).map((ep, idx) => (
                             <button key={ep.id} onClick={() => setEpisode(ep.episode_number)} className="group flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#ff4d4d]/40 transition-all text-left">
                                 <div className="w-32 aspect-video shrink-0 rounded-xl overflow-hidden relative border border-white/10 shadow-2xl">
                                      <img src={getImageUrl(ep.still_path, 'w185')} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <PlayCircle size={20} className="text-[#ff4d4d]" fill="currentColor" />
                                      </div>
                                 </div>
                                 <div className="flex-1 min-w-0 flex flex-col justify-center">
                                      <span className="text-[8px] font-black text-[#ff4d4d] uppercase mb-1">Chapter 0{ep.episode_number}</span>
                                      <h4 className="text-[12px] font-black uppercase truncate group-hover:text-[#ff4d4d] transition-colors">{ep.name}</h4>
                                 </div>
                             </button>
                         ))}
                    </div>
                </header>

                {/* Main Content Node: Player + Station Selection */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 items-start animate-entrance delay-200">
                    <main className="xl:col-span-8 flex flex-col gap-10">
                         {/* High-Precision Player Panel (Image 1 Style Content Box) */}
                         <div className="relative aspect-video rounded-xl md:rounded-[2rem] lg:rounded-[3rem] overflow-hidden border-2 md:border-[6px] border-white/5 shadow-2xl bg-black">
                              <iframe
                                key={`${activeServer}-${episode}-${selectedAudio}`}
                                src={SERVERS[activeServer]?.url(id, type, season, episode, AUDIO_TRACKS.find(t => t.label === selectedAudio)?.id || 'en') || ''}
                                className="w-full h-full border-none"
                                allowFullScreen
                                title="Video Player"
                              ></iframe>
                         </div>

                         {/* Station HUD Selection (Image 3 Grid Style) */}
                         <div className="bg-[#121212] border border-white/10 rounded-2xl md:rounded-[3rem] p-5 md:p-10 shadow-inner">
                              <div className="flex items-center justify-between mb-6 md:mb-10">
                                   <div className="flex items-center gap-3">
                                        <div className="w-px h-6 md:h-8 bg-[#ff4d4d] opacity-40"></div>
                                        <h3 className="text-sm md:text-xl font-black uppercase tracking-tighter italic">Server Selection</h3>
                                   </div>
                              </div>
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                                   {SERVERS.map((srv, idx) => (
                                       <button 
                                          key={idx}
                                          onClick={() => setActiveServer(idx)}
                                          className={`p-4 md:p-8 rounded-xl md:rounded-3xl transition-all duration-500 border flex flex-col gap-2 md:gap-4 text-left ${activeServer === idx ? 'bg-[#ff4d4d] border-[#ff4d4d] shadow-[0_20px_50px_rgba(255,77,77,0.3)]' : 'bg-white/5 border-white/10 hover:border-[#ff4d4d]/30 hover:bg-white/10'}`}
                                       >
                                           <Server size={16} className={activeServer === idx ? 'text-white' : 'text-white/40'} />
                                           <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{srv.name}</span>
                                       </button>
                                   ))}
                              </div>
                         </div>
                    </main>

                    {/* Meta Metadata Node (Image 1 Right Column Style) */}
                    <aside className="xl:col-span-4 flex flex-col gap-10">
                         {/* Deep Dive Archive (Synopsis + Intel) */}
                         <div className="bg-[#121212] border border-white/10 rounded-2xl md:rounded-[3rem] p-4 md:p-10 flex flex-col shadow-2xl overflow-hidden">
                              <div className="flex items-center gap-4 mb-6 md:mb-10 pb-6 md:pb-10 border-b border-white/10">
                                   <div className="text-3xl md:text-5xl font-black italic tracking-tighter text-[#ff4d4d] shrink-0">{String(episode).padStart(2, '0')}</div>
                                   <div className="flex flex-col min-w-0">
                                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/40">Episode {episode}</span>
                                        <h3 className="text-sm md:text-lg font-black uppercase tracking-tight truncate">{currentEpisodeData.name}</h3>
                                   </div>
                              </div>

                              <div className="flex gap-4 md:gap-8 mb-6 md:mb-10">
                                  {['Synopsis', 'Trailer', 'Details'].map(tab => (
                                      <button 
                                        key={tab} 
                                        onClick={() => setActiveTab(tab)}
                                        className={`text-[10px] md:text-[11px] font-black uppercase tracking-wider transition-all relative pb-2 ${activeTab === tab ? 'text-white border-b-2 border-[#ff4d4d]' : 'text-white/20 hover:text-white/40'}`}
                                      >
                                          {tab}
                                      </button>
                                  ))}
                              </div>

                              <p className="text-sm md:text-base font-medium leading-relaxed text-white/40 mb-8 md:mb-12 flex-1">
                                  {currentEpisodeData.overview || "No description available for this episode."}
                              </p>

                              <div className="grid grid-cols-2 gap-3 md:gap-4 pt-6 md:pt-10 border-t border-white/5">
                                   <button 
                                      onClick={() => episode > 1 && setEpisode(episode - 1)}
                                      disabled={episode === 1}
                                      className="py-3 md:py-5 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 flex items-center justify-center gap-2 disabled:opacity-30 transition-all"
                                   >
                                       <SkipBack size={14} /> Back
                                   </button>
                                   <button 
                                      onClick={() => episode < episodesList.length && setEpisode(episode + 1)}
                                      disabled={episode === episodesList.length}
                                      className="py-3 md:py-5 bg-[#ff4d4d] rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 disabled:opacity-30 active:scale-95 transition-all"
                                   >
                                       Next <SkipForward size={14} />
                                   </button>
                              </div>
                         </div>

                    </aside>
                </div>

                {/* Node Expansion: Full Episode Matrix (Image 3 Grid Style) */}
                {type === 'tv' && (
                    <section className="bg-[#121212] border border-white/10 rounded-2xl md:rounded-[3rem] p-4 md:p-12 lg:p-16 shadow-inner animate-entrance">
                         <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
                              <div className="flex items-center gap-6">
                                   <div className="w-2 h-10 bg-[#ff4d4d] rounded-full"></div>
                                   <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Episode Selection</h2>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Library / Season {season}</p>
                                   </div>
                              </div>

                              {/* Season Selection Nodes */}
                              <div className="flex flex-wrap gap-4">
                                   {Array.from({ length: detail.number_of_seasons || 1 }).map((_, i) => (
                                       <button 
                                          key={i + 1}
                                          onClick={() => { setSeason(i + 1); setEpisode(1); }}
                                          className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${season === i + 1 ? 'bg-[#1db954] text-black shadow-lg shadow-[#1db954]/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                       >
                                           S{i + 1}
                                       </button>
                                   ))}
                              </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                              {episodesList.map((ep) => (
                                  <button 
                                     key={ep.id} 
                                     onClick={() => setEpisode(ep.episode_number)}
                                     className={`group relative aspect-video rounded-3xl overflow-hidden border transition-all duration-500 ${episode === ep.episode_number ? 'border-[#ff4d4d] ring-4 ring-[#ff4d4d]/10' : 'border-white/5 hover:border-white/20'}`}
                                  >
                                      <img src={getImageUrl(ep.still_path, 'w300')} alt="" className={`w-full h-full object-cover transition-transform duration-700 ${episode === ep.episode_number ? 'scale-110 opacity-100' : 'opacity-40 group-hover:opacity-80'}`} />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                      <div className="absolute bottom-4 left-4 right-4">
                                           <div className="flex items-center justify-between">
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${episode === ep.episode_number ? 'text-[#ff4d4d]' : 'text-white/40'}`}>EP {ep.episode_number}</span>
                                                {episode === ep.episode_number && <div className="w-2 h-2 bg-[#ff4d4d] rounded-full animate-pulse shadow-[0_0_10px_#ff4d4d]"></div>}
                                           </div>
                                           <h4 className="text-[11px] font-black uppercase truncate mt-1">{ep.name}</h4>
                                      </div>
                                  </button>
                              ))}
                         </div>
                    </section>
                )}

                {/* Final Node: Global Recommendations */}
                <section className="mt-20">
                    <div className="flex items-center gap-4 mb-16 border-b border-white/5 pb-8">
                         <div className="w-1.5 h-8 bg-[#ff4d4d] rounded-full"></div>
                         <h2 className="text-3xl font-black uppercase tracking-tighter">Recommended for You</h2>
                    </div>

                    <div className="flex overflow-x-auto gap-8 pb-10 scrollbar-hide px-4 -mx-4 group">
                        {detail.recommendations?.results?.slice(0, 12).map((item, idx) => {
                             const mediaType = item.media_type || type;
                             return (
                                 <Link key={item.id} to={`/watch/${mediaType}/${item.id}`} className="w-56 shrink-0 group transition-all duration-500 hover:scale-[1.03]">
                                     <div className="relative aspect-[2/3] rounded-3xl overflow-hidden border border-white/5 group-hover:border-[#ff4d4d]/40 transition-all">
                                          <img src={getImageUrl(item.poster_path, 'w500')} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                          <div className="absolute top-4 right-4 bg-[#1db954] text-black px-2 py-1 rounded text-[9px] font-black shadow-2xl transform transition-transform group-hover:scale-110">
                                              {(item.release_date || item.first_air_date || '').slice(0, 4)}
                                          </div>
                                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                              <div className="absolute bottom-4 left-4 right-4">
                                                  <p className="text-[10px] font-black uppercase text-[#ff4d4d] tracking-widest mb-1">{mediaType}</p>
                                                  <h4 className="text-[13px] font-black uppercase leading-tight truncate">{item.title || item.name}</h4>
                                              </div>
                                          </div>
                                     </div>
                                 </Link>
                             );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
