import React from 'react';
import { Link } from 'react-router-dom';
import { MonitorPlay } from 'lucide-react';
import { getImageUrl } from '../api';

const OTT_PLATFORMS = [
    { id: '8', name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', border: 'hover:border-[#E50914]' },
    { id: '119', name: 'Amazon Prime', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png', border: 'hover:border-[#00A8E1]' },
    { id: '337', name: 'Disney+', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', border: 'hover:border-[#113CCF]' },
    { id: '350', name: 'Apple TV+', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg', border: 'hover:border-white' },
    { id: '384', name: 'HBO Max', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg', border: 'hover:border-[#5822b4]' },
    { id: '122', name: 'JioHotstar', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Disney%2B_Hotstar_logo.svg', border: 'hover:border-[#10b981]' },
    { id: '232', name: 'Zee5', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Zee5_Official_logo.svg', border: 'hover:border-[#8b5cf6]' },
    { id: '237', name: 'Sony LIV', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Sony_LIV_logo.svg/512px-Sony_LIV_logo.svg.png', border: 'hover:border-[#f97316]' },
    { id: '220', name: 'JioCinema', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/JioCinema_Logo.svg/512px-JioCinema_Logo.svg.png', border: 'hover:border-[#db2777]' },
    { id: '437', name: 'MX Player', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/MX_Player_logo.svg/512px-MX_Player_logo.svg.png', border: 'hover:border-[#3b82f6]' },
    { id: '310', name: 'ALTBalaji', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/22/ALTBalaji_Logo.svg/512px-ALTBalaji_Logo.svg.png', border: 'hover:border-[#ef4444]' },
    { id: '218', name: 'Eros Now', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Eros_Now_logo.svg/512px-Eros_Now_logo.svg.png', border: 'hover:border-[#f59e0b]' },
    { id: '309', name: 'Sun NXT', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Sun_NXT_logo.svg/512px-Sun_NXT_logo.svg.png', border: 'hover:border-[#eab308]' },
];

export default function OttHub() {
    const [imgError, setImgError] = React.useState({});
    
    return (
        <div className="min-h-screen bg-[#080808] text-white pt-24 pb-40 px-6 md:px-12 lg:px-20 overflow-hidden relative">
            <div className="max-w-[1920px] mx-auto animate-entrance pt-4 md:pt-0">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 mb-6 shadow-2xl">
                        <MonitorPlay size={36} className="text-[#1db954]" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4">
                        OTT <span className="text-[#1db954]">Channels</span>
                    </h1>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-xs md:text-sm max-w-xl">
                        Select a premium streaming provider to access and explore their exclusive, complete content catalog exactly as you would in their native application.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                    {OTT_PLATFORMS.map((ott) => (
                        <Link 
                            key={ott.id} 
                            to={`/ott/${ott.id}`}
                            className={`group relative aspect-video bg-[#121212] flex items-center justify-center p-8 md:p-12 rounded-3xl border border-white/10 ${ott.border} hover:scale-[1.03] transition-all duration-300 shadow-2xl overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none"></div>
                            
                            <img 
                                src={imgError[ott.id] ? `https://logo.clearbit.com/${ott.name.toLowerCase().replace(/[^a-z]/g, '')}.com` : ott.logo} 
                                alt={ott.name} 
                                onError={(e) => {
                                    if (!imgError[ott.id]) {
                                        setImgError(prev => ({ ...prev, [ott.id]: true }));
                                    } else {
                                        // Final absolute fallback if clearbit fails
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                    }
                                }}
                                className={`w-full h-full object-contain filter group-hover:scale-110 group-hover:brightness-110 transition-all duration-700 ease-out z-20 relative`}
                            />
                            
                            <div className="absolute inset-0 items-center justify-center z-20 hidden pointer-events-none px-6 text-center">
                                <span className={`text-xl md:text-3xl font-black uppercase tracking-widest text-shadow-lg`} style={{ color: ott.border.replace('hover:border-[', '').replace(']', '') || 'white' }}>
                                    {ott.name}
                                </span>
                            </div>

                            <div className="absolute bottom-4 uppercase font-black tracking-widest text-[10px] text-white/40 group-hover:text-white/90 transition-colors z-30">
                                Enter Network
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
