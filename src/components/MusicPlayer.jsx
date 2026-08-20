import { useMusic } from '../context/MusicContext';
import { getBestImage } from '../api/musicApi';
import { useMusicLibrary } from '../hooks/useMusicLibrary';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Repeat1, Shuffle, Music2, ChevronUp, ListMusic, X, Heart, Plus
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function MusicPlayer() {
    const {
    currentSong, isPlaying, progress, duration,
    volume, setVolume, isMuted, setIsMuted,
    isLoading, repeatMode, cyclRepeat, isShuffled, setIsShuffled,
    togglePlay, handleNext, handlePrev, seek, queue, queueIndex, stopMusic
  } = useMusic();
  const { toggleLike, isLiked, playlists, toggleSongInPlaylist } = useMusicLibrary();

  const [expanded, setExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const progressRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentSong) return null;

  const isMusicPage = location.pathname === '/music';
  const art = getBestImage(currentSong.image);
  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const artistNames = currentSong.primaryArtists || '';

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  // Theme Constants
  const themeBg = isMusicPage ? 'bg-white' : 'bg-[#181818]';
  const themeText = isMusicPage ? 'text-[#1E293B]' : 'text-white';
  const themeMuted = isMusicPage ? 'text-[#64748B]' : 'text-white/60';
  const themeBorder = isMusicPage ? 'border-[#1E293B]' : 'border-white/10';
  const themeShadow = isMusicPage ? 'shadow-pop-md' : 'shadow-2xl';

  return (
    <>
      {/* Queue Panel */}
      {showQueue && (
        <div className={`fixed bottom-[100px] right-4 w-85 max-h-[500px] ${themeBg} border-2 ${themeBorder} ${themeShadow} z-[199] flex flex-col overflow-hidden rounded-2xl p-2`}>
          <div className={`flex items-center justify-between px-4 py-4 border-b-2 ${themeBorder} border-dashed`}>
            <span className={`font-outfit font-black text-xl ${themeText}`}>Next Up — {queue.length}</span>
            <button onClick={() => setShowQueue(false)} className={`${themeMuted} hover:${themeText} transition-colors`}>
              <X size={20} strokeWidth={3} />
            </button>
          </div>
          <div className="overflow-y-auto custom-scrollbar p-2 space-y-2">
            {queue.map((song, idx) => {
              const img = getBestImage(song.image);
              const active = idx === queueIndex;
              return (
                <div
                  key={`${song.id}-${idx}`}
                  className={`flex items-center gap-4 px-4 py-3 transition-all rounded-xl cursor-pointer ${active ? 'bg-[#8B5CF6]/10 border-2 border-[#8B5CF6]' : `hover:bg-black/5`}`}
                  onClick={() => useMusic().playSong(song, queue, idx)}
                >
                  <div className={`w-12 h-12 border-2 ${themeBorder} rounded-lg overflow-hidden shrink-0`}>
                    {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black truncate ${active ? 'text-[#8B5CF6]' : themeText}`}>{song.name}</p>
                    <p className={`text-xs font-bold truncate ${themeMuted}`}>{song.primaryArtists}</p>
                  </div>
                  {active && <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mini Player Bar */}
      <div className={`fixed bottom-6 left-6 right-6 z-[200] transition-all duration-500`}>
        <div className={`${themeBg} border-2 ${themeBorder} ${themeShadow} p-4 md:px-8 rounded-[24px] flex flex-col gap-3 group transition-transform hover:scale-[1.01]`}>
          
          {/* Progress bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className={`w-full h-2.5 ${isMusicPage ? 'bg-[#F1F5F9]' : 'bg-white/5'} border-2 ${themeBorder} cursor-pointer relative overflow-hidden rounded-full`}
          >
            <div
              className={`h-full ${isMusicPage ? 'bg-[#8B5CF6]' : 'bg-[#1db954]'} transition-all`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-center gap-6">
            {/* Song info */}
            <div
              className={`flex items-center gap-4 flex-1 min-w-0 cursor-pointer`}
              onClick={() => navigate('/music')}
            >
              <div className="relative shrink-0">
                <div className={`w-14 h-14 border-2 ${themeBorder} rounded-xl overflow-hidden shadow-sm group-hover:-rotate-3 transition-transform`}>
                  {art
                    ? <img src={art} alt="" className="w-full h-full object-cover" />
                    : <div className={`w-full h-full flex items-center justify-center ${isMusicPage ? 'bg-[#F1F5F9]' : 'bg-white/5'}`}><Music2 size={24} className={themeMuted} /></div>
                  }
                </div>
              </div>
              <div className="min-w-0">
                <h4 className={`text-lg font-outfit font-black ${themeText} truncate leading-tight`}>{currentSong.name}</h4>
                <p className={`text-xs font-jakarta font-bold uppercase tracking-tight ${themeMuted} truncate`}>{artistNames}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 md:gap-5 shrink-0">
              <button 
                onClick={handlePrev} 
                className={`${themeMuted} hover:scale-125 transition-all active:scale-95`}
              >
                <SkipBack size={24} fill="currentColor" />
              </button>

              <button
                onClick={togglePlay}
                className={`w-14 h-14 border-2 ${themeBorder} ${isMusicPage ? 'bg-[#8B5CF6] text-white' : 'bg-[#1db954] text-black'} rounded-full flex items-center justify-center shadow-pop-sm hover:translate-y-[-2px] hover:shadow-pop-md transition-all active:translate-y-[2px] active:shadow-none translate-y-0`}
              >
                {isLoading
                  ? <div className={`w-6 h-6 border-4 border-t-transparent ${isMusicPage ? 'border-white' : 'border-black'} rounded-full animate-spin`} />
                  : isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />
                }
              </button>

              <button 
                onClick={handleNext} 
                className={`${themeMuted} hover:scale-125 transition-all active:scale-95`}
              >
                <SkipForward size={24} fill="currentColor" />
              </button>
            </div>

            {/* Right Side Options */}
            <div className={`flex items-center gap-2 md:gap-4 shrink-0 pl-4 border-l-2 ${themeBorder} border-dashed`}>
              <div className="hidden lg:flex items-center gap-3 mr-2">
                 <button onClick={() => setIsMuted(!isMuted)} className={themeMuted}>
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                 </button>
                 <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className={`w-20 accent-[#8B5CF6] cursor-pointer`}
                 />
              </div>

              <button 
                onClick={() => setShowQueue(q => !q)}
                className={`w-10 h-10 border-2 ${themeBorder} rounded-xl flex items-center justify-center transition-all ${showQueue ? 'bg-[#8B5CF6] text-white shadow-none' : `${themeBg} ${themeText} shadow-pop-sm hover:-translate-y-0.5`}`}
              >
                <ListMusic size={20} strokeWidth={3} />
              </button>

              <button 
                onClick={stopMusic}
                className={`w-10 h-10 border-2 ${themeBorder} bg-[#F87171] text-white rounded-xl flex items-center justify-center shadow-pop-sm hover:bg-[#EF4444] transition-all hover:-translate-y-0.5`}
                title="Tear it out"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
