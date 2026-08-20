import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FEATURED_PLAYLISTS, 
  getPlaylistById, 
  searchSongs, 
  getBestImage 
} from '../api/musicApi';
import { useMusic } from '../context/MusicContext';
import { useMusicLibrary } from '../hooks/useMusicLibrary';
import { 
  Play, Pause, Search, Disc3, Music as MusicIcon, ListMusic, Loader2, 
  Heart, Plus, Trash2, ArrowLeft, Clock, Shuffle, ChevronRight, Headphones,
  Star, Zap, Smile
} from 'lucide-react';

export default function Music() {
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();
  const { likedSongs, playlists, createPlaylist, deletePlaylist, toggleLike, isLiked, toggleSongInPlaylist, recentlyPlayed } = useMusicLibrary();
  const navigate = useNavigate();
  const [playlistsData, setPlaylistsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [addSongTarget, setAddSongTarget] = useState(null);

  const BROWSE_CATEGORIES = [
    { name: "Pop", color: "bg-[#8B5CF6]" },
    { name: "Hip-Hop", color: "bg-[#FBBF24]" },
    { name: "Lo-Fi", color: "bg-[#34D399]" },
    { name: "Bollywood", color: "bg-[#F472B6]" },
    { name: "Romance", color: "bg-[#F87171]" },
    { name: "Workout", color: "bg-[#4ADE80]" },
    { name: "Chill", color: "bg-[#60A5FA]" },
    { name: "Party", color: "bg-[#A78BFA]" },
    { name: "Punjabi", color: "bg-[#FCD34D]" },
    { name: "Tamil", color: "bg-[#34D399]" },
    { name: "Telugu", color: "bg-[#818CF8]" },
    { name: "Rock", color: "bg-[#94A3B8]" },
    { name: "EDM", color: "bg-[#C084FC]" },
    { name: "Indie", color: "bg-[#FB923C]" },
    { name: "Classical", color: "bg-[#D1D5DB]" },
    { name: "K-Pop", color: "bg-[#F472B6]" },
  ];

  const AddMenu = ({ song }) => (
    <div className={`absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200`} onClick={e => e.stopPropagation()}>
      <button 
        onClick={(e) => { e.stopPropagation(); setAddSongTarget(song); }}
        className="w-10 h-10 bg-white border-2 border-[#1E293B] rounded-full flex items-center justify-center text-[#1E293B] hover:bg-[#8B5CF6] hover:text-white transition-all shadow-pop-sm hover:shadow-pop-md scale-90 hover:scale-100"
      >
        <Plus size={20} />
      </button>
    </div>
  );

  const LikeBtn = ({ song }) => (
    <button 
      onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
      className="shrink-0 transition-transform active:scale-125"
    >
      <Heart size={20} fill={isLiked(song.id) ? '#F472B6' : 'none'} className={isLiked(song.id) ? 'text-[#F472B6]' : 'text-[#1E293B] opacity-20 hover:opacity-100'} />
    </button>
  );

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const promises = FEATURED_PLAYLISTS.map(p => getPlaylistById(p.id));
        const results = await Promise.all(promises);
        setPlaylistsData(results.filter(r => r !== null));
      } catch (err) {
        console.error("Failed to fetch featured playlists", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        searchSongs(searchQuery).then(data => {
          setSearchResults(data?.results || []);
          setIsSearching(false);
        }).catch(() => setIsSearching(false));
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePlaySong = (song, queue = []) => {
    playSong(song, queue, queue.findIndex(s => s.id === song.id) !== -1 ? queue.findIndex(s => s.id === song.id) : 0);
  };

  const handlePlayPlaylist = (playlist) => {
    if (playlist?.songs?.length > 0) {
      playSong(playlist.songs[0], playlist.songs, 0);
    }
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setSearchQuery(cat);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Rise & Shine';
    if (hour < 17) return 'Good Vibes';
    return 'Starry Night';
  };

  return (
    <div className="playful-theme min-h-screen pb-32 overflow-x-hidden">
      {/* Background Decorations */}
      <div className="blob-shape bg-[#8B5CF6] w-96 h-96 top-0 -left-20 animate-pulse"></div>
      <div className="blob-shape bg-[#FBBF24] w-64 h-64 top-1/2 -right-10 animate-bounce" style={{ animationDuration: '4s' }}></div>
      <div className="blob-shape bg-[#F472B6] w-80 h-80 bottom-40 left-1/4 animate-pulse"></div>

      <div className="relative px-4 md:px-12 pt-6 md:pt-10 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="bounce-in">
            <h1 className="text-4xl md:text-7xl font-outfit font-black text-[#1E293B] mb-3 flex items-center gap-4">
              {getGreeting()}! <Smile size={48} className="text-[#FBBF24]" />
            </h1>
            <p className="text-xl md:text-2xl font-jakarta font-medium text-[#64748B]">
              Discover your next <span className="bg-[#FBBF24] px-2 border-2 border-[#1E293B] rounded-lg -rotate-2 inline-block">favorite frequency</span>...
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-[450px]">
             <label className="label-playful">Looking for something?</label>
             <div className="relative group">
              <input
                type="text"
                placeholder="Search songs, artists, vibes..."
                className="input-playful pr-12 shadow-pop-sm group-hover:shadow-pop-md"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory(null); }}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#8B5CF6] border-2 border-[#1E293B] rounded-xl flex items-center justify-center text-white shadow-pop-sm">
                <Search size={20} strokeWidth={3} />
              </div>
             </div>
          </div>
        </div>

        {/* Recently Played Quick Grid */}
        {!searchQuery.trim() && recentlyPlayed.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {recentlyPlayed.slice(0, 6).map((song, idx) => {
              const isActive = currentSong?.id === song.id;
              return (
                <button
                  key={'qp-'+song.id}
                  onClick={() => isActive ? togglePlay() : handlePlaySong(song, recentlyPlayed)}
                  className={`flex items-center gap-4 bg-white border-2 border-[#1E293B] p-3 rounded-[20px] transition-all group shadow-pop-sm hover:scale-[1.02] hover:shadow-pop-md ${isActive ? 'bg-[#8B5CF6]/5 border-[#8B5CF6] shadow-pop-accent' : ''}`}
                >
                  <div className="w-16 h-16 border-2 border-[#1E293B] rounded-2xl overflow-hidden shrink-0 rotate-2 group-hover:rotate-0 transition-transform shadow-pop-sm">
                    <img src={getBestImage(song.image)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`font-outfit font-extrabold text-lg truncate ${isActive ? 'text-[#8B5CF6]' : 'text-[#1E293B]'}`}>
                      {song.name}
                    </p>
                    <p className="text-sm font-jakarta text-[#64748B] truncate">{song.primaryArtists}</p>
                  </div>
                  <div className={`w-12 h-12 bg-[#8B5CF6] border-2 border-[#1E293B] rounded-full flex items-center justify-center text-white shadow-pop-sm transition-all group-hover:scale-110 ${isActive ? 'opacity-100 flex' : 'opacity-0 hidden group-hover:flex'}`}>
                    {isActive && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 md:px-12 space-y-24">
        {/* Search Results Section */}
        {searchQuery.trim().length > 2 && (
          <div className="animate-entrance">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-[#1E293B]">
                {activeCategory ? `vibe: ${activeCategory}` : `frequency found: "${searchQuery}"`}
              </h2>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory(null); }}
                className="btn-playful-secondary py-3 px-6"
              >
                <ArrowLeft size={18} strokeWidth={3} /> Clear
              </button>
            </div>
            
            {isSearching ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="w-16 h-16 animate-spin text-[#8B5CF6]" />
                <p className="font-outfit font-bold uppercase tracking-widest text-[#64748B]">Scanning waves...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="sticker-card p-4 overflow-hidden">
                {searchResults.map((song, idx) => {
                  const isActive = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => handlePlaySong(song, searchResults)}
                      className={`w-full flex items-center gap-4 px-6 py-4 border-b-2 border-[#F1F5F9] last:border-0 hover:bg-[#F1F5F9]/50 transition-all group text-left cursor-pointer ${isActive ? 'bg-[#8B5CF6]/5 border-[#8B5CF6]/20' : ''}`}
                    >
                      <span className="w-8 font-outfit font-black text-2xl text-[#1E293B]/10 group-hover:text-[#8B5CF6]/30">{String(idx + 1).padStart(2, '0')}</span>
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className="w-14 h-14 border-2 border-[#1E293B] rounded-xl shrink-0 overflow-hidden shadow-pop-sm group-hover:-rotate-3 transition-transform">
                           <img src={getBestImage(song.image)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xl font-outfit font-extrabold truncate ${isActive ? 'text-[#8B5CF6]' : 'text-[#1E293B]'}`}>{song.name}</p>
                          <p className="text-sm font-jakarta font-bold text-[#1e293b]/60 truncate">{song.primaryArtists}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <span className="hidden md:block font-outfit font-bold text-[#64748B]/40">{song.duration ? `${Math.floor(song.duration/60)}:${String(song.duration%60).padStart(2,'0')}` : '--:--'}</span>
                         <LikeBtn song={song} />
                         <button 
                          onClick={(e) => { e.stopPropagation(); setAddSongTarget(song); }} 
                          className="w-10 h-10 border-2 border-[#1E293B] rounded-lg flex items-center justify-center text-[#1E293B] hover:bg-[#34D399] hover:text-white transition-all shadow-pop-sm hover:scale-105"
                         >
                           <Plus size={20} strokeWidth={3} />
                          </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="sticker-card p-32 text-center flex flex-col items-center gap-6">
                <Search size={80} className="text-[#1E293B]/5" />
                <p className="text-[#1E293B] font-outfit font-black text-3xl">That track is missing!</p>
                <button onClick={() => setSearchQuery('')} className="btn-playful-primary">Try another frequency</button>
              </div>
            )}
          </div>
        )}

        {/* Browse Categories Section */}
        {!searchQuery.trim() && (
          <>
            <section>
              <div className="flex items-center gap-4 mb-10">
                <div className="bg-[#FBBF24] p-3 border-2 border-[#1E293B] rounded-2xl rotate-3 shadow-pop-sm">
                  <Star fill="white" className="text-white" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black">Pulse Station</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-6">
                {BROWSE_CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`relative aspect-square border-2 border-[#1E293B] rounded-[24px] shadow-pop-sm transition-all group overflow-hidden hover:scale-105 hover:shadow-pop-md ${idx % 2 === 0 ? '-rotate-2' : 'rotate-2 hover:rotate-0'} ${cat.color}`}
                  >
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="absolute top-4 left-4 text-xl font-outfit font-black text-white leading-tight text-left drop-shadow-md">{cat.name}</span>
                    <Headphones size={70} className="absolute -bottom-4 -right-4 text-white/20 rotate-[15deg] group-hover:scale-125 group-hover:rotate-0 transition-all" />
                  </button>
                ))}
              </div>
            </section>

            {/* Recently Played Large Display */}
            {recentlyPlayed.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-[#34D399] p-3 border-2 border-[#1E293B] rounded-2xl -rotate-3 shadow-pop-sm">
                    <Zap fill="white" className="text-white" />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black">Recent Spins</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                  {recentlyPlayed.slice(0, 12).map((song, idx) => (
                    <div
                      key={'recent-'+song.id}
                      onClick={() => handlePlaySong(song, recentlyPlayed)}
                      className={`group cursor-pointer transition-all ${idx % 2 === 0 ? '-rotate-1 hover:rotate-0' : 'rotate-1 hover:rotate-0'}`}
                    >
                      <div className="sticker-card p-4 h-full flex flex-col">
                         <div className="aspect-square border-2 border-[#1E293B] rounded-[18px] overflow-hidden mb-4 shadow-pop-sm group-hover:shadow-pop-md transition-all bg-[#F1F5F9]">
                            <img src={getBestImage(song.image)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-lg font-outfit font-black text-[#1E293B] truncate mb-1">{song.name}</p>
                            <p className="text-xs font-jakarta font-bold text-[#64748B] truncate uppercase tracking-tighter opacity-70">{song.primaryArtists}</p>
                         </div>
                         <div className="mt-4 flex items-center justify-between">
                            <LikeBtn song={song} />
                            <div className="w-8 h-8 bg-[#8B5CF6] border-2 border-[#1E293B] rounded-lg flex items-center justify-center text-white scale-90 group-hover:scale-110 transition-transform">
                               <Play size={14} fill="white" className="ml-0.5" />
                            </div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Custom Playlists / Notebooks */}
            <section className="bg-[#8B5CF6]/5 -mx-4 md:-mx-12 px-4 md:px-12 py-20 border-y-4 border-dashed border-[#1E293B]/10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="bg-[#F472B6] p-3 border-2 border-[#1E293B] rounded-2xl rotate-6 shadow-pop-sm">
                    <ListMusic className="text-white" />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black">Your Mixtapes</h2>
                </div>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn-playful-primary py-4 px-10"
                >
                  <Plus size={24} strokeWidth={3} /> Create Mixtape
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {playlists.map((playlist, idx) => (
                  <div key={'my-pl-'+playlist.id} className="group relative">
                    <div className="bg-white border-2 border-[#1E293B] p-5 rounded-[32px] shadow-pop-lg transition-all group-hover:-translate-y-2 group-hover:rotate-1">
                      <div className="absolute -top-3 -right-3 z-10">
                        <button 
                          onClick={(e) => { e.stopPropagation(); if(confirm('Tear out this tape?')) deletePlaylist(playlist.id); }} 
                          className="w-12 h-12 bg-[#F87171] text-white border-2 border-[#1E293B] rounded-2xl flex items-center justify-center shadow-pop-sm hover:scale-110 active:scale-95"
                        >
                          <Trash2 size={18} strokeWidth={3} />
                        </button>
                      </div>
                      <div className="aspect-video bg-[#F1F5F9] border-2 border-[#1E293B] rounded-2xl mb-5 flex items-center justify-center relative overflow-hidden group-hover:shadow-inner">
                        <Disc3 size={60} className="text-[#1E293B]/5 animate-spin-slow" />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {playlist.songs.length > 0 ? (
                          <div 
                            onClick={() => playSong(playlist.songs[0], playlist.songs, 0)}
                            className="absolute inset-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform cursor-pointer"
                          >
                             <div className="w-16 h-16 bg-[#8B5CF6] border-2 border-[#1E293B] rounded-full flex items-center justify-center shadow-pop-md">
                                <Play fill="white" size={32} className="text-white ml-2" />
                             </div>
                          </div>
                        ) : (
                          <p className="font-outfit font-black text-[#1E293B]/20 uppercase">Empty Page</p>
                        )}
                      </div>
                      <h3 className="text-2xl font-black text-[#1E293B] mb-1 truncate">{playlist.name}</h3>
                      <p className="font-jakarta font-bold text-[#64748B] uppercase text-xs tracking-widest">{playlist.songs.length} Tracks recorded</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* External Featured Lists */}
            {!loading && playlistsData.map((playlist, sectionIdx) => (
              <section key={playlist.id}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                  <h2 className="text-3xl md:text-5xl font-black bg-[#FBBF24]/10 p-2 rounded-xl border-l-8 border-[#FBBF24]">{playlist.name}</h2>
                  <button 
                    onClick={() => handlePlayPlaylist(playlist)}
                    className="btn-playful-secondary py-3 px-8"
                  >
                    <Shuffle size={20} strokeWidth={3} /> Play Vibe
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                  {playlist.songs?.slice(0, 12).map((song, songIdx) => {
                    const isActive = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => handlePlaySong(song, playlist.songs)}
                        className={`group cursor-pointer transition-all ${songIdx % 4 === 0 ? '-rotate-1' : 'rotate-1'}`}
                      >
                        <div className={`sticker-card p-4 transition-all relative ${isActive ? 'shadow-pop-accent -translate-y-2 !rotate-0' : ''}`}>
                          <div className="aspect-square border-2 border-[#1E293B] rounded-[20px] overflow-hidden mb-4 shadow-pop-sm group-hover:scale-105 transition-transform bg-[#F1F5F9]">
                             <img src={getBestImage(song.image)} alt="" className="w-full h-full object-cover" />
                             {isActive && isPlaying && (
                               <div className="absolute inset-0 bg-[#8B5CF6]/30 flex items-center justify-center backdrop-blur-[2px]">
                                  <div className="w-16 h-16 bg-white border-2 border-[#1E293B] rounded-full flex items-center justify-center shadow-pop-md scale-110"><Pause size={32} /></div>
                               </div>
                             )}
                          </div>
                          <AddMenu song={song} />
                          <p className={`text-lg font-outfit font-black truncate leading-tight ${isActive ? 'text-[#8B5CF6]' : 'text-[#1E293B]'}`}>{song.name}</p>
                          <p className="text-xs font-jakarta font-medium text-[#64748B] truncate mt-1">{song.primaryArtists}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </>
        )}
      </div>

      {/* Add To Modal */}
      {addSongTarget && (
        <div className="fixed inset-0 z-[200] bg-[#1E293B]/40 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setAddSongTarget(null)}>
          <div className="sticker-card p-10 w-full max-w-md flex flex-col max-h-[85vh] bounce-in !rotate-0" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-6 mb-10 pb-10 border-b-4 border-dashed border-[#F1F5F9]">
              <div className="w-24 h-24 border-2 border-[#1E293B] rounded-[24px] shrink-0 overflow-hidden shadow-pop-md rotate-3">
                <img src={getBestImage(addSongTarget.image)} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="min-w-0">
                <h3 className="text-3xl font-black text-[#1E293B] leading-tight mb-2">Tape to Mixtape</h3>
                <p className="text-lg font-jakarta font-bold text-[#64748B] truncate">{addSongTarget.name}</p>
              </div>
            </div>
            
            <div className="overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-8">
              <button 
                onClick={() => { toggleLike(addSongTarget); setAddSongTarget(null); }}
                className="w-full flex items-center gap-5 p-4 bg-[#F472B6]/5 border-2 border-[#1E293B] rounded-2xl hover:bg-[#F472B6]/10 transition-all text-left group shadow-pop-sm active:shadow-none translate-x-0 active:translate-x-0.5 active:translate-y-0.5"
              >
                <div className="w-12 h-12 bg-[#F472B6] border-2 border-[#1E293B] rounded-full flex items-center justify-center text-white shadow-pop-sm group-hover:scale-110 transition-transform">
                  <Heart size={22} fill="white" />
                </div>
                <span className="font-outfit font-black text-xl text-[#1E293B]">Top Liked</span>
                {isLiked(addSongTarget.id) && <div className="ml-auto w-4 h-4 rounded-full bg-[#F472B6] border-2 border-[#1E293B]"></div>}
              </button>
              
              {playlists.map((p, idx) => {
                const hasSong = p.songs.some(s => s.id === addSongTarget.id);
                return (
                  <button 
                    key={p.id}
                    onClick={() => { toggleSongInPlaylist(p.id, addSongTarget); setAddSongTarget(null); }}
                    className={`w-full flex items-center gap-5 p-4 bg-white border-2 border-[#1E293B] rounded-2xl hover:bg-[#F1F5F9] transition-all text-left group shadow-pop-sm active:shadow-none active:translate-x-0.5 active:translate-y-0.5`}
                  >
                    <div className="w-12 h-12 bg-[#FBBF24] border-2 border-[#1E293B] rounded-xl flex items-center justify-center text-white shadow-pop-sm">
                      <ListMusic size={22} strokeWidth={3} />
                    </div>
                    <span className="font-outfit font-black text-xl text-[#1E293B] truncate">{p.name}</span>
                    {hasSong && <div className="ml-auto w-4 h-4 rounded-full bg-[#34D399] border-2 border-[#1E293B]"></div>}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => { setAddSongTarget(null); setShowCreateModal(true); }}
              className="btn-playful-secondary w-full py-5 text-lg"
            >
              <Plus size={24} strokeWidth={4} /> New Tape Mix
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[200] bg-[#1E293B]/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="sticker-card p-12 w-full max-w-md shadow-pop-xl bounce-in !rotate-0" onClick={e => e.stopPropagation()}>
            <h3 className="text-4xl font-black text-[#1E293B] mb-8">New Digital Tape</h3>
            <div className="mb-10">
              <label className="label-playful">Tape Name</label>
              <input
                type="text"
                placeholder="Chill Vibes, Party Mix..."
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                className="input-playful text-xl"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && newPlaylistName.trim()) {
                    createPlaylist(newPlaylistName.trim());
                    setShowCreateModal(false);
                    setNewPlaylistName('');
                  }
                }}
              />
            </div>
            <div className="flex gap-6 justify-end">
              <button 
                onClick={() => { setShowCreateModal(false); setNewPlaylistName(''); }}
                className="font-outfit font-black text-xl text-[#64748B] hover:text-[#1E293B] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newPlaylistName.trim()) {
                    createPlaylist(newPlaylistName.trim());
                    setShowCreateModal(false);
                    setNewPlaylistName('');
                  }
                }}
                className={`btn-playful-primary !px-12 ${!newPlaylistName.trim() ? 'opacity-50 pointer-events-none' : ''}`}
                disabled={!newPlaylistName.trim()}
              >
                Record!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
