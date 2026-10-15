import React from 'react';
import { Server, Radio, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

export default function ServerSelector({
    servers = [],
    activeServerId,
    onSelectServer,
    currentAudio = 'ja',
    onHealthCheck
}) {
    return (
        <div className="bg-[#121217] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Server size={18} className="text-primary" />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                            Authorized Streaming Providers
                        </h3>
                    </div>
                    <p className="text-xs text-textMuted mt-0.5">
                        Select a verified stream source. Providers are audited for genuine audio track streams.
                    </p>
                </div>

                {onHealthCheck && (
                    <button 
                        onClick={onHealthCheck}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-white/80 uppercase tracking-widest transition-all self-start sm:self-auto active:scale-95"
                    >
                        <RefreshCw size={12} /> Ping Providers
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {servers.map((server, idx) => {
                    const isSelected = server.id === activeServerId;
                    const supportsAudio = server.supportedAudio?.includes(currentAudio);
                    const isOffline = server.status === 'offline';

                    return (
                        <div
                            key={server.id}
                            onClick={() => !isOffline && onSelectServer(server)}
                            className={`
                                relative p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between
                                ${isSelected 
                                    ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(139,92,246,0.25)]' 
                                    : isOffline 
                                    ? 'bg-white/5 border-red-500/20 opacity-60 cursor-not-allowed'
                                    : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'}
                            `}
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
                                        <span className="text-xs font-black text-white truncate tracking-wide">
                                            {server.name}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white/10 text-white/80 border border-white/10 shrink-0">
                                        {server.protocol}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] text-textMuted mb-3">
                                    <span className="flex items-center gap-1 font-mono">
                                        <Radio size={10} className="text-primary" /> {server.pingMs || 35}ms
                                    </span>
                                    <span>•</span>
                                    <span className="truncate">{server.territory || 'Global'}</span>
                                </div>
                            </div>

                            <div>
                                {/* Audio tags */}
                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-1">
                                        {(server.supportedAudio || []).map(code => (
                                            <span 
                                                key={code}
                                                className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded ${code === currentAudio ? 'bg-primary text-white font-black' : 'bg-white/10 text-white/60'}`}
                                            >
                                                {code.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>

                                    {isSelected ? (
                                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-primary">
                                            <CheckCircle2 size={12} /> Active
                                        </span>
                                    ) : !supportsAudio ? (
                                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider" title="Does not support current audio track">
                                            No {currentAudio.toUpperCase()}
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-bold uppercase text-white/40 group-hover:text-white">
                                            Select
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
