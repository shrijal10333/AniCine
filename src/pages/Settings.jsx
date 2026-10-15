import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Globe, Subtitles, Play, Shield, CheckCircle2, Award, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const AUDIO_OPTIONS = [
    { code: 'ja', label: 'Japanese (Original)' },
    { code: 'en', label: 'English (Dub)' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' }
];

const SUBTITLE_OPTIONS = [
    { code: 'none', label: 'Off' },
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'ja', label: 'Japanese (CC)' }
];

export default function Settings() {
    const { preferences, updatePreferences, isAdmin } = useAuth();
    const [saved, setSaved] = useState(false);

    const handleAudioChange = (code) => {
        updatePreferences({ preferredAudio: code });
        showSaved();
    };

    const handleSubtitleChange = (code) => {
        updatePreferences({ preferredSubtitle: code });
        showSaved();
    };

    const handleToggleAutoplay = () => {
        updatePreferences({ autoplayNext: !preferences.autoplayNext });
        showSaved();
    };

    const showSaved = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0B0B0E] text-textMain px-4 md:px-8 py-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-xl">
                        <SettingsIcon size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                            Platform <span className="text-primary">Settings</span>
                        </h1>
                        <p className="text-xs text-textMuted mt-0.5">
                            Personalize streaming defaults, audio language preferences, and subtitle tracks.
                        </p>
                    </div>
                </div>

                {saved && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black animate-pulse">
                        <CheckCircle2 size={14} /> Saved
                    </span>
                )}
            </div>

            <div className="space-y-6">
                {/* Audio Preference */}
                <div className="p-6 rounded-3xl bg-[#121217] border border-white/10 space-y-4">
                    <div className="flex items-center gap-2">
                        <Globe size={18} className="text-primary" />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                            Default Audio Language
                        </h3>
                    </div>
                    <p className="text-xs text-textMuted">
                        Your preferred spoken language track. The player will automatically select this track whenever it is verified and available.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {AUDIO_OPTIONS.map(opt => (
                            <button
                                key={opt.code}
                                onClick={() => handleAudioChange(opt.code)}
                                className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition-all ${preferences.preferredAudio === opt.code ? 'bg-primary/20 text-primary border-primary shadow-lg shadow-primary/20' : 'bg-white/5 text-textMuted hover:text-white border-white/5 hover:bg-white/10'}`}
                            >
                                <div className="uppercase tracking-widest text-[9px] opacity-60">Audio Track</div>
                                <div className="mt-0.5">{opt.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subtitle Preference */}
                <div className="p-6 rounded-3xl bg-[#121217] border border-white/10 space-y-4">
                    <div className="flex items-center gap-2">
                        <Subtitles size={18} className="text-accent" />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                            Default Subtitle Language
                        </h3>
                    </div>
                    <p className="text-xs text-textMuted">
                        Preferred caption language. If available, subtitles in this language will display on player startup.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                        {SUBTITLE_OPTIONS.map(opt => (
                            <button
                                key={opt.code}
                                onClick={() => handleSubtitleChange(opt.code)}
                                className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${preferences.preferredSubtitle === opt.code ? 'bg-accent/20 text-accent border-accent shadow-lg shadow-accent/20' : 'bg-white/5 text-textMuted hover:text-white border-white/5 hover:bg-white/10'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Playback Automation */}
                <div className="p-6 rounded-3xl bg-[#121217] border border-white/10 space-y-4">
                    <div className="flex items-center gap-2">
                        <Play size={18} className="text-emerald-400" />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                            Playback Behavior
                        </h3>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div>
                            <h4 className="text-xs font-bold text-white">Autoplay Next Episode</h4>
                            <p className="text-[11px] text-textMuted mt-0.5">Automatically queue and load the next season episode when finished.</p>
                        </div>
                        <button
                            onClick={handleToggleAutoplay}
                            className={`w-12 h-7 rounded-full transition-all relative p-1 ${preferences.autoplayNext ? 'bg-primary' : 'bg-white/20'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white transition-all transform ${preferences.autoplayNext ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Administrative & QA Test Suite Shortcut */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/10 via-[#181822] to-accent/10 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-white font-black uppercase text-sm">
                            <Shield size={16} className="text-primary" /> System Health & Automated QA Suite
                        </div>
                        <p className="text-xs text-textMuted mt-1">
                            Run the 10-test automated verification suite for audio dubbing accuracy and provider fallback.
                        </p>
                    </div>
                    <Link
                        to="/admin"
                        className="px-6 py-2.5 rounded-full bg-primary hover:bg-primaryHover text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shrink-0"
                    >
                        {isAdmin ? 'Open Admin Control' : 'View Test Suite'}
                    </Link>
                </div>

                {/* Required TMDB Attribution */}
                <div className="p-6 rounded-3xl bg-[#121217] border border-white/5 text-center text-xs text-textMuted space-y-2">
                    <div className="flex items-center justify-center gap-2 text-white/80 font-bold">
                        <Info size={14} className="text-primary" /> API Attribution & Compliance
                    </div>
                    <p className="max-w-lg mx-auto text-[11px] leading-relaxed">
                        This product uses the TMDB API but is not endorsed or certified by TMDB. Movie and TV show metadata and artwork are provided by TMDB.
                    </p>
                </div>
            </div>
        </div>
    );
}
