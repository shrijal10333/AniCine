import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Anime from './pages/Anime';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Watch from './pages/Watch';
import Search from './pages/Search';
import MyList from './pages/MyList';
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
import { useLocation, useNavigate } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isPartyRoom = location.pathname.startsWith('/party/room/');
  const isChannels = location.pathname === '/channels';
  const isFeed = location.pathname === '/feed';
  const isMangaReader = location.pathname.startsWith('/manga/read/');
  const isNowPlaying = location.pathname === '/now-playing';
  const isMusic = location.pathname === '/music';

  // Global effect to scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSidebarOpen(false);
  }, [location.pathname]); // Trigger on path change only, not search params

  return (
    <div className="flex bg-background min-h-screen text-textMain relative overflow-x-hidden">
      {!isPartyRoom && !isMangaReader && !isFeed && !isNowPlaying && (
        <Sidebar
          isOpen={sidebarOpen}
          className={`fixed inset-y-0 left-0 z-[50] w-72 md:w-64 transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        />
      )}

      {/* Mobile Overlay */}
      {!isPartyRoom && !isMangaReader && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden transition-all duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 min-w-0 ${!isPartyRoom && !isMangaReader && !isFeed && !isNowPlaying ? 'md:pl-64' : ''}`}>
        {!isPartyRoom && !isMangaReader && !isNowPlaying && !isMusic && (
          <Navbar 
            onMenuClick={() => setSidebarOpen(true)} 
            isSidebarHidden={isPartyRoom || isMangaReader || isFeed || isNowPlaying}
          />
        )}
        <main className={`flex-1 ${!isNowPlaying && !isMusic ? 'pt-14 md:pt-20' : ''} ${!isPartyRoom && !isChannels && !isMangaReader && !isFeed && !isNowPlaying ? 'pb-10' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/anime" element={<Anime />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TVShows />} />
            <Route path="/4k" element={<Premium4K />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/search" element={<Search />} />
            <Route path="/music" element={<Music />} />
            <Route path="/now-playing" element={<NowPlaying />} />
            <Route path="/mylist" element={<MyList />} />
            <Route path="/history" element={<History />} />
            <Route path="/manga" element={<Manga />} />
            <Route path="/manga/:id" element={<MangaDetails />} />
            <Route path="/manga/read/:id" element={<MangaReader />} />
            <Route path="/party" element={<WatchPartyLobby />} />
            <Route path="/party/room/:roomCode" element={<PartyRoomWaiting />} />
            <Route path="/watch/:type/:id" element={<Watch />} />
            <Route path="/live/f1" element={<LiveF1 />} />
            <Route path="/live/cricket" element={<LiveCricket />} />
            <Route path="/live/esports" element={<LiveEsports />} />
            <Route path="/ott" element={<OttHub />} />
            <Route path="/ott/:id" element={<OttPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        {!isNowPlaying && <MusicPlayer />}
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
