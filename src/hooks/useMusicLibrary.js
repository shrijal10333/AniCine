import { useState, useEffect } from 'react';

const MAX_RECENT = 30;

export function useMusicLibrary() {
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  useEffect(() => {
    const savedLiked = localStorage.getItem('anicine_liked_songs') || localStorage.getItem('sxr_liked_songs');
    const savedPlaylists = localStorage.getItem('anicine_music_playlists') || localStorage.getItem('sxr_music_playlists');
    const savedRecent = localStorage.getItem('anicine_recently_played') || localStorage.getItem('sxr_recently_played');
    if (savedLiked) { try { setLikedSongs(JSON.parse(savedLiked)); } catch(e) {} }
    if (savedPlaylists) { try { setPlaylists(JSON.parse(savedPlaylists)); } catch(e) {} }
    if (savedRecent) { try { setRecentlyPlayed(JSON.parse(savedRecent)); } catch(e) {} }
  }, []);

  const toggleLike = (song) => {
    let list = [...likedSongs];
    const idx = list.findIndex(s => s.id === song.id);
    if (idx >= 0) list.splice(idx, 1);
    else list.unshift(song);
    setLikedSongs(list);
    localStorage.setItem('anicine_liked_songs', JSON.stringify(list));
  };

  const isLiked = (id) => likedSongs.some(s => s.id === id);

  const createPlaylist = (name) => {
    if (!name || !name.trim()) return;
    const newList = { id: Date.now().toString(), name: name.trim(), songs: [] };
    const list = [newList, ...playlists];
    setPlaylists(list);
    localStorage.setItem('anicine_music_playlists', JSON.stringify(list));
  };

  const deletePlaylist = (id) => {
    const list = playlists.filter(p => p.id !== id);
    setPlaylists(list);
    localStorage.setItem('anicine_music_playlists', JSON.stringify(list));
  };

  const toggleSongInPlaylist = (playlistId, song) => {
    const list = [...playlists];
    const pid = list.findIndex(p => p.id === playlistId);
    if (pid === -1) return;
    const sidx = list[pid].songs.findIndex(s => s.id === song.id);
    if (sidx >= 0) list[pid].songs.splice(sidx, 1);
    else list[pid].songs.unshift(song);
    setPlaylists(list);
    localStorage.setItem('anicine_music_playlists', JSON.stringify(list));
  };

  const addToRecent = (song) => {
    if (!song?.id) return;
    let list = recentlyPlayed.filter(s => s.id !== song.id);
    list.unshift(song);
    if (list.length > MAX_RECENT) list = list.slice(0, MAX_RECENT);
    setRecentlyPlayed(list);
    localStorage.setItem('anicine_recently_played', JSON.stringify(list));
  };

  return { 
    likedSongs, toggleLike, isLiked, 
    playlists, createPlaylist, deletePlaylist, toggleSongInPlaylist,
    recentlyPlayed, addToRecent
  };
}
