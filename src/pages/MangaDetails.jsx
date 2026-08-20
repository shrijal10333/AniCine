import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchManga } from '../api';
import { BookOpen, Star, List, ArrowLeft, Heart, Share2, Zap, History, Globe, Hexagon, Triangle, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { getBackendUrl } from '../utils/backend';

export default function MangaDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chapters, setChapters] = useState([]);
    const [fetchingChapters, setFetchingChapters] = useState(false);
    const [activeTab, setActiveTab] = useState('Ringkasan');

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        fetchManga(`/manga/${id}/full`).then(async (data) => {
            if (data && data.data) {
                setDetail(data.data);
                setFetchingChapters(true);
                try {
                    // Clean title for better search (removing common MAL suffixes)
                    const cleanTitle = (str) => str.replace(/\((Manga|TV|Light Novel|Movie|Manhwa|Manhua)\)/gi, '').trim();
                    
                    const mainTitle = cleanTitle(data.data.title_english || data.data.title);
                    const japTitle = cleanTitle(data.data.title_japanese || data.data.title);
                    const altTitles = data.data.titles?.map(t => cleanTitle(t.title)) || [];
                    
                    let mdId = null;
                    const searchQueries = [...new Set([mainTitle, japTitle, ...altTitles])].filter(t => t && t.length > 1).slice(0, 6);

                    const backendUrl = getBackendUrl();
                    for (let t of searchQueries) {
                        try {
                            const searchRes = await fetch(`${backendUrl}/api/manga/search?title=${encodeURIComponent(t)}`);
                            const searchData = await searchRes.json();
                            if (searchData.data?.length > 0) {
                                mdId = searchData.data[0].id;
                                break;
                            }
                        } catch (err) { continue; }
                    }

                    if (mdId) {
                        const fetchAllChapters = async (offset = 0, accrued = []) => {
                            const feedRes = await fetch(`${backendUrl}/api/manga/feed?id=${mdId}&offset=${offset}`);
                            const feedData = await feedRes.json();
                            if (!feedData.data) return accrued;
                            const newAccrued = [...accrued, ...feedData.data];
                            if (feedData.total > offset + 500) return fetchAllChapters(offset + 500, newAccrued);
                            return newAccrued;
                        };
                        const feedData = await fetchAllChapters();
                        if (feedData) {
                            const unique = feedData
                                .filter(ch => ch.attributes && ch.attributes.chapter)
                                .sort((a,b) => parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter))
                                .filter((v, i, a) => a.findIndex(t => t.attributes.chapter === v.attributes.chapter) === i);
                            setChapters(unique);
                        }
                    }
                } catch (e) {
                    console.error("Dex Hub Error:", e);
                }
                setFetchingChapters(false);
            }
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div className="h-screen bg-[#080808] flex items-center justify-center animate-pulse text-white font-black uppercase tracking-widest text-xs">Loading Details...</div>;

    return (
        <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden relative selection:bg-[#ff4d4d] selection:text-white pb-40">
            {/* Image 2 Inspired Immersive Banner */}
            <section className="relative h-[85vh] w-full flex items-end">
                <div className="absolute inset-0 z-0">
                        <img 
                            src={detail?.images?.jpg?.large_image_url || ''} 
                            className="w-full h-full object-cover opacity-30 blur-2xl scale-110" 
                            alt="" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/80"></div>
                    </div>

                    {/* Floating Character/Metadata Labels (Image 2 Style) */}
                    <div className="absolute top-[30%] left-[10%] px-4 py-2 border border-white/20 rounded-full bg-white/5 backdrop-blur-3xl animate-bounce-slow">
                         <span className="text-[10px] font-black uppercase tracking-widest text-[#ff4d4d]">Status: {detail?.status || 'Active'}</span>
                    </div>
                    <div className="absolute top-[45%] right-[15%] px-4 py-2 border border-white/20 rounded-full bg-white/5 backdrop-blur-3xl animate-pulse">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/40">MASTER_TYPE: {detail?.type || 'Archive'}</span>
                    </div>

                    <div className="relative z-10 max-w-[1920px] mx-auto px-8 md:px-16 pb-20 w-full animate-entrance">
                        <div className="flex flex-col gap-6 max-w-4xl">
                            <div className="flex items-center gap-4 mb-4">
                                 <div className="w-1.5 h-6 bg-[#ff4d4d] rounded-full"></div>
                                 <h2 className="text-xl font-black uppercase tracking-tighter text-[#ff4d4d]">Broadcast Overview</h2>
                            </div>
                            <h1 className="text-5xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] italic mb-8">
                                {detail?.title || 'Unknown Archive'}
                            </h1>

                            <div className="flex flex-wrap items-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-12">
                                 <div className="flex items-center gap-4">
                                     <ThumbsUp size={16} className="text-[#ff4d4d]" />
                                     <ThumbsDown size={14} className="opacity-20" />
                                     <span className="text-white">96% Global Link</span>
                                 </div>
                                 <div className="h-4 w-[1px] bg-white/10"></div>
                                 <span>Ranked #{detail?.rank || '---'}</span>
                                 <div className="h-4 w-[1px] bg-white/10"></div>
                                 <span className="text-[#1db954]">{detail?.type || 'Node'} archive</span>
                            </div>

                        {/* Image 2 Tab Layout */}
                        <div className="flex flex-wrap gap-4 mb-16">
                            {['Summary', 'Reviews', 'Extras'].map(t => (
                                <button key={t} onClick={() => setActiveTab(t)} className={`px-10 py-5 rounded-full font-black uppercase tracking-widest text-[11px] transition-all duration-300 border ${activeTab === t ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Node Matrix */}
            <div className="relative z-10 max-w-[1920px] mx-auto px-8 md:px-16 grid grid-cols-1 xl:grid-cols-12 gap-24">
                <div className="xl:col-span-8 flex flex-col gap-24">
                     {/* Image 2 Synopsis Section */}
                     <section className="bg-white/3 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-12 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff4d4d]/5 blur-[120px] rounded-full"></div>
                           <p className="text-lg md:text-2xl font-medium leading-[1.8] text-white/60 italic tracking-tight">
                                {detail.synopsis}
                           </p>
                     </section>

                     {/* Content Hub Matrix (Chapters) */}
                     <section>
                          <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-8">
                              <h2 className="text-3xl font-black uppercase tracking-tighter italic">Chapter Selection</h2>
                              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">TOTAL: {chapters.length}</span>
                          </div>

                          {fetchingChapters ? (
                             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                 {Array.from({ length: 12 }).map((_, i) => (
                                     <div key={i} className="h-20 bg-white/5 rounded-3xl animate-pulse border border-white/5"></div>
                                 ))}
                             </div>
                          ) : chapters.length > 0 ? (
                             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[600px] overflow-y-auto pr-6 custom-scrollbar">
                                 {chapters.map(ch => (
                                     <Link
                                         key={ch.id}
                                         to={`/manga/read/${id}`}
                                         className="group relative p-6 bg-white/5 border border-white/5 rounded-[2.5rem] hover:border-[#ff4d4d]/40 transition-all duration-500 overflow-hidden text-center"
                                     >
                                         <div className="absolute inset-x-0 bottom-0 h-1 bg-[#ff4d4d] scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                                         <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Node Index</span>
                                         <p className="text-[14px] font-black text-white uppercase tracking-tight group-hover:text-[#ff4d4d] transition-colors">CH. {ch.attributes.chapter}</p>
                                     </Link>
                                 ))}
                             </div>
                          ) : (
                             <div className="p-20 text-center bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                                  <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.5em]">No Native Chapters Found</p>
                                  <div className="flex flex-col items-center gap-4">
                                       <p className="text-white/40 text-xs font-medium max-w-sm">MangaDex may not host chapters for this title due to licensing. Try searching manually or check external sources.</p>
                                       <button 
                                            onClick={() => {
                                                const manual = prompt("Enter precise Manga Title for MangaDex search:");
                                                if (manual) window.location.search = `?search=${encodeURIComponent(manual)}`;
                                            }}
                                            className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                                       >
                                           Try Manual Search
                                       </button>
                                  </div>
                             </div>
                          )}
                     </section>

                     {/* Image 2 Moral Story / Deep Archive Section */}
                     <section className="mt-20 border-t border-white/5 pt-24 pb-20">
                           <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic mb-10 leading-none">Manga <br /> Details</h2>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                                <div>
                                     <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl italic">
                                          "Every archive contains a soul. In this transmission, the data reflects the enduring spirit of the creator's vision across the neural net."
                                     </p>
                                </div>
                                <div className="space-y-12">
                                     <div>
                                          <span className="text-[10px] font-black uppercase text-[#ff4d4d] tracking-[0.5em] block mb-4">Original Architects</span>
                                          {detail.authors?.map(author => (
                                              <p key={author.mal_id} className="text-3xl font-black uppercase tracking-tight italic mb-2">{author.name}</p>
                                          ))}
                                     </div>
                                     <div>
                                          <span className="text-[10px] font-black uppercase text-[#ff4d4d] tracking-[0.5em] block mb-4">Neural Classification</span>
                                          <div className="flex flex-wrap gap-4">
                                              {detail.genres?.map(genre => (
                                                  <span key={genre.mal_id} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.3em]">{genre.name}</span>
                                              ))}
                                          </div>
                                     </div>
                                </div>
                           </div>
                     </section>
                </div>

                {/* Right Rail: Tactical Stats (Image 1/4 Style) */}
                <aside className="xl:col-span-4 sticky top-40 space-y-10">
                      <div className="bg-[#121212] border border-white/10 rounded-[3rem] p-10 shadow-2xl">
                           <div className="w-1.5 h-6 bg-[#ff4d4d] mb-10"></div>
                           <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30 mb-12">Manga Information</h3>
                           <div className="space-y-10">
                                <StatNode label="Consensus Rating" value={`${detail.score} / 10`} icon={<Star size={14} className="text-[#1db954]" />} />
                                <StatNode label="Transmission Status" value={detail.status} icon={<Zap size={14} className="text-[#ff4d4d]" />} />
                                <StatNode label="Network Popularity" value={`Ranked #${detail.popularity}`} icon={<TrendingNode size={14} />} />
                                <StatNode label="Publication Node" value={detail.type} icon={<Globe size={14} />} />
                           </div>
                           
                           <div className="mt-16 flex flex-col gap-4">
                                <Link to={`/manga/read/${id}`} className="w-full py-6 bg-[#ff4d4d] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl text-center hover:scale-[1.02] transition-transform active:scale-95">
                                    Start Transcription
                                </Link>
                                <button className="w-full py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-colors">
                                    Add to Archive Hub
                                </button>
                           </div>
                      </div>

                      {/* Tactical label overlay */}
                      <div className="h-60 border border-white/5 rounded-[40px] flex items-center justify-center bg-black/40 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#ff4d4d]/10 to-transparent"></div>
                          <span className="vertical-label opacity-30 text-[#ff4d4d] tracking-[1.2rem]">{detail.title}</span>
                      </div>
                </aside>
            </div>
            
            {/* Japan Archive Sidebar ID */}
            <div className="fixed left-6 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col items-center gap-10 opacity-20 group hover:opacity-100 transition-opacity">
                 <div className="w-[1px] h-32 bg-white/40"></div>
                 <div className="vertical-label group-hover:text-[#ff4d4d] transition-colors tracking-[1em]">MANGA_{detail.mal_id}</div>
                 <div className="w-[1px] h-32 bg-white/40"></div>
            </div>
        </div>
    );
}

function StatNode({ label, value, icon }) {
    return (
        <div className="flex items-center gap-6 group">
             <div className="p-4 bg-white/5 border border-white/10 rounded-2xl group-hover:border-[#ff4d4d]/40 transition-all">
                  {icon}
             </div>
             <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-1">{label}</span>
                  <p className="text-lg font-black uppercase tracking-tight italic group-hover:text-white transition-colors">{value}</p>
             </div>
        </div>
    );
}

function TrendingNode({ size }) {
    return (
        <div className="text-white/40 flex items-center justify-center">
             <Star size={size} />
        </div>
    );
}
