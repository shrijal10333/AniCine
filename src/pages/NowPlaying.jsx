import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { useMusicLibrary } from '../hooks/useMusicLibrary';
import { getBestImage, getLyrics } from '../api/musicApi';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Repeat1, Shuffle, Heart,
  Timer, ChevronDown, Mic2
} from 'lucide-react';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function NowPlaying() {
  const navigate = useNavigate();
  const {
    currentSong, isPlaying, progress, duration,
    volume, setVolume, isMuted, setIsMuted,
    isLoading, repeatMode, cyclRepeat, isShuffled, setIsShuffled,
    togglePlay, handleNext, handlePrev, seek,
    sleepTimer, startSleepTimer, clearSleepTimer,
  } = useMusic();
  const { toggleLike, isLiked } = useMusicLibrary();

  const [lyrics, setLyrics] = useState(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [showLyrics, setShowLyrics] = useState(true); // default ON
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const progressRef = useRef(null);

  // Always try to fetch lyrics when song changes
  useEffect(() => {
    if (!currentSong) return;
    setLyrics(null);
    setLoadingLyrics(true);
    getLyrics(currentSong.id).then(l => {
      setLyrics(l);
      setLoadingLyrics(false);
    }).catch(() => setLoadingLyrics(false));
  }, [currentSong?.id]);

  if (!currentSong) {
    navigate('/music');
    return null;
  }

  const art = getBestImage(currentSong.image);
  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const artistNames = currentSong.primaryArtists || '';
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  const sleepOptions = [5, 10, 15, 30, 45, 60];

  return (
    <div className="fixed inset-0 z-[300] bg-[#060606] flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Background Art Blur */}
      {art && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src={art} alt="" className="w-full h-full object-cover opacity-15 blur-[80px] scale-125" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </div>
      )}

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 shrink-0">
        <button
          onClick={() => navigate('/music')}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ChevronDown size={24} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          Now Playing
        </span>
        <div className="flex items-center gap-1">
          {/* Sleep Timer */}
          <div className="relative">
            <button
              onClick={() => setShowSleepMenu(s => !s)}
              className={`p-2 rounded-lg transition-all ${sleepTimer ? 'text-[#1db954]' : 'text-white/30 hover:text-white'}`}
            >
              <Timer size={18} />
            </button>
            {showSleepMenu && (
              <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-2 min-w-[160px] z-50">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 px-3 py-2">Sleep Timer</p>
                {sleepTimer && (
                  <button
                    onClick={() => { clearSleepTimer(); setShowSleepMenu(false); }}
                    className="w-full text-left px-3 py-2 text-[11px] font-bold text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    ✕ Cancel ({sleepTimer}m)
                  </button>
                )}
                {sleepOptions.map(m => (
                  <button
                    key={m}
                    onClick={() => { startSleepTimer(m); setShowSleepMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-[11px] font-bold rounded-lg transition-colors ${sleepTimer === m ? 'text-[#1db954] bg-[#1db954]/10' : 'text-white/70 hover:bg-white/5'}`}
                  >
                    {m} Minutes
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Lyrics Toggle */}
          <button
            onClick={() => setShowLyrics(l => !l)}
            className={`p-2 rounded-lg transition-all ${showLyrics ? 'text-[#1db954]' : 'text-white/30 hover:text-white'}`}
          >
            <Mic2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Content — scrollable on mobile */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-4 min-h-0">
        {/* Album Art */}
        <div className={`shrink-0 transition-all duration-500 ${showLyrics ? 'w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72' : 'w-56 h-56 md:w-72 md:h-72 lg:w-96 lg:h-96'}`}>
          <div className={`w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10 ${isPlaying ? 'ring-2 md:ring-4 ring-[#1db954]/20' : ''} transition-all duration-500`}>
            {art
              ? <img src={art} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-white/5 flex items-center justify-center"><Mic2 size={48} className="text-white/10" /></div>
            }
          </div>
        </div>

        {/* Song Info + Like (moved here for mobile) */}
        <div className="flex items-center justify-between w-full max-w-md mt-4 md:mt-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg md:text-2xl font-black text-white truncate">{currentSong.name}</h2>
            <p className="text-[10px] md:text-xs text-white/40 truncate mt-0.5 uppercase tracking-widest font-bold">{artistNames}</p>
          </div>
          <button
            onClick={() => toggleLike(currentSong)}
            className="shrink-0 ml-3 p-2 group"
          >
            <Heart
              size={22}
              fill={isLiked(currentSong.id) ? '#1db954' : 'none'}
              className={`transition-all duration-300 ${isLiked(currentSong.id) ? 'text-[#1db954] scale-110' : 'text-white/30 group-hover:text-white'}`}
            />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mt-4 space-y-1">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer group"
          >
            <div
              className="h-full bg-[#1db954] rounded-full relative transition-all"
              style={{ width: `${pct}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-white/30">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-5 md:gap-6 mt-4">
          <button
            onClick={() => setIsShuffled(s => !s)}
            className={`p-2 rounded-lg transition-all ${isShuffled ? 'text-[#1db954]' : 'text-white/30 hover:text-white'}`}
          >
            <Shuffle size={18} />
          </button>

          <button onClick={handlePrev} className="p-2 text-white/60 hover:text-white transition-colors active:scale-90">
            <SkipBack size={24} />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#1db954] text-black flex items-center justify-center hover:bg-white transition-all active:scale-90 shadow-xl shadow-[#1db954]/20"
          >
            {isLoading
              ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />
            }
          </button>

          <button onClick={handleNext} className="p-2 text-white/60 hover:text-white transition-colors active:scale-90">
            <SkipForward size={24} />
          </button>

          <button
            onClick={cyclRepeat}
            className={`p-2 rounded-lg transition-all ${repeatMode !== 'none' ? 'text-[#1db954]' : 'text-white/30 hover:text-white'}`}
          >
            <RepeatIcon size={18} />
          </button>
        </div>

        {/* Volume — desktop only */}
        <div className="hidden md:flex items-center justify-center gap-3 mt-3">
          <button onClick={() => setIsMuted(m => !m)} className="text-white/30 hover:text-white transition-colors">
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0} max={1} step={0.01}
            value={isMuted ? 0 : volume}
            onChange={e => { setVolume(+e.target.value); if (isMuted) setIsMuted(false); }}
            className="w-32 accent-[#1db954] cursor-pointer"
          />
        </div>
      </div>

      {/* Lyrics Section — below controls, scrollable */}
      {showLyrics && (
        <div className="relative z-10 px-4 md:px-6 pb-6 shrink-0">
          <div className="max-w-md mx-auto bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-6 max-h-48 md:max-h-64 overflow-y-auto custom-scrollbar">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1db954] mb-3 flex items-center gap-2 sticky top-0 bg-inherit pb-2">
              <Mic2 size={12} /> Lyrics
            </h3>
            {loadingLyrics ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-white/20 border-t-[#1db954] rounded-full animate-spin" />
              </div>
            ) : lyrics ? (
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">
                {lyrics}
              </p>
            ) : (
              <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold py-4 text-center">
                Lyrics not available for this track
              </p>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint — desktop only */}
      <div className="hidden md:flex relative z-10 items-center justify-center gap-6 text-[8px] font-bold text-white/15 uppercase tracking-[0.2em] pb-4">
        <span>Space: Play/Pause</span>
        <span>←→: Seek 10s</span>
        <span>Shift+←→: Skip</span>
        <span>↑↓: Volume</span>
        <span>M: Mute</span>
      </div>
    </div>
  );
}
