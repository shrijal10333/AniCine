import { useEffect, useState } from 'react';
import { fetchManga } from '../api';
import MovieSkeleton from '../components/MovieSkeleton';
import { Search, Zap, TrendingUp, Filter, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Manga() {
    const [mangas, setMangas] = useState([]);
    const [manhwas, setManhwas] = useState([]);
    const [manhuas, setManhuas] = useState([]);
    const [trending, setTrending] = useState([]);
    const [mostViewed, setMostViewed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewTab, setViewTab] = useState('Day');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadMangaFire = async () => {
             setLoading(true);
             try {
                // Sequential fetching with jittered delay to avoid 429
                const trendData = await fetchManga('/top/manga?limit=10&filter=bypopularity');
                setTrending(trendData?.data || []);
                setMostViewed(trendData?.data?.slice(0, 7) || []);

                await new Promise(r => setTimeout(r, 600));
                const mangaData = await fetchManga('/manga?limit=12&type=manga&order_by=popularity&sort=desc');
                setMangas(mangaData?.data || []);

                await new Promise(r => setTimeout(r, 600));
                const manhwaData = await fetchManga('/manga?limit=12&type=manhwa&order_by=popularity&sort=desc');
                setManhwas(manhwaData?.data || []);

                await new Promise(r => setTimeout(r, 600));
                const manhuaData = await fetchManga('/manga?limit=12&type=manhua&order_by=popularity&sort=desc');
                setManhuas(manhuaData?.data || []);
             } catch (err) {
                 console.error("Manga Loading Error:", err);
             }
             setLoading(false);
        };
        loadMangaFire();
    }, []);

    const hero = trending[0];

    return (
        <div className="min-h-screen bg-[#080808] text-white pt-32 pb-40 selection:bg-[#ff4d4d]">
            {/* MangaFire Spotlight Slider */}
            {trending.length > 0 && (
                <section className="max-w-[1920px] mx-auto px-4 md:px-12 lg:px-20 mb-12">
                    <div className="relative h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden group">
                        <div className="absolute inset-0">
                             <img 
                                src={trending[0].images?.jpg?.large_image_url} 
                                alt="" 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                             />
                             <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/60 to-transparent"></div>
                             <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent"></div>
                        </div>

                        <div className="relative z-10 h-full flex flex-col justify-center max-w-3xl pl-8 md:pl-16 space-y-4 md:space-y-6">
                             <div className="flex items-center gap-3">
                                 <span className="px-3 py-1 bg-[#1db954] text-black text-[10px] font-black uppercase rounded-lg">#1 Spotlight</span>
                                 <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{trending[0].type} • {trending[0].status}</span>
                             </div>
                             <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tight text-white line-clamp-2 leading-none">
                                 {trending[0].title}
                             </h1>
                             <p className="text-white/60 text-sm md:text-lg line-clamp-3 max-w-xl font-medium">
                                 {trending[0].synopsis}
                             </p>
                             <div className="flex items-center gap-4 pt-2">
                                  <Link to={`/manga/read/${trending[0].mal_id}`} className="bg-[#1db954] text-black px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-white transition-all active:scale-95 flex items-center gap-2">
                                      <Zap size={16} fill="currentColor" /> Read Now
                                  </Link>
                                  <Link to={`/manga/${trending[0].mal_id}`} className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all flex items-center gap-2">
                                      View Info
                                  </Link>
                             </div>
                        </div>
                        
                        {/* Slider Controls (Visual Only) */}
                        <div className="absolute bottom-10 right-10 flex gap-3 z-20">
                             {[0,1,2,3].map(i => (
                                 <div key={i} className={`w-2.5 h-2.5 rounded-full border-2 border-white/20 ${i === 0 ? 'bg-white border-white' : ''}`}></div>
                             ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Unified Search & Discovery Hub */}
            <section className="max-w-[1920px] mx-auto px-4 md:px-12 lg:px-20 mb-20 relative z-20">
                <div className="bg-[#121212] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl backdrop-blur-3xl">
                    <div className="flex flex-col gap-10">
                        <form 
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!searchQuery.trim()) return;
                                setLoading(true);
                                const res = await fetchManga(`/manga?q=${encodeURIComponent(searchQuery)}&limit=18&order_by=popularity&sort=desc`);
                                setMangas(res?.data || []);
                                setLoading(false);
                            }}
                            className="relative flex-1"
                        >
                             <input 
                                 type="text" 
                                 placeholder="Search for manga, manhwa, authors..." 
                                 className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 px-16 text-sm font-bold tracking-tight outline-none focus:border-[#1db954] transition-all text-white placeholder-white/20"
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                             />
                             <Search size={22} className="absolute left-7 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#1db954] transition-colors" />
                             <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#1db954] text-black px-10 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest hover:scale-105 transition-all shadow-xl">Search</button>
                        </form>
                        
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                            {['Genre', 'Status', 'Type', 'Year', 'Rating', 'Update'].map(f => (
                                <div key={f} className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-2">{f}</span>
                                    <div className="bg-black/20 border border-white/5 rounded-xl py-3.5 px-5 text-[11px] font-bold text-white/40 flex items-center justify-between cursor-pointer hover:border-[#1db954]/30 hover:text-white transition-all">
                                        All <Filter size={10} className="opacity-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <main className="max-w-[1920px] mx-auto px-4 md:px-12 lg:px-20 grid grid-cols-1 xl:grid-cols-12 gap-12">
                 
                 {/* Left Body: Manga/Manhwa/Manhua Sections */}
                 <div className="xl:col-span-9 space-y-16">

                      {/* Hot Updates / Manga Section */}
                      <MangaRow title="Hot Updates" data={mangas} loading={loading} />

                      {/* Manhwa Section */}
                      <MangaRow title="Most Popular Manhwa" data={manhwas} loading={loading} />

                      {/* Manhua Section */}
                      <MangaRow title="Trending Manhua" data={manhuas} loading={loading} />
                 </div>

                 {/* Right Body: Most Viewed Sidebar */}
                 <aside className="xl:col-span-3 space-y-8">
                      <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 md:p-8">
                           <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                     <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                                         <TrendingUp size={20} className="text-[#1db954]" /> Most Viewed
                                     </h2>
                                </div>

                                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl">
                                     {['Day', 'Week', 'Month'].map(tab => (
                                         <button 
                                            key={tab}
                                            onClick={() => setViewTab(tab)}
                                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewTab === tab ? 'bg-[#1db954] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                                         >
                                             {tab}
                                         </button>
                                     ))}
                                </div>

                                <div className="flex flex-col gap-4 mt-2">
                                     {mostViewed.map((item, idx) => (
                                         <Link key={item.mal_id} to={`/manga/${item.mal_id}`} className="flex items-center gap-4 group">
                                             <div className={`text-2xl font-black italic tracking-tighter ${idx === 0 ? 'text-[#1db954]' : idx === 1 ? 'text-white/60' : idx === 2 ? 'text-white/40' : 'text-white/10'}`}>
                                                 {idx + 1}
                                             </div>
                                             <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:border-[#1db954]/50 transition-colors">
                                                 <img src={item.images?.jpg?.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                             </div>
                                             <div className="flex-1 min-w-0">
                                                  <h4 className="text-[11px] font-bold uppercase tracking-tight truncate text-white group-hover:text-[#1db954] transition-colors mb-0.5">{item.title}</h4>
                                                  <div className="flex items-center gap-2">
                                                       <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{item.type}</span>
                                                       <div className="w-1 h-1 rounded-full bg-white/10"></div>
                                                       <div className="flex items-center gap-1">
                                                            <Star size={8} className="text-[#1db954] fill-[#1db954]" />
                                                            <span className="text-[9px] font-black text-[#1db954]/80">{item.score || 'N/A'}</span>
                                                       </div>
                                                  </div>
                                             </div>
                                         </Link>
                                     ))}
                                </div>
                                
                                <button className="w-full py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:bg-white/10 hover:text-white transition-all mt-4">
                                     View More Results
                                </button>
                           </div>
                      </div>

                      {/* Genre Sidebar */}
                      <div className="bg-[#121212] border border-white/5 rounded-3xl p-8">
                           <h3 className="text-sm font-black uppercase tracking-widest text-white/20 mb-6 pb-4 border-b border-white/5">Genres</h3>
                           <div className="flex flex-wrap gap-2">
                                {['Action', 'Adventure', 'Fantasy', 'Romance', 'Drama', 'School', 'Sci-Fi', 'Mystery', 'Horror', 'Isekai'].map(g => (
                                    <Link key={g} to={`/search?q=${g}`} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-white/40 hover:bg-[#1db954] hover:text-black hover:border-transparent transition-all">
                                        {g}
                                    </Link>
                                ))}
                           </div>
                      </div>
                 </aside>
            </main>
        </div>
    );
}

function MangaRow({ title, data, loading }) {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3 italic">
                    <span className="w-2 h-8 bg-[#1db954] rounded-full mr-1"></span> {title}
                </h2>
                <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-[#1db954] transition-colors flex items-center gap-2 group">
                    View All <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {loading 
                    ? Array.from({length: 6}).map((_, i) => (
                        <div key={i} className="space-y-4 animate-pulse">
                            <div className="aspect-[4/5] bg-white/5 rounded-2xl"></div>
                            <div className="h-4 bg-white/5 rounded w-3/4"></div>
                        </div>
                    ))
                    : data.map((item, idx) => (
                        <Link 
                            key={item.mal_id} 
                            to={`/manga/${item.mal_id}`} 
                            className="group transition-all duration-500"
                        >
                            <div className="relative aspect-[11/16] rounded-2xl overflow-hidden border border-white/5 mb-4 group-hover:border-[#1db954]/50 transition-all duration-500 shadow-2xl">
                                 <img src={item.images?.jpg?.large_image_url} alt="" className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" />
                                 <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform">
                                      <div className="flex items-center gap-2">
                                           <span className="px-1.5 py-0.5 bg-white text-black text-[8px] font-black rounded">CH {item.chapters || '??'}</span>
                                           <span className="text-white/40 text-[8px] font-black uppercase tracking-widest truncate">{item.type}</span>
                                      </div>
                                 </div>
                                 <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black text-[#1db954] uppercase tracking-widest border border-white/5">
                                      {item.status === 'Publishing' ? 'LIVE' : 'END'}
                                 </div>
                            </div>
                            <h3 className="text-[13px] font-bold tracking-tight text-white line-clamp-1 group-hover:text-[#1db954] transition-colors">{item.title}</h3>
                            <div className="text-[10px] text-white/30 font-medium uppercase tracking-widest mt-1">VOL {item.volumes || '01'} • {item.type}</div>
                        </Link>
                    ))
                }
            </div>
        </div>
    );
}
