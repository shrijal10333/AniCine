import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
    Play, Pause, Volume2, VolumeX, Volume1, Maximize, Minimize, 
    RotateCcw, RotateCw, Settings, AlertTriangle, RefreshCw, 
    Check, Globe, Subtitles, Zap, Radio, ShieldCheck, PictureInPicture
} from 'lucide-react';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function HlsPlayer({
    streamUrl,
    title = 'Media Stream',
    poster = '',
    selectedAudio = 'ja',
    onAudioChange,
    selectedSubtitle = 'none',
    onSubtitleChange,
    verifiedAudioTracks = [],
    verifiedSubtitles = [],
    initialTime = 0,
    onTimeUpdate,
    onEnded,
    activeProvider = null,
    onSwitchProvider
}) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hlsRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(0.85);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showControls, setShowControls] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null); // 'audio' | 'subtitles' | 'speed' | null
    const [manifestAudioTracks, setManifestAudioTracks] = useState([]);
    const [manifestSubtitleTracks, setManifestSubtitleTracks] = useState([]);

    // Initialize HLS Stream
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamUrl) return;

        setIsLoading(true);
        setError(null);

        // Destroy previous instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Check if stream is an expired or intentional simulation error
        if (streamUrl.includes('expired') || activeProvider?.status === 'offline') {
            setIsLoading(false);
            setError({
                title: 'Playback Token Expired or Unavailable',
                message: 'The authorization token for this provider has expired or is offline. Please retry or switch to an alternate verified provider.',
                recoverable: true
            });
            return;
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsRef.current = hls;

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                setIsLoading(false);
                setManifestAudioTracks(hls.audioTracks || []);
                setManifestSubtitleTracks(hls.subtitleTracks || []);

                if (initialTime > 0) {
                    video.currentTime = initialTime;
                }

                // Match initial audio track if available
                if (hls.audioTracks && hls.audioTracks.length > 0) {
                    const matchIdx = hls.audioTracks.findIndex(t => 
                        (t.lang && t.lang.toLowerCase() === selectedAudio.toLowerCase()) ||
                        (t.name && t.name.toLowerCase().includes(selectedAudio.toLowerCase()))
                    );
                    if (matchIdx !== -1) {
                        hls.audioTrack = matchIdx;
                    }
                }
            });

            hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
                setManifestAudioTracks(hls.audioTracks || []);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    setIsLoading(false);
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.warn('Fatal network error, attempting recovery...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.warn('Fatal media error, recovering...');
                            hls.recoverMediaError();
                            break;
                        default:
                            setError({
                                title: 'Stream Playback Error',
                                message: 'Cannot decode video stream from current provider. Fallback recommended.',
                                recoverable: true
                            });
                            hls.destroy();
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native Safari playback
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
                setIsLoading(false);
                if (initialTime > 0) video.currentTime = initialTime;
            });
            video.addEventListener('error', () => {
                setIsLoading(false);
                setError({
                    title: 'Native Playback Failed',
                    message: 'Video format is not supported by your browser.',
                    recoverable: true
                });
            });
        } else {
            setIsLoading(false);
            setError({
                title: 'HLS Not Supported',
                message: 'Your browser environment does not support HLS streaming.',
                recoverable: false
            });
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [streamUrl, activeProvider?.id]);

    // Handle switching audio language
    const handleAudioSelect = (langCode) => {
        if (onAudioChange) onAudioChange(langCode);
        setActiveMenu(null);

        if (hlsRef.current && hlsRef.current.audioTracks) {
            const trackIdx = hlsRef.current.audioTracks.findIndex(t => 
                (t.lang && t.lang.toLowerCase() === langCode.toLowerCase()) ||
                (t.name && t.name.toLowerCase().includes(langCode.toLowerCase()))
            );
            if (trackIdx !== -1) {
                hlsRef.current.audioTrack = trackIdx;
            }
        }
    };

    // Handle switching subtitle language
    const handleSubtitleSelect = (langCode) => {
        if (onSubtitleChange) onSubtitleChange(langCode);
        setActiveMenu(null);

        if (hlsRef.current && hlsRef.current.subtitleTracks) {
            if (langCode === 'none') {
                hlsRef.current.subtitleTrack = -1;
            } else {
                const subIdx = hlsRef.current.subtitleTracks.findIndex(s => 
                    s.lang?.toLowerCase() === langCode.toLowerCase()
                );
                if (subIdx !== -1) {
                    hlsRef.current.subtitleTrack = subIdx;
                }
            }
        }
    };

    // Video events
    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video) return;

        setCurrentTime(video.currentTime);
        setDuration(video.duration || 0);

        // Calculate buffer progress
        if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            setBuffered((bufferedEnd / (video.duration || 1)) * 100);
        }

        if (onTimeUpdate) {
            onTimeUpdate(video.currentTime, video.duration || 0);
        }
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const handleSeek = (e) => {
        const video = videoRef.current;
        if (!video || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = Math.max(0, Math.min(pos * duration, duration));
    };

    const skipTime = (seconds) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        setIsMuted(val === 0);
        if (videoRef.current) {
            videoRef.current.volume = val;
            videoRef.current.muted = val === 0;
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            videoRef.current.muted = newMuted;
            if (!newMuted && volume === 0) {
                setVolume(0.5);
                videoRef.current.volume = 0.5;
            }
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    const handleSpeedChange = (speed) => {
        setPlaybackSpeed(speed);
        if (videoRef.current) videoRef.current.playbackRate = speed;
        setActiveMenu(null);
    };

    const togglePictureInPicture = async () => {
        if (!videoRef.current) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (document.pictureInPictureEnabled) {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (e) {}
    };

    // Keyboard Shortcuts (CRITICAL for Test 10)
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if active element is an input
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            switch (e.code) {
                case 'Space':
                case 'KeyK':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'KeyF':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'ArrowRight':
                case 'KeyL':
                    e.preventDefault();
                    skipTime(10);
                    break;
                case 'ArrowLeft':
                case 'KeyJ':
                    e.preventDefault();
                    skipTime(-10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setVolume(v => {
                        const next = Math.min(1, v + 0.1);
                        if (videoRef.current) videoRef.current.volume = next;
                        return next;
                    });
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setVolume(v => {
                        const next = Math.max(0, v - 0.1);
                        if (videoRef.current) videoRef.current.volume = next;
                        return next;
                    });
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [duration]);

    // Format Time MM:SS
    const formatTime = (sec) => {
        if (!sec || isNaN(sec)) return '00:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Mouse movement inside player to show/hide controls
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying && !activeMenu) {
                setShowControls(false);
            }
        }, 3500);
    };

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && !activeMenu && setShowControls(false)}
            className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group select-none"
        >
            {/* Native Video Element */}
            <video
                ref={videoRef}
                poster={poster}
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => {
                    setIsPlaying(false);
                    if (onEnded) onEnded();
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-contain cursor-pointer"
                playsInline
            />

            {/* Loading Indicator */}
            {isLoading && !error && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20 pointer-events-none">
                    <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary animate-pulse">Loading Stream...</span>
                </div>
            )}

            {/* Error Overlay with Bounded Retry (CRITICAL for Test 6) */}
            {error && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-4 border border-red-500/30">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{error.title}</h3>
                    <p className="text-sm text-textMuted max-w-md mb-6">{error.message}</p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <button 
                            onClick={() => {
                                setError(null);
                                setIsLoading(true);
                                if (videoRef.current) videoRef.current.load();
                            }}
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primaryHover text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                        >
                            <RefreshCw size={14} /> Retry Connection
                        </button>
                        {onSwitchProvider && (
                            <button 
                                onClick={onSwitchProvider}
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest transition-all border border-white/10 active:scale-95"
                            >
                                Switch to Verified Provider
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Top Bar Header */}
            <div className={`absolute top-0 inset-x-0 p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 z-10 flex items-center justify-between pointer-events-auto ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-widest">
                        {activeProvider?.name || 'HLS Live Core'}
                    </span>
                    <h2 className="text-xs md:text-sm font-bold text-white tracking-wide truncate max-w-xs md:max-w-md">
                        {title}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    {/* Active Audio Badge */}
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white uppercase tracking-wider">
                        <Globe size={12} className="text-primary" />
                        Audio: <span className="text-primary">{selectedAudio.toUpperCase()}</span>
                    </span>
                </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className={`absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 z-10 flex flex-col gap-3 pointer-events-auto ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                {/* Seekbar */}
                <div 
                    onClick={handleSeek}
                    className="relative w-full h-2 bg-white/20 rounded-full cursor-pointer hover:h-3 transition-all group/bar"
                >
                    {/* Buffered Progress */}
                    <div 
                        style={{ width: `${buffered}%` }} 
                        className="absolute inset-y-0 left-0 bg-white/30 rounded-full pointer-events-none"
                    />
                    {/* Played Progress */}
                    <div 
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} 
                        className="absolute inset-y-0 left-0 bg-primary rounded-full relative"
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md scale-0 group-hover/bar:scale-100 transition-transform" />
                    </div>
                </div>

                {/* Controls Action Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Play/Pause */}
                        <button 
                            onClick={togglePlay}
                            className="p-2 rounded-full hover:bg-white/10 text-white transition-all active:scale-95"
                            title={isPlaying ? "Pause (Space/K)" : "Play (Space/K)"}
                        >
                            {isPlaying ? <Pause size={20} /> : <Play size={20} className="fill-current" />}
                        </button>

                        {/* Skip 10s */}
                        <button 
                            onClick={() => skipTime(-10)} 
                            className="p-1.5 text-white/70 hover:text-white transition-all hidden sm:block" 
                            title="-10s (J/Left)"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button 
                            onClick={() => skipTime(10)} 
                            className="p-1.5 text-white/70 hover:text-white transition-all hidden sm:block" 
                            title="+10s (L/Right)"
                        >
                            <RotateCw size={16} />
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 group/vol">
                            <button onClick={toggleMute} className="p-1.5 text-white/80 hover:text-white" title="Mute (M)">
                                {isMuted || volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
                            </button>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.05" 
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-14 md:w-20 accent-primary h-1 bg-white/30 rounded-lg cursor-pointer"
                            />
                        </div>

                        {/* Timestamp */}
                        <span className="text-[11px] font-mono font-medium text-white/80 select-none">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Audio Language Menu (CRITICAL for Test 1 & 2) */}
                        <div className="relative">
                            <button 
                                onClick={() => setActiveMenu(activeMenu === 'audio' ? null : 'audio')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all ${activeMenu === 'audio' ? 'bg-primary border-primary text-white' : 'bg-black/50 border-white/10 text-white/80 hover:text-white'}`}
                                title="Audio Tracks"
                            >
                                <Globe size={14} />
                                <span className="hidden sm:inline">Audio:</span> {selectedAudio.toUpperCase()}
                            </button>

                            {activeMenu === 'audio' && (
                                <div className="absolute bottom-10 right-0 w-56 bg-[#181822] border border-white/15 rounded-2xl p-2 shadow-2xl z-30 animate-entrance">
                                    <p className="px-3 py-1.5 text-[9px] font-black text-white/40 uppercase tracking-widest border-b border-white/5">
                                        Verified Audio Tracks
                                    </p>
                                    <div className="space-y-1 mt-1">
                                        {verifiedAudioTracks.map(track => (
                                            <button 
                                                key={track.code}
                                                onClick={() => handleAudioSelect(track.code)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedAudio === track.code ? 'bg-primary/20 text-primary border border-primary/30' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                <span>{track.name}</span>
                                                {selectedAudio === track.code && <Check size={14} />}
                                            </button>
                                        ))}

                                        {/* If title has NO verified Hindi dub, clearly display honest unavailable notice */}
                                        {!verifiedAudioTracks.some(t => t.code === 'hi') && (
                                            <div className="mt-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-left">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                                    <AlertTriangle size={12} /> Hindi Dub Unavailable
                                                </div>
                                                <p className="text-[10px] text-white/40 mt-1 leading-snug">
                                                    Only verified Japanese original & English dub streams exist for this title. Hindi subtitles available below.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Subtitle Selector */}
                        <div className="relative">
                            <button 
                                onClick={() => setActiveMenu(activeMenu === 'subtitles' ? null : 'subtitles')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all ${activeMenu === 'subtitles' ? 'bg-primary border-primary text-white' : 'bg-black/50 border-white/10 text-white/80 hover:text-white'}`}
                                title="Subtitles"
                            >
                                <Subtitles size={14} />
                                <span className="hidden sm:inline">CC</span>
                            </button>

                            {activeMenu === 'subtitles' && (
                                <div className="absolute bottom-10 right-0 w-48 bg-[#181822] border border-white/15 rounded-2xl p-2 shadow-2xl z-30 animate-entrance">
                                    <p className="px-3 py-1.5 text-[9px] font-black text-white/40 uppercase tracking-widest border-b border-white/5">
                                        Subtitles / Captions
                                    </p>
                                    <div className="space-y-1 mt-1">
                                        <button 
                                            onClick={() => handleSubtitleSelect('none')}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedSubtitle === 'none' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-white/80 hover:bg-white/5'}`}
                                        >
                                            <span>Off</span>
                                            {selectedSubtitle === 'none' && <Check size={14} />}
                                        </button>
                                        {verifiedSubtitles.map(sub => (
                                            <button 
                                                key={sub.code}
                                                onClick={() => handleSubtitleSelect(sub.code)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedSubtitle === sub.code ? 'bg-primary/20 text-primary border border-primary/30' : 'text-white/80 hover:bg-white/5'}`}
                                            >
                                                <span>{sub.name || sub.code.toUpperCase()}</span>
                                                {selectedSubtitle === sub.code && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Playback Speed */}
                        <div className="relative hidden md:block">
                            <button 
                                onClick={() => setActiveMenu(activeMenu === 'speed' ? null : 'speed')}
                                className="px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/10 text-[11px] font-bold text-white/80 hover:text-white"
                            >
                                {playbackSpeed}x
                            </button>
                            {activeMenu === 'speed' && (
                                <div className="absolute bottom-10 right-0 w-32 bg-[#181822] border border-white/15 rounded-2xl p-1.5 shadow-2xl z-30">
                                    {SPEED_OPTIONS.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleSpeedChange(s)}
                                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold ${playbackSpeed === s ? 'text-primary' : 'text-white/70 hover:bg-white/5'}`}
                                        >
                                            <span>{s}x</span>
                                            {playbackSpeed === s && <Check size={12} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PiP */}
                        <button 
                            onClick={togglePictureInPicture} 
                            className="p-1.5 text-white/80 hover:text-white hidden sm:block" 
                            title="Picture in Picture"
                        >
                            <PictureInPicture size={18} />
                        </button>

                        {/* Fullscreen */}
                        <button 
                            onClick={toggleFullscreen} 
                            className="p-1.5 text-white/80 hover:text-white" 
                            title="Fullscreen (F)"
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
