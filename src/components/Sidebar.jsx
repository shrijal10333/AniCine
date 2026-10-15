import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutGrid, Film, Tv, MonitorPlay, Flame, Layers, 
    Sparkles, Heart, Clock, History, User, Settings, 
    Search, Users, Monitor, Zap, BookOpen, Music, 
    ShieldCheck, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileAvatar } from '../pages/Profile';

export default function Sidebar({ isOpen, className }) {
    const { user, isAdmin, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const sections = [
        {
            title: 'Discover',
            items: [
                { name: 'Home', icon: <LayoutGrid size={18} />, path: '/' },
                { name: 'Anime', icon: <MonitorPlay size={18} />, path: '/anime', color: 'text-primary' },
                { name: 'Movies', icon: <Film size={18} />, path: '/movies' },
                { name: 'TV Shows', icon: <Tv size={18} />, path: '/tv' },
                { name: 'Trending', icon: <Flame size={18} />, path: '/trending', color: 'text-amber-400' },
                { name: 'Genres', icon: <Layers size={18} />, path: '/genres' },
                { name: 'Recently Added', icon: <Sparkles size={18} />, path: '/recent' }
            ]
        },
        {
            title: 'Personal',
            items: [
                { name: 'Watchlist', icon: <Heart size={18} />, path: '/mylist' },
                { name: 'Continue Watching', icon: <Clock size={18} />, path: '/continue-watching' },
                { name: 'Watch History', icon: <History size={18} />, path: '/history' },
                { name: 'My Profile', icon: <User size={18} />, path: '/profile' },
                { name: 'Settings', icon: <Settings size={18} />, path: '/settings' }
            ]
        },
        {
            title: 'Extras & Platform',
            items: [
                { name: 'Search', icon: <Search size={18} />, path: '/search' },
                { name: 'Watch Party', icon: <Users size={18} />, path: '/party', color: 'text-primary' },
                { name: 'OTT Hub', icon: <Monitor size={18} />, path: '/ott', color: 'text-rose-500' },
                { name: 'Manga Reader', icon: <BookOpen size={18} />, path: '/manga' },
                { name: 'Music Player', icon: <Music size={18} />, path: '/music' },
                { name: 'Admin Dashboard', icon: <ShieldCheck size={18} />, path: '/admin', color: 'text-accent' }
            ]
        }
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <aside className={`${className} bg-[#0E0E14] border-r border-white/5 flex flex-col transition-all duration-300 ease-out z-[100]`}>
            {/* Logo */}
            <div className="h-16 md:h-20 flex items-center px-6 border-b border-white/5 shrink-0">
                <Link to="/" className="group flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary via-accentViolet to-accent p-[1.5px] shadow-[0_0_20px_rgba(139,92,246,0.35)] group-hover:scale-105 transition-all">
                        <div className="w-full h-full bg-[#121217] rounded-[14px] flex items-center justify-center">
                            <Zap size={20} className="text-primary fill-primary group-hover:rotate-12 transition-transform" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-xl font-black text-white tracking-tight uppercase leading-none font-sans">
                                Ani<span className="text-primary">Cine</span>
                            </h1>
                            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                                PRO
                            </span>
                        </div>
                        <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-textMuted mt-0.5">
                            Anime & Entertainment
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 px-4 py-6 space-y-7 overflow-y-auto custom-scrollbar">
                {sections.map(section => (
                    <div key={section.title}>
                        <p className="px-3 text-[9px] font-black text-white/30 uppercase tracking-[0.25em] mb-2.5">
                            {section.title}
                        </p>
                        <div className="space-y-1">
                            {section.items.map(item => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`
                                        flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-xs font-bold
                                        ${isActive(item.path)
                                            ? 'bg-primary text-white font-black shadow-lg shadow-primary/25'
                                            : 'text-textMuted hover:text-white hover:bg-white/5'}
                                    `}
                                >
                                    <span className={`transition-transform duration-200 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'} ${item.color || ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="truncate tracking-wide">
                                        {item.name}
                                    </span>
                                    {item.path === '/admin' && (
                                        <span className="ml-auto text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                                            Admin
                                        </span>
                                    )}
                                    {isActive(item.path) && item.path !== '/admin' && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* User Profile Bar */}
            <div className="p-4 border-t border-white/5 bg-[#0A0A0F]">
                {user ? (
                    <div className="space-y-3">
                        <div 
                            onClick={() => navigate('/profile')}
                            className="p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center gap-3 cursor-pointer group"
                        >
                            <ProfileAvatar user={user} size="sm" className="ring-2 ring-primary/30" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-white truncate tracking-wide">{user.name}</p>
                                <span className="text-[9px] font-bold text-primary uppercase tracking-wider block">
                                    {user.role === 'admin' ? 'Administrator' : 'Verified Member'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-textMuted hover:text-red-400 text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                            <LogOut size={13} /> Sign Out
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/auth"
                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary hover:bg-primaryHover text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/25"
                    >
                        Sign In / Register
                    </Link>
                )}
            </div>
        </aside>
    );
}
