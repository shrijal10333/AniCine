import { useState, useEffect } from 'react';
import { Server, CheckCircle2, AlertCircle, X, ExternalLink, RefreshCw, Sparkles, Globe, Shield } from 'lucide-react';
import { getBackendUrl, setCustomBackendUrl } from '../utils/backend';

export default function ServerSettingsModal({ isOpen, onClose, onSaved }) {
    const [urlInput, setUrlInput] = useState('');
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }

    useEffect(() => {
        if (isOpen) {
            setUrlInput(getBackendUrl() || '');
            setTestResult(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleTest = async () => {
        const target = urlInput.trim().replace(/\/+$/, '');
        setTesting(true);
        setTestResult(null);

        try {
            const endpoint = target ? `${target}/api/health` : '/api/health';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            
            const res = await fetch(endpoint, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                setTestResult({
                    success: true,
                    message: data.status === 'ok' ? 'Connected successfully to AniCine backend server!' : 'Server responded with OK status.'
                });
            } else {
                setTestResult({
                    success: false,
                    message: `Server reachable but returned HTTP ${res.status}.`
                });
            }
        } catch (e) {
            setTestResult({
                success: false,
                message: 'Unable to connect to this server URL. Make sure CORS is enabled and URL is https://'
            });
        } finally {
            setTesting(false);
        }
    };

    const handleSave = () => {
        setCustomBackendUrl(urlInput);
        if (onSaved) onSaved(urlInput);
        onClose();
    };

    const handleReset = () => {
        setUrlInput('');
        setCustomBackendUrl('');
        setTestResult(null);
        if (onSaved) onSaved('');
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="bg-[#111] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#1db954]/10 border border-[#1db954]/20 flex items-center justify-center text-[#1db954]">
                            <Server size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black uppercase tracking-tight text-white font-['Syne',sans-serif]">
                                Backend Server <span className="text-[#1db954]">Config</span>
                            </h3>
                            <p className="text-xs text-white/40">Connect your hosted Node.js / Socket.io server</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition">
                        <X size={18} />
                    </button>
                </div>

                {/* Vercel explanation tip */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Globe size={14} className="text-[#1db954]" />
                        <span>Deploying on Vercel?</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">
                        Vercel hosts the frontend static files. If your backend is hosted on <strong className="text-white">Render, Railway, Fly.io, or VPS</strong>, enter the URL below so multiplayer watch parties and sockets connect across all devices.
                    </p>
                </div>

                {/* Input Field */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                        Custom Backend Server URL
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            placeholder="https://anicine-backend.onrender.com"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 outline-none focus:border-[#1db954]/50 transition"
                        />
                        <button
                            type="button"
                            onClick={handleTest}
                            disabled={testing}
                            className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition disabled:opacity-50"
                        >
                            {testing ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
                            {testing ? 'Testing...' : 'Test'}
                        </button>
                    </div>
                </div>

                {/* Test Feedback */}
                {testResult && (
                    <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${testResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                        {testResult.success ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                        <span className="leading-snug">{testResult.message}</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-bold transition"
                    >
                        Reset Default
                    </button>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-6 py-3 rounded-xl bg-[#1db954] hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition shadow-lg shadow-[#1db954]/20"
                        >
                            Save Server
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
