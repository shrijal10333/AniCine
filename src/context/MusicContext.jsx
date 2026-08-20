import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { getBestAudio } from '../api/musicApi';
import { useMusicLibrary } from '../hooks/useMusicLibrary';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none' | 'one' | 'all'
  const [sleepTimer, setSleepTimer] = useState(null); // minutes or null
  const sleepTimeoutRef = useRef(null);
  const { addToRecent } = useMusicLibrary();

  const audio = audioRef.current;

  useEffect(() => {
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    audio.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const onTime = () => setProgress(audio.currentTime);
    const onDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => handleNext(true);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [queue, queueIndex, repeatMode]);

  const playSong = useCallback((song, songQueue = [], idx = 0) => {
    const url = getBestAudio(song.downloadUrl);
    if (!url) return;
    audio.src = url;
    audio.play();
    setCurrentSong(song);
    addToRecent(song);
    if (songQueue.length > 0) {
      setQueue(songQueue);
      setQueueIndex(idx);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) audio.pause();
    else audio.play();
  }, [isPlaying]);

  const handleNext = useCallback((auto = false) => {
    if (repeatMode === 'one' && auto) {
      audio.currentTime = 0;
      audio.play();
      return;
    }
    const nextIdx = queueIndex + 1;
    if (nextIdx < queue.length) {
      const nextSong = queue[nextIdx];
      const url = getBestAudio(nextSong.downloadUrl);
      if (url) {
        audio.src = url;
        audio.play();
        setCurrentSong(nextSong);
        setQueueIndex(nextIdx);
      }
    } else if (repeatMode === 'all' && queue.length > 0) {
      const firstSong = queue[0];
      const url = getBestAudio(firstSong.downloadUrl);
      if (url) {
        audio.src = url;
        audio.play();
        setCurrentSong(firstSong);
        setQueueIndex(0);
      }
    }
  }, [queue, queueIndex, repeatMode]);

  const handlePrev = useCallback(() => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0) {
      const prevSong = queue[prevIdx];
      const url = getBestAudio(prevSong.downloadUrl);
      if (url) {
        audio.src = url;
        audio.play();
        setCurrentSong(prevSong);
        setQueueIndex(prevIdx);
      }
    }
  }, [queue, queueIndex]);

  const seek = useCallback((time) => {
    audio.currentTime = time;
    setProgress(time);
  }, []);

  const cyclRepeat = useCallback(() => {
    setRepeatMode(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none');
  }, []);

  const stopMusic = useCallback(() => {
    audio.pause();
    audio.src = '';
    setCurrentSong(null);
    setQueue([]);
    setQueueIndex(0);
    setIsPlaying(false);
  }, []);

  const addToQueue = useCallback((song) => {
    setQueue(q => [...q, song]);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (!currentSong) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.shiftKey) { handleNext(false); } 
          else { seek(Math.min(progress + 10, duration)); }
          break;
        case 'ArrowLeft':
          if (e.shiftKey) { handlePrev(); }
          else { seek(Math.max(progress - 10, 0)); }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(v => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(v => Math.max(0, v - 0.1));
          break;
        case 'KeyM':
          setIsMuted(m => !m);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentSong, togglePlay, handleNext, handlePrev, seek, progress, duration]);

  // Sleep timer
  const startSleepTimer = useCallback((minutes) => {
    if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
    if (!minutes) {
      setSleepTimer(null);
      return;
    }
    setSleepTimer(minutes);
    sleepTimeoutRef.current = setTimeout(() => {
      audio.pause();
      setSleepTimer(null);
    }, minutes * 60 * 1000);
  }, []);

  const clearSleepTimer = useCallback(() => {
    if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
    setSleepTimer(null);
  }, []);

  return (
    <MusicContext.Provider value={{
      currentSong, queue, queueIndex,
      isPlaying, progress, duration,
      volume, setVolume, isMuted, setIsMuted,
      isLoading, isShuffled, setIsShuffled,
      repeatMode, cyclRepeat,
      playSong, togglePlay, stopMusic,
      handleNext: () => handleNext(false),
      handlePrev, seek, addToQueue,
      sleepTimer, startSleepTimer, clearSleepTimer,
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export const useMusic = () => useContext(MusicContext);
