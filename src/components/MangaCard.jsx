import { Link } from 'react-router-dom';
import { BookOpen, Star } from 'lucide-react';

export default function MangaCard({ item }) {
    return (
        <Link
            to={`/manga/${item.mal_id}`}
            className="group relative bg-card rounded-[28px] overflow-hidden border border-white/5 transition-all duration-700 hover:border-primary/40 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] flex flex-col h-full"
        >
            {/* Poster Aspect Ratio 2:3 */}
            <div className="aspect-[2/3.2] relative overflow-hidden">
                <img
                    src={item.images?.jpg?.large_image_url || item.images?.jpg?.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-[1500ms] group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>

                {/* Tactical Badges */}
                <div className="absolute top-4 left-4 z-10">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xl transition-all group-hover:border-primary/40">
                        <Star size={10} className="text-primary fill-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">{item.score || '8.5'}</span>
                    </div>
                </div>

                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="bg-primary text-background p-2 rounded-xl shadow-xl shadow-primary/20">
                        <BookOpen size={14} />
                    </div>
                </div>

                {/* Type Label */}
                <div className="absolute bottom-4 left-4 z-10">
                    <span className="text-[7.5px] font-black text-white/40 uppercase tracking-[0.3em] font-mono group-hover:text-primary transition-colors">
                        SCTR // {item.type || 'Manga'}
                    </span>
                </div>
            </div>

            {/* Content info */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-xs md:text-sm font-black text-white group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight leading-tight mb-2">
                        {item.title}
                    </h3>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[8px] md:text-[9px] font-black text-textMuted uppercase tracking-widest truncate">
                            {item.status}
                        </span>
                    </div>
                    <span className="text-[8px] font-black text-white/10 uppercase tracking-widest group-hover:text-accent/30 transition-colors">#{item.mal_id.toString().slice(-4)}</span>
                </div>
            </div>

            {/* Premium Scan Line (Decorative) */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left shadow-[0_0_15px_rgba(251,191,36,0.3)]"></div>
        </Link>
    );
}
