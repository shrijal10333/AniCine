import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, Tv, Film, Users, LayoutGrid, Heart, History,
    Settings, LogOut, Radio, MonitorPlay, Zap, BookOpen, Music,
    Trophy, Gamepad2, Monitor, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileAvatar } from '../pages/Profile';

export default function Sidebar({ isOpen, className }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const sections = [
        {
            title: 'Menu',
            items: [
                { name: 'Discover', icon: <LayoutGrid size={20} />, path: '/' },
                { name: 'Movies', icon: <Film size={20} />, path: '/movies' },
                { name: 'TV Shows', icon: <Tv size={20} />, path: '/tv' },
                { name: 'Anime', icon: <MonitorPlay size={20} />, path: '/anime' },
                { name: 'Manga', icon: <BookOpen size={20} />, path: '/manga' },
                { name: 'Music', icon: <Music size={20} />, path: '/music' },
            ]
        },
        {
            title: 'Live',
            items: [
                { name: 'F1 Racing', icon: <Radio size={20} />, path: '/live/f1', color: 'text-[#e10600]' },
                { name: 'Cricket', icon: <Trophy size={20} />, path: '/live/cricket', color: 'text-[#1db954]' },
                { name: 'Esports', icon: <Gamepad2 size={20} />, path: '/live/esports', color: 'text-purple-400' },
            ]
        },
        {
            title: 'OTT Channels',
            items: [
                { name: 'OTT Hub', icon: <Monitor size={20} />, path: '/ott', color: 'text-[#E50914]' },
            ]
        },
        {
            title: 'Features',
            items: [
                { name: 'AniCine Feed', icon: <MonitorPlay size={20} />, path: '/feed', color: 'text-[#1db954]' },
                { name: 'Channels', icon: <Radio size={20} />, path: '/channels' },
                { name: 'Watch Party', icon: <Users size={20} />, path: '/party' },
                { name: 'Upgrade Premium', icon: <Zap size={20} />, path: '/4k', color: 'text-accent' },
            ]
        },
        {
            title: 'Personal',
            items: [
                { name: 'Watchlist', icon: <Heart size={20} />, path: '/mylist' },
                { name: 'History', icon: <History size={20} />, path: '/history' },
            ]
        }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className={`${className} bg-[#0b0b0b] border-r border-white/5 flex flex-col transition-all duration-500 ease-out z-[100]`}>
            <div className="h-14 md:h-20 flex items-center px-6 md:px-8 border-b border-white/5 shrink-0">
                <Link to="/" className="group flex items-center gap-3.5">
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1db954] via-emerald-400 to-teal-300 p-[1.5px] shadow-[0_0_20px_rgba(29,185,84,0.3)] group-hover:shadow-[0_0_30px_rgba(29,185,84,0.5)] group-hover:scale-105 transition-all duration-300">
                        <div className="w-full h-full bg-[#0d0d0d] rounded-[14px] flex items-center justify-center">
                            <Zap size={20} className="text-[#1db954] fill-[#1db954] group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-xl font-black text-white tracking-tight uppercase leading-none font-['Syne',sans-serif]">
                                Ani<span className="text-[#1db954]">Cine</span>
                            </h1>
                            <span className="text-[7.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/25">
                                v2
                            </span>
                        </div>
                        <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-white/30 mt-0.5">
                            Cinema & Anime
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 px-4 space-y-8 md:space-y-12 overflow-y-auto custom-scrollbar pb-10 mt-10">
                {sections.map((section) => (
                    <div key={section.title} className="animate-entrance">
                        <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">
                            {section.title}
                        </p>
                        <div className="space-y-1">
                            {section.items.map((item, idx) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`
                                        flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                                        ${isActive(item.path)
                                            ? 'bg-primary text-black font-black shadow-[0_10px_30px_rgba(29,185,84,0.3)] hover:scale-105'
                                            : 'text-white/40 hover:text-white hover:bg-white/5'}
                                    `}
                                >
                                    <span className={`transition-all duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'} ${item.color || ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-widest leading-none">
                                        {item.name}
                                    </span>
                                    {isActive(item.path) && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black/40 animate-pulse shrink-0"></div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Status */}
            <div className="p-6 border-t border-white/5 bg-[#080808]">
                {user ? (
                    <div className="flex flex-col gap-4">
                        <div
                            onClick={() => navigate('/profile')}
                            className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all cursor-pointer group"
                        >
                            <ProfileAvatar user={user} size="sm" className="ring-2 ring-primary/20" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-white truncate uppercase tracking-widest leading-none">{user.name}</p>
                                <div className="flex items-center gap-2 mt-2">
                                     <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(29,185,84,0.5)]"></div>
                                     <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Premium Node</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/auth"
                        className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-primary text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </div>
    );
}
