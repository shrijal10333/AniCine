import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Camera, Check, Edit3, Quote, Sparkles, User } from 'lucide-react';

// Pre-built anime/series/movie character avatars
const WALLPAPER_OPTIONS = [
    { id: 'solo_leveling', name: 'Solo Leveling', image: 'https://images.weserv.nl/?url=image.tmdb.org/t/p/original/o9O8j09462W99yH8e78uS47D3O.jpg' },
    { id: 'jjk', name: 'Jujutsu Kaisen', image: 'https://images.weserv.nl/?url=image.tmdb.org/t/p/original/8497ls96v9v6M9vI5497M.jpg' }, // Generic JJK placeholder if this fails
    { id: 'interstellar', name: 'Interstellar', image: 'https://images.weserv.nl/?url=image.tmdb.org/t/p/original/o8I3D8W9V9W9V9W9V9W9.jpg' },
    { id: 'batman', name: 'The Batman', image: 'https://images.weserv.nl/?url=image.tmdb.org/t/p/original/74v76S67S67S67S67S.jpg' },
    { id: 'berserk', name: 'Berserk', image: 'https://images.weserv.nl/?url=cdn.myanimelist.net/images/anime/10/79313.jpg' },
];

// Reusing existing reliable character assets from TMDB/Jikan
const AVATAR_CATEGORIES = [
    {
        name: 'Anime',
        avatars: [
            { id: 'luffy', name: 'Luffy', emoji: '🍖', image: 'https://images.weserv.nl/?url=cdn.myanimelist.net/images/characters/9/310307.jpg', gradient: 'from-red-500 to-rose-400', initials: 'LF' },
            { id: 'zoro', name: 'Zoro', emoji: '⚔️', image: 'https://images.weserv.nl/?url=cdn.myanimelist.net/images/characters/3/100534.jpg', gradient: 'from-green-500 to-emerald-400', initials: 'ZR' },
            { id: 'naruto', name: 'Naruto', emoji: '🦊', image: 'https://images.weserv.nl/?url=cdn.myanimelist.net/images/characters/2/284124.jpg', gradient: 'from-orange-500 to-yellow-400', initials: 'NR' },
            { id: 'goku', name: 'Goku', emoji: '💥', image: 'https://images.weserv.nl/?url=cdn.myanimelist.net/images/characters/14/360492.jpg', gradient: 'from-blue-500 to-orange-400', initials: 'GK' },
            { id: 'gojo', name: 'Gojo', emoji: '🕶️', image: 'https://images.weserv.nl/?url=cdn.myanimelist.net/images/characters/2/437937.jpg', gradient: 'from-cyan-400 to-blue-300', initials: 'GJ' },
        ]
    },
    {
        name: 'Movies',
        avatars: [
            { id: 'ironman', name: 'Iron Man', emoji: '🤖', image: 'https://images.weserv.nl/?url=image.tmdb.org/t/p/w500/im9SAqJPZKEbVWGwhKmDzMgAeb.jpg', gradient: 'from-red-600 to-yellow-500', initials: 'IM' },
            { id: 'spiderman', name: 'Spider-Man', emoji: '🕸️', image: 'https://images.weserv.nl/?url=image.tmdb.org/t/p/w500/bBRlrpJm9XkArtcw1oqEGwvhZI1.jpg', gradient: 'from-red-300 to-blue-300', initials: 'SM' },
            { id: 'batman', name: 'Batman', emoji: '🦇', image: 'https://images.weserv.nl/?url=image.tmdb.org/t/p/w500/b7fTC9WFkgqGOv77mLQ3h1x1KWe.jpg', gradient: 'from-gray-800 to-gray-600', initials: 'BM' },
            { id: 'johnwick', name: 'John Wick', emoji: '🔫', image: 'https://images.weserv.nl/?url=image.tmdb.org/t/p/w500/idpfKhaEItW1C74LydP7mN8bA0j.jpg', gradient: 'from-purple-900 to-black', initials: 'JW' },
        ]
    }
];

// Better sources for static character wallpapers
const CHARACTER_WALLPAPERS = [
    { id: 'sung', name: 'Sung Jin Woo', emoji: '🗡️', image: 'https://images.weserv.nl/?url=images8.alphacoders.com/134/1349581.png' },
    { id: 'sukuna', name: 'Ryomen Sukuna', emoji: '🔥', image: 'https://images.weserv.nl/?url=images3.alphacoders.com/112/1127601.jpg' },
    { id: 'batman_red', name: 'The Batman', emoji: '🦇', image: 'https://images.weserv.nl/?url=images6.alphacoders.com/121/1210168.jpg' },
    { id: 'interstellar_b', name: 'Interstellar', emoji: '🪐', image: 'https://images.weserv.nl/?url=images5.alphacoders.com/542/542385.jpg' },
    { id: 'vbrand', name: 'Cyberpunk', emoji: '🌆', image: 'https://images.weserv.nl/?url=images4.alphacoders.com/105/1055740.jpg' },
];

const EMOJI_AVATARS = [
    { id: 'emoji_1', name: 'Goat', emoji: '🐐', gradient: 'from-orange-500 to-yellow-500' },
    { id: 'emoji_2', name: 'Alien', emoji: '👽', gradient: 'from-green-400 to-lime-500' },
    { id: 'emoji_3', name: 'Ghost', emoji: '👻', gradient: 'from-gray-200 to-stone-400' },
    { id: 'emoji_4', name: 'Heart', emoji: '💖', gradient: 'from-pink-500 to-rose-600' },
    { id: 'emoji_5', name: 'Spark', emoji: '✨', gradient: 'from-yellow-400 to-amber-500' },
    { id: 'emoji_6', name: 'Cool', emoji: '😎', gradient: 'from-blue-500 to-indigo-600' },
];

const STYLE_AVATARS = [
    { id: 'style_1', name: 'Pixel', image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Lucky', gradient: 'from-blue-400 to-emerald-400' },
    { id: 'style_2', name: 'Notion', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=King', gradient: 'from-stone-400 to-gray-500' },
    { id: 'style_3', name: 'Shape', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=Star', gradient: 'from-purple-500 to-pink-500' },
    { id: 'style_4', name: 'Bot', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot', gradient: 'from-cyan-500 to-blue-500' },
];

const ALL_AVATARS = [...AVATAR_CATEGORIES.flatMap(c => c.avatars), ...EMOJI_AVATARS, ...STYLE_AVATARS];

function getAvatarById(id) {
    return ALL_AVATARS.find(a => a.id === id);
}

export function ProfileAvatar({ user, size = 'md', className = '', glow = false }) {
    const [imgFailed, setImgFailed] = useState(false);
    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl',
        '2xl': 'w-32 h-32 text-5xl',
    };

    const radiusClasses = {
        xs: 'rounded-lg',
        sm: 'rounded-xl',
        md: 'rounded-xl',
        lg: 'rounded-2xl',
        xl: 'rounded-3xl',
        '2xl': 'rounded-[32px]',
    };

    const renderContent = () => {
        if (user?.avatar) {
            const avatar = getAvatarById(user.avatar);
            if (avatar) {
                if (avatar.image && !imgFailed) {
                    return <img src={avatar.image} alt={avatar.name} onError={() => setImgFailed(true)} className="w-full h-full object-cover" />;
                }
                return (
                    <div className={`w-full h-full bg-gradient-to-br ${avatar.gradient || 'from-[#1db954] to-black'} flex items-center justify-center text-white`}>
                        {avatar.emoji ? (
                             <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{avatar.emoji}</span>
                        ) : (
                             <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${avatar.id}`} className="w-full h-full opacity-60" alt="" />
                        )}
                    </div>
                );
            }
        }
        return (
            <div className={`w-full h-full bg-gradient-to-br from-[#1db954] to-[#00f2ff] flex items-center justify-center text-black font-black`}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
        );
    };

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            {glow && (
                <div className={`absolute -inset-1.5 bg-gradient-to-tr from-[#1db954] via-[#00f2ff] to-[#ff00ea] ${radiusClasses[size]} blur-md opacity-70 animate-pulse transition-opacity`}></div>
            )}
            <div className={`relative w-full h-full ${radiusClasses[size]} overflow-hidden shadow-lg border border-white/10`}>
                {renderContent()}
            </div>
        </div>
    );
}

export default function Profile() {
    const { user, updateProfile, logout } = useAuth();
    const navigate = useNavigate();

    const [editName, setEditName] = useState(user?.name || '');
    const [editSlogan, setEditSlogan] = useState(user?.slogan || '');
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
    const [selectedWallpaper, setSelectedWallpaper] = useState(user?.wallpaper || 'sung');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Anime');

    useEffect(() => {
        if (!user) {
            navigate('/auth');
        }
    }, [user, navigate]);

    if (!user) return null;

    const hasChanges = editName !== user.name || editSlogan !== (user.slogan || '') || selectedAvatar !== (user.avatar || '') || selectedWallpaper !== (user.wallpaper || '');

    const handleSave = async () => {
        if (!editName.trim()) {
            setError('Name cannot be empty');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await updateProfile({
                name: editName.trim(),
                slogan: editSlogan.trim(),
                avatar: selectedAvatar,
                wallpaper: selectedWallpaper
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setError(err.message);
        }
        setSaving(false);
    };

    const currentAvatarData = selectedAvatar ? getAvatarById(selectedAvatar) : null;
    const currentWallpaper = CHARACTER_WALLPAPERS.find(w => w.id === selectedWallpaper) || CHARACTER_WALLPAPERS[0];

    return (
        <div className="min-h-screen bg-[#080808] pt-32 pb-40 px-8 md:px-16 overflow-hidden selection:bg-[#ff4d4d]">
            <div className="max-w-[1400px] mx-auto relative z-10">
                
                <header className="flex flex-col md:flex-row items-center gap-12 mb-20 animate-entrance">
                    <button onClick={() => navigate(-1)} className="p-5 bg-white/5 border border-white/10 rounded-full hover:bg-[#1db954] hover:text-black transition-all group">
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex-1 text-center md:text-left">
                         <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">Your Profile</h1>
                         <p className="text-white/40 mt-4 text-lg">Manage your identity icon and account details.</p>
                    </div>
                </header>

                <div className="bg-[#121212] border border-white/5 rounded-[4rem] p-12 md:p-16 mb-12 shadow-2xl relative overflow-hidden group min-h-[350px] flex items-center">
                     {/* Dynamic Background Wallpaper */}
                     <div className="absolute inset-0 z-0">
                         <img 
                            src={currentWallpaper.image} 
                            className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000" 
                            alt="" 
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                            }}
                         />
                         <div className="absolute inset-0 hidden items-center justify-center text-[10rem] opacity-[0.03] select-none pointer-events-none">
                            {currentWallpaper.emoji}
                         </div>
                         <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-transparent to-[#080808]"></div>
                         <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent"></div>
                     </div>

                      <div className="flex flex-col md:flex-row items-center gap-12 relative z-10 w-full">
                           <div className="relative group/avatar">
                                <ProfileAvatar user={{ ...user, avatar: selectedAvatar }} size="2xl" glow={true} className="z-10" />
                                <div className="absolute inset-0 bg-black/60 rounded-[32px] flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm z-20">
                                    <Camera size={32} className="text-white" />
                                </div>
                                {currentAvatarData && (
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-[#1db954]/30 px-6 py-2 rounded-full shadow-2xl z-30">
                                        <span className="text-xs font-bold text-[#1db954] tracking-wider whitespace-nowrap">{currentAvatarData.name}</span>
                                    </div>
                                )}
                           </div>

                          <div className="flex-1 text-center md:text-left space-y-4">
                               <div className="flex items-center justify-center md:justify-start gap-4">
                                   <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-2">{user.name}</h2>
                                   <div className="px-5 py-2 bg-[#1db954] text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl hidden md:block">Premium Member</div>
                               </div>
                               {user.slogan && (
                                   <div className="bg-black/40 backdrop-blur-md px-6 py-4 rounded-3xl inline-flex items-center justify-center md:justify-start gap-3 border border-white/5">
                                       <Quote size={20} className="text-[#1db954]" />
                                       <p className="text-lg font-bold text-white/50">{user.slogan}</p>
                                   </div>
                               )}
                               <div className="flex items-center justify-center md:justify-start gap-6 pt-4">
                                    <span className="text-sm font-medium text-white/30 tracking-widest uppercase">{user.email}</span>
                               </div>
                          </div>

                          <button 
                            onClick={() => { logout(); navigate('/'); }}
                            className="px-10 py-5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95"
                          >
                              Log Out
                          </button>
                      </div>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div className="bg-[#121212] border border-white/5 rounded-[4rem] p-12 shadow-2xl flex flex-col justify-between">
                          <div>
                              <div className="flex items-center gap-4 mb-12">
                                   <Edit3 size={24} className="text-[#1db954]" />
                                   <h3 className="text-3xl font-black tracking-tight text-white">Edit Profile</h3>
                              </div>

                              <div className="space-y-10">
                                   <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-2">Name</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            maxLength={30}
                                            className="w-full bg-black/40 border border-white/5 text-white rounded-2xl p-5 outline-none focus:border-[#1db954]/40 text-lg font-bold transition-all"
                                        />
                                        <div className="flex justify-between items-center px-4">
                                             <span className="text-xs font-medium text-white/30">{editName.length}/30</span>
                                        </div>
                                   </div>

                                   <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-2">About Me</label>
                                        <textarea
                                            value={editSlogan}
                                            onChange={e => setEditSlogan(e.target.value)}
                                            maxLength={100}
                                            rows={2}
                                            className="w-full bg-black/40 border border-white/5 text-white rounded-2xl p-5 outline-none focus:border-[#1db954]/40 text-sm font-medium transition-all resize-none"
                                        />
                                         <div className="flex justify-between items-center px-4">
                                             <span className="text-xs font-medium text-white/30">{editSlogan.length}/100</span>
                                        </div>
                                   </div>
                              </div>
                          </div>

                          <button
                                onClick={handleSave}
                                disabled={!hasChanges || saving}
                                className={`w-full py-6 mt-10 rounded-full font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 ${saved
                                    ? 'bg-[#1db954] text-black shadow-[0_10px_40px_rgba(29,185,84,0.3)]'
                                    : hasChanges
                                        ? 'bg-white text-black hover:scale-[1.02] shadow-[0_10px_40px_rgba(255,255,255,0.1)]'
                                        : 'bg-white/5 text-white/20 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                {saved ? <><Check size={18} /> Saved successfully!</> : saving ? 'Saving...' : 'Save Changes'}
                            </button>
                     </div>

                     {/* Avatar Matrix */}
                     <div className="bg-[#121212] border border-white/5 rounded-[4rem] p-12 shadow-2xl">
                          <div className="flex items-center gap-4 mb-10">
                               <Sparkles size={24} className="text-[#1db954]" />
                               <h3 className="text-3xl font-black tracking-tight text-white">Choose Avatar</h3>
                          </div>

                           <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                               {['Anime', 'Movies', 'Emoji World', 'Styles', 'Wallpapers'].map(name => (
                                   <button
                                       key={name}
                                       onClick={() => setActiveTab(name)}
                                       className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === name ? 'bg-[#1db954] text-black shadow-lg scale-105' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                                   >
                                       {name}
                                   </button>
                               ))}
                          </div>

                          {activeTab === 'Emoji World' ? (
                               <div className="grid grid-cols-3 gap-4">
                                   {EMOJI_AVATARS.map(avatar => (
                                       <button
                                           key={avatar.id}
                                           onClick={() => setSelectedAvatar(avatar.id)}
                                           className={`aspect-square rounded-3xl relative transition-all duration-300 flex items-center justify-center text-4xl bg-gradient-to-br ${avatar.gradient} ${selectedAvatar === avatar.id ? 'ring-4 ring-[#1db954] scale-110 shadow-2xl' : 'opacity-40 hover:opacity-100'}`}
                                       >
                                           {avatar.emoji}
                                       </button>
                                   ))}
                               </div>
                          ) : activeTab === 'Styles' ? (
                               <div className="grid grid-cols-2 gap-6">
                                   {STYLE_AVATARS.map(avatar => (
                                       <button
                                           key={avatar.id}
                                           onClick={() => setSelectedAvatar(avatar.id)}
                                           className={`relative rounded-3xl overflow-hidden border-2 transition-all p-2 bg-white/5 ${selectedAvatar === avatar.id ? 'border-[#1db954] scale-105 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                       >
                                           <img src={avatar.image} className="w-full h-24 object-contain" alt="" />
                                           <div className="text-center text-[10px] font-black uppercase tracking-widest mt-2">{avatar.name}</div>
                                       </button>
                                   ))}
                               </div>
                          ) : activeTab === 'Wallpapers' ? (
                               <div className="grid grid-cols-2 gap-4">
                                   {CHARACTER_WALLPAPERS.map(wp => (
                                       <button
                                           key={wp.id}
                                           onClick={() => setSelectedWallpaper(wp.id)}
                                           className={`relative h-24 rounded-2xl overflow-hidden border-2 transition-all group ${selectedWallpaper === wp.id ? 'border-[#1db954] scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                       >
                                           <img src={wp.image} className="w-full h-full object-cover" alt="" onError={(e) => {
                                               e.target.style.display = 'none';
                                               e.target.nextElementSibling.style.display = 'flex';
                                           }} />
                                           <div className="absolute inset-0 hidden items-center justify-center text-2xl opacity-40">
                                               {wp.emoji}
                                           </div>
                                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                               <span className="text-[10px] font-black uppercase tracking-widest">{wp.emoji} {wp.name}</span>
                                           </div>
                                       </button>
                                   ))}
                               </div>
                          ) : (
                               <div className="grid grid-cols-4 gap-6">
                                    {(AVATAR_CATEGORIES.find(c => c.name === activeTab)?.avatars || []).map(avatar => (
                                       <button
                                           key={avatar.id}
                                           onClick={() => setSelectedAvatar(avatar.id)}
                                           className={`aspect-square rounded-[1.5rem] relative group transition-all duration-500 border-2 overflow-hidden ${selectedAvatar === avatar.id ? 'border-[#1db954] scale-110 shadow-2xl ring-4 ring-[#1db954]/20' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                       >
                                           <img src={avatar.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => {
                                           e.target.style.display = 'none';
                                           e.target.nextElementSibling.style.display = 'flex';
                                       }} />
                                       <div className="absolute inset-0 hidden items-center justify-center text-4xl bg-gradient-to-br from-white/10 to-white/5">
                                           {avatar.emoji}
                                       </div>
                                       {selectedAvatar === avatar.id && (
                                               <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1db954] flex items-center justify-center shadow-2xl ring-2 ring-black">
                                                   <Check size={12} className="text-black" />
                                               </div>
                                           )}
                                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                           <span className="absolute bottom-3 left-0 right-0 text-center text-[10px] font-black text-white uppercase tracking-wider">{avatar.name}</span>
                                       </button>
                                   ))}
                               </div>
                          )}
                     </div>
                </div>
            </div>
        </div>
    );
}
