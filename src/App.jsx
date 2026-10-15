import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Anime from './pages/Anime';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Trending from './pages/Trending';
import Genres from './pages/Genres';
import RecentlyAdded from './pages/RecentlyAdded';
import ContinueWatching from './pages/ContinueWatching';
import Watch from './pages/Watch';
import Search from './pages/Search';
import MyList from './pages/MyList';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import WatchPartyLobby from './pages/WatchPartyLobby';
import PartyRoomWaiting from './pages/PartyRoomWaiting';
import Premium4K from './pages/Premium4K';
import Channels from './pages/Channels';
import History from './pages/History';
import Manga from './pages/Manga';
import MangaDetails from './pages/MangaDetails';
import MangaReader from './pages/MangaReader';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Music from './pages/Music';
import NowPlaying from './pages/NowPlaying';
import LiveF1 from './pages/LiveF1';
import LiveCricket from './pages/LiveCricket';
import LiveEsports from './pages/LiveEsports';
import OttPage from './pages/OttPage';
import OttHub from './pages/OttHub';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import MusicPlayer from './components/MusicPlayer';

function AppContent() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isPartyRoom = location.pathname.startsWith('/party/room/');
  const isChannels = location.pathname === '/channels';
  const isFeed = location.pathname === '/feed';
  const isMangaReader = location.pathname.startsWith('/manga/read/');
  const isNowPlaying = location.pathname === '/now-playing';
  const isMusic = location.pathname === '/music';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex bg-[#0B0B0E] min-h-screen text-textMain relative overflow-x-hidden font-sans">
      {!isPartyRoom && !isMangaReader && !isFeed && !isNowPlaying && (
        <Sidebar
          isOpen={sidebarOpen}
          className={`fixed inset-y-0 left-0 z-[50] w-72 md:w-64 transition-transform duration-300 ease-in-out md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        />
      )}

      {/* Mobile Overlay */}
      {!isPartyRoom && !isMangaReader && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 min-w-0 ${
        !isPartyRoom && !isMangaReader && !isFeed && !isNowPlaying ? 'md:pl-64' : ''
      }`}>
        {!isPartyRoom && !isMangaReader && !isNowPlaying && !isMusic && (
          <Navbar 
            onMenuClick={() => setSidebarOpen(true)} 
            isSidebarHidden={isPartyRoom || isMangaReader || isFeed || isNowPlaying}
          />
        )}
        <main className={`flex-1 ${!isNowPlaying && !isMusic && !isPartyRoom ? 'pt-14 md:pt-20' : ''} ${
          !isPartyRoom && !isChannels && !isMangaReader && !isFeed && !isNowPlaying ? 'pb-10' : ''
        }`}>
          <Routes>
            {/* Discover */}
            <Route path="/" element={<Home />} />
            <Route path="/anime" element={<Anime />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TVShows />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/genres" element={<Genres />} />
            <Route path="/recent" element={<RecentlyAdded />} />

            {/* Personal */}
            <Route path="/mylist" element={<MyList />} />
            <Route path="/watchlist" element={<MyList />} />
            <Route path="/continue-watching" element={<ContinueWatching />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />

            {/* Admin Control */}
            <Route path="/admin" element={<Admin />} />

            {/* Player & Content */}
            <Route path="/watch/:type/:id" element={<Watch />} />
            <Route path="/search" element={<Search />} />
            <Route path="/party" element={<WatchPartyLobby />} />
            <Route path="/party/room/:roomCode" element={<PartyRoomWaiting />} />

            {/* Platforms & Extras */}
            <Route path="/4k" element={<Premium4K />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/music" element={<Music />} />
            <Route path="/now-playing" element={<NowPlaying />} />
            <Route path="/manga" element={<Manga />} />
            <Route path="/manga/:id" element={<MangaDetails />} />
            <Route path="/manga/read/:id" element={<MangaReader />} />
            <Route path="/live/f1" element={<LiveF1 />} />
            <Route path="/live/cricket" element={<LiveCricket />} />
            <Route path="/live/esports" element={<LiveEsports />} />
            <Route path="/ott" element={<OttHub />} />
            <Route path="/ott/:id" element={<OttPage />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
        {!isNowPlaying && !isPartyRoom && <MusicPlayer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </MusicProvider>
    </AuthProvider>
  );
}

export default App;
