import { Search, Bell, Menu, Sparkles, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { fetchApi, getImageUrl } from '../api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileAvatar } from '../pages/Profile';

export default function Navbar({ onMenuClick, isSidebarHidden }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mobileSearch, setMobileSearch] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const suggestionsRef = useRef(null);
    const mobileInputRef = useRef(null);
    const [isScrolled, setIsScrolled] = useState(false);

    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (mobileSearch && mobileInputRef.current) {
            mobileInputRef.current.focus();
        }
    }, [mobileSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length > 2) {
                setLoading(true);
                fetchApi('/search/multi', { query, include_adult: false }).then(data => {
                    if (data && data.results) {
                        setSuggestions(data.results.filter(i => i.media_type !== 'person' && i.poster_path).slice(0, 6));
                    }
                    setLoading(false);
                });
            } else {
                setSuggestions([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setQuery('');
            setShowSuggestions(false);
            setMobileSearch(false);
        }
    };

    const navLinks = [
        { name: 'Movies', path: '/movies' },
        { name: 'TV Shows', path: '/tv' },
        { name: 'Anime', path: '/anime' },
        { name: 'Manga', path: '/manga' },
        { name: 'Music', path: '/music' },
        { name: 'AniCine Feed', path: '/feed', highlight: true },
        { name: 'Premium', path: '/4k' },
    ];

    const isActive = (path) => location.pathname === path;

    const getPageTitle = () => {
        const titles = { '/': 'AniCine', '/movies': 'Movies', '/tv': 'TV Shows', '/anime': 'Anime', '/manga': 'Manga', '/music': 'Music', '/feed': 'Feed', '/4k': 'Premium', '/search': 'Search', '/mylist': 'Watchlist', '/history': 'History', '/party': 'Party', '/channels': 'Channels', '/profile': 'Profile', '/auth': 'Sign In' };
        // Check for /watch routes
        if (location.pathname.startsWith('/watch')) return 'Now Playing';
        return titles[location.pathname] || 'AniCine';
    };

    return (
        <nav className={`fixed top-0 ${isSidebarHidden ? 'left-0' : 'left-0 md:left-64'} right-0 z-[100] transition-all duration-500 ${isScrolled ? 'bg-[#0b0b0b]/80 backdrop-blur-3xl py-2 md:py-3 border-b border-white/5 shadow-2xl' : 'bg-transparent py-4 md:py-6'}`}>
            <div className="max-w-[1920px] mx-auto px-4 md:px-10 flex items-center justify-between gap-6">
                
                {/* Desktop Search */}
                <div className="hidden md:flex flex-1 max-w-2xl relative group" ref={suggestionsRef}>
                    <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${query ? 'text-primary' : 'text-white/20'}`} size={18} />
                    <form onSubmit={handleSearch} className="w-full">
                        <input
                            type="text"
                            placeholder="SEARCH MOVIES, SHOWS, MUSIC..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-16 pr-6 text-[11px] font-black tracking-widest text-white placeholder:text-white/20 outline-none focus:bg-white/10 focus:border-primary/30 transition-all uppercase"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                        />
                    </form>
                    
                    {/* Search suggestions */}
                    {showSuggestions && query.length > 2 && (suggestions.length > 0 || loading) && (
                        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] animate-entrance p-2 z-[200]">
                            {loading ? (
                                <div className="p-10 flex flex-col items-center gap-4">
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Analyzing Database...</span>
                                </div>
                            ) : (
                                <div className="grid gap-1">
                                    {suggestions.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setQuery(''); setShowSuggestions(false); navigate(`/watch/${item.media_type}/${item.id}`); }}
                                            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group text-left"
                                        >
                                            <div className="w-12 h-16 rounded-xl overflow-hidden border border-white/5 shrink-0">
                                                <img src={getImageUrl(item.poster_path, 'w92')} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-black text-white uppercase truncate">{item.title || item.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                     <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{item.media_type}</span>
                                                     <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                                                     <span className="text-[9px] font-bold text-primary">{(item.release_date || item.first_air_date || '').slice(0, 4)}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-3 md:gap-6 ml-auto">
                    {/* Mobile: Search + Menu */}
                    <div className="flex md:hidden items-center gap-3">
                         <button onClick={() => setMobileSearch(true)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                             <Search size={20} />
                         </button>
                         <button onClick={onMenuClick} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                             <Menu size={20} />
                         </button>
                    </div>

                    <button className="hidden sm:flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all group">
                         <Bell size={18} className="group-hover:rotate-12 transition-transform" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Feed</span>
                    </button>

                    {user ? (
                        <Link to="/profile" className="flex items-center gap-4 group">
                             <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary to-primaryDark p-[1px] group-hover:rotate-[10deg] transition-all">
                                 <div className="w-full h-full rounded-[15px] bg-[#0b0b0b] flex items-center justify-center overflow-hidden">
                                     <ProfileAvatar user={user} size="sm" />
                                 </div>
                             </div>
                        </Link>
                    ) : (
                        <Link to="/auth" className="bg-primary hover:bg-white text-black px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Search Overlay */}
            {mobileSearch && (
                <div className="fixed inset-0 bg-[#0b0b0b] z-[300] md:hidden p-4 animate-entrance">
                    <div className="flex items-center gap-4 mb-8">
                         <button onClick={() => setMobileSearch(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                             <ArrowLeft size={20} />
                         </button>
                         <div className="flex-1 relative">
                              <input
                                 ref={mobileInputRef}
                                 type="text"
                                 placeholder="SEARCH..."
                                 className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white uppercase outline-none focus:border-primary/40 ring-0"
                                 value={query}
                                 onChange={(e) => setQuery(e.target.value)}
                              />
                              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                         </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
