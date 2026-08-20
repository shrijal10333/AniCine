import { Link } from 'react-router-dom';
import { getImageUrl } from '../api';
import { Play } from 'lucide-react';

export default function MovieCard({ item, type }) {
    const t = type || item.media_type || 'movie';
    const title = item.title || item.name;
    const date = (item.release_date || item.first_air_date || '').slice(0, 4);
    const poster = getImageUrl(item.poster_path, 'w500');

    return (
        <Link 
            to={`/watch/${t}/${item.id}`} 
            className="group block relative w-full aspect-[2/3] rounded-xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/5 transition-all duration-700 hover:scale-[1.03] hover:border-primary/40 bg-zinc-900"
        >
            <img
                src={poster}
                className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110 ease-out opacity-90 group-hover:opacity-100"
                alt={title}
                loading="lazy"
            />
            
            {/* Year Badge */}
            {date && (
                <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
                    <div className="bg-primary text-black px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black shadow-2xl transform transition-transform group-hover:scale-110">
                        {date}
                    </div>
                </div>
            )}

            {/* Hover Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-6">
                    <div className="flex items-center gap-2 mb-1 md:mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                         <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary rounded-full"></div>
                         <span className="text-[7px] md:text-[9px] font-black text-white/60 uppercase tracking-widest">{t}</span>
                    </div>
                    <h3 className="text-[11px] md:text-base font-black text-white uppercase tracking-tight leading-tight translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 line-clamp-2">
                        {title}
                    </h3>
                </div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 md:h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
        </Link>
    );
}
