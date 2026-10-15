import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    fetchDetails, 
    fetchSeasonEpisodes, 
    fetchAvailability, 
    fetchCompatibleProviders, 
    getImageUrl 
} from '../api';
import HlsPlayer from '../components/Player/HlsPlayer';
import ServerSelector from '../components/Player/ServerSelector';
import { useAuth } from '../context/AuthContext';
import { 
    ArrowLeft, Heart, Check, Star, Calendar, Clock, Film, 
    Tv, Share2, AlertCircle, ShieldCheck, Globe, Subtitles, 
    Play, ChevronRight, Layers, Users
} from 'lucide-react';

export default function Watch() {
    const { type = 'movie', id } = useParams();
    const navigate = useNavigate();
    const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, saveWatchProgress, preferences } = useAuth();

    const [detail, setDetail] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [providers, setProviders] = useState([]);
    const [activeProvider, setActiveProvider] = useState(null);
    const [selectedAudio, setSelectedAudio] = useState(preferences?.preferredAudio || 'ja');
    const [selectedSubtitle, setSelectedSubtitle] = useState(preferences?.preferredSubtitle || 'en');
    
    // Series / Anime state
    const [season, setSeason] = useState(1);
    const [episode, setEpisode] = useState(1);
    const [seasonEpisodes, setSeasonEpisodes] = useState([]);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);
    
    const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'Episodes' | 'Providers'
    const [streamNotice, setStreamNotice] = useState(null);

    const isTV = type === 'tv' || type === 'anime';

    // 1. Fetch content detail & availability
    useEffect(() => {
        window.scrollTo(0, 0);
        let isMounted = true;

        const loadData = async () => {
            const data = await fetchDetails(type, id);
            if (!isMounted) return;

            if (data) {
                setDetail(data);

                // Fetch verified audio & subtitle availability
                const availData = await fetchAvailability(type, id, data.title || data.name, data.original_language);
                if (availData) {
                    setAvailability(availData);

                    // Check if default preferred audio is verified for this title
                    const hasPreferred = availData.audioTracks.some(a => a.code === selectedAudio && a.verified);
                    const defaultAudio = hasPreferred ? selectedAudio : (availData.audioTracks[0]?.code || 'ja');
                    setSelectedAudio(defaultAudio);

                    // Load compatible providers
                    const provData = await fetchCompatibleProviders(id, defaultAudio);
                    if (provData && provData.providers) {
                        setProviders(provData.providers);
                        setActiveProvider(provData.activeProvider || provData.providers[0]);
                    }
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [type, id]);

    // 2. Fetch Season Episodes if TV
    useEffect(() => {
        if (!isTV || !id) return;
        setLoadingEpisodes(true);

        fetchSeasonEpisodes(id, season).then(res => {
            if (res && res.episodes) {
                setSeasonEpisodes(res.episodes);
            }
            setLoadingEpisodes(false);
        }).catch(() => setLoadingEpisodes(false));
    }, [id, isTV, season]);

    // Handle audio track change: switch provider if needed while keeping language intact
    const handleAudioChange = async (langCode) => {
        setSelectedAudio(langCode);

        // Fetch compatible providers for this new language
        const res = await fetchCompatibleProviders(id, langCode);
        if (res && res.languageSupported && res.providers.length > 0) {
            setProviders(res.providers);
            // Switch to a provider that supports this language
            const compatible = res.providers.find(p => p.supportedAudio.includes(langCode)) || res.providers[0];
            setActiveProvider(compatible);
            setStreamNotice(null);
        } else {
            setStreamNotice({
                type: 'warning',
                message: `No verified streaming provider currently provides a ${langCode.toUpperCase()} audio track for this title. Preserving verified original tracks.`
            });
        }
    };

    // Handle provider change
    const handleSelectServer = (server) => {
        setActiveProvider(server);
        setStreamNotice(null);
    };

    // Save progress periodically
    const handleTimeUpdate = (currentTime, duration) => {
        if (!detail || !currentTime || !duration) return;
        saveWatchProgress({
            id: detail.id,
            title: detail.title || detail.name,
            type,
            poster_path: detail.poster_path,
            currentTime,
            duration,
            season: isTV ? season : undefined,
            episode: isTV ? episode : undefined
        });
    };

    const inWatchlist = detail ? isInWatchlist(detail.id) : false;

    const handleToggleWatchlist = () => {
        if (!detail) return;
        if (inWatchlist) {
            removeFromWatchlist(detail.id);
        } else {
            addToWatchlist({
                id: detail.id,
                title: detail.title || detail.name,
                poster_path: detail.poster_path,
                backdrop_path: detail.backdrop_path,
                media_type: type,
                vote_average: detail.vote_average,
                release_date: detail.release_date || detail.first_air_date
            });
        }
    };

    // Active stream URL
    const activeStreamUrl = activeProvider?.streamUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

    return (
        <div className="min-h-screen bg-[#0B0B0E] text-textMain pb-20 px-4 md:px-8 max-w-7xl mx-auto pt-4">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between mb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-textMuted hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-2xl border border-white/5 active:scale-95"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleToggleWatchlist}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${inWatchlist ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white/5 text-textMuted hover:text-white border-white/10'}`}
                    >
                        {inWatchlist ? <Check size={16} /> : <Heart size={16} />}
                        <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                    </button>
                    <Link
                        to="/party"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all"
                    >
                        <Users size={16} className="text-primary" />
                        <span className="hidden sm:inline">Watch Party</span>
                    </Link>
                </div>
            </div>

            {/* Video Player Section */}
            <div className="mb-6">
                <HlsPlayer 
                    streamUrl={activeStreamUrl}
                    title={detail ? (detail.title || detail.name) : 'Loading...'}
                    poster={detail ? getImageUrl(detail.backdrop_path || detail.poster_path, 'w1280') : ''}
                    selectedAudio={selectedAudio}
                    onAudioChange={handleAudioChange}
                    selectedSubtitle={selectedSubtitle}
                    onSubtitleChange={setSelectedSubtitle}
                    verifiedAudioTracks={availability?.audioTracks || []}
                    verifiedSubtitles={availability?.subtitles || []}
                    activeProvider={activeProvider}
                    onTimeUpdate={handleTimeUpdate}
                    onSwitchProvider={() => {
                        const nextProvider = providers.find(p => p.id !== activeProvider?.id && p.status === 'verified');
                        if (nextProvider) setActiveProvider(nextProvider);
                    }}
                />
            </div>

            {/* Notice Banner (e.g. if language is unverified) */}
            {streamNotice && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300 text-xs font-medium">
                    <AlertCircle size={18} className="shrink-0 text-amber-400" />
                    <span>{streamNotice.message}</span>
                </div>
            )}

            {/* Server Selector Section */}
            <div className="mb-8">
                <ServerSelector 
                    servers={providers}
                    activeServerId={activeProvider?.id}
                    onSelectServer={handleSelectServer}
                    currentAudio={selectedAudio}
                />
            </div>

            {/* Title & Metadata Header */}
            {detail && (
                <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 md:p-8 mb-8 shadow-xl">
                    <div className="flex flex-col lg:flex-row gap-8 justify-between">
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-widest">
                                    {type.toUpperCase()}
                                </span>
                                {detail.original_language && (
                                    <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                                        Original: {detail.original_language.toUpperCase()}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] font-black tracking-widest">
                                    <Star size={12} className="fill-current" /> {detail.vote_average ? detail.vote_average.toFixed(1) : '8.5'}
                                </span>
                                <span className="text-xs text-textMuted flex items-center gap-1">
                                    <Calendar size={13} /> {detail.release_date?.substring(0, 4) || detail.first_air_date?.substring(0, 4) || '2024'}
                                </span>
                                {detail.runtime && (
                                    <span className="text-xs text-textMuted flex items-center gap-1">
                                        <Clock size={13} /> {detail.runtime} min
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                                {detail.title || detail.name}
                            </h1>

                            {detail.tagline && (
                                <p className="text-sm font-semibold italic text-primary">
                                    "{detail.tagline}"
                                </p>
                            )}

                            <p className="text-sm text-textMuted leading-relaxed max-w-4xl">
                                {detail.overview || 'No synopsis available for this title.'}
                            </p>

                            {/* Verified Audio & Subtitle Language Breakdown */}
                            <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white mb-2">
                                        <Globe size={14} className="text-primary" /> Verified Audio Tracks
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(availability?.audioTracks || []).map(track => (
                                            <span 
                                                key={track.code}
                                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${track.code === selectedAudio ? 'bg-primary text-white border-primary' : 'bg-black/40 text-textMuted border-white/10'}`}
                                            >
                                                {track.name} {track.isOriginal && '(Original)'}
                                            </span>
                                        ))}
                                    </div>
                                    {/* Critical rule feedback */}
                                    {!availability?.audioTracks?.some(t => t.code === 'hi') && (
                                        <p className="text-[10px] text-amber-400 mt-2 font-medium">
                                            ℹ️ Note: Hindi Dub is strictly unavailable for this anime title on all authorized feeds.
                                        </p>
                                    )}
                                </div>

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white mb-2">
                                        <Subtitles size={14} className="text-accent" /> Available Subtitles
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(availability?.subtitles || []).map(sub => (
                                            <span 
                                                key={sub.code}
                                                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black/40 text-white/80 border border-white/10"
                                            >
                                                {sub.name || sub.code.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-textMuted mt-2">
                                        Subtitles do not imply dubbed audio availability.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Poster Thumbnail */}
                        <div className="shrink-0 w-36 md:w-48 hidden md:block">
                            <img 
                                src={getImageUrl(detail.poster_path, 'w500')} 
                                alt={detail.title || detail.name}
                                className="w-full rounded-2xl shadow-2xl border border-white/15 object-cover"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TV Show Seasons & Episodes Section */}
            {isTV && detail && (
                <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 md:p-8 mb-8 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Layers size={20} className="text-primary" />
                            <h2 className="text-lg font-black text-white uppercase tracking-wider">
                                Episodes & Seasons
                            </h2>
                        </div>

                        {detail.number_of_seasons > 1 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-textMuted uppercase font-bold">Season:</span>
                                <select 
                                    value={season}
                                    onChange={(e) => setSeason(Number(e.target.value))}
                                    className="bg-black/60 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-primary"
                                >
                                    {Array.from({ length: detail.number_of_seasons }, (_, i) => i + 1).map(s => (
                                        <option key={s} value={s}>Season {s}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {loadingEpisodes ? (
                        <div className="py-12 flex justify-center">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {seasonEpisodes.map((ep) => (
                                <div 
                                    key={ep.id}
                                    onClick={() => setEpisode(ep.episode_number)}
                                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 ${episode === ep.episode_number ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/5 hover:bg-white/10 text-textMuted'}`}
                                >
                                    <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-black shrink-0">
                                        <img 
                                            src={getImageUrl(ep.still_path || detail.backdrop_path, 'w300')} 
                                            alt={ep.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Play size={16} className="text-white fill-current" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                                            EP {ep.episode_number}
                                        </span>
                                        <h4 className="text-xs font-bold text-white truncate tracking-wide mt-0.5">
                                            {ep.name || `Episode ${ep.episode_number}`}
                                        </h4>
                                        <p className="text-[10px] text-textMuted line-clamp-2 mt-1">
                                            {ep.overview || 'No description available.'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
