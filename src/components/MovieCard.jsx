import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api';
import { Play, Star } from 'lucide-react';

export default function MovieCard({ item, type }) {
    if (!item) return null;
    const t = type || item.media_type || 'movie';
    const title = item.title || item.name || 'Untitled';
    const date = (item.release_date || item.first_air_date || '').slice(0, 4);
    const poster = getImageUrl(item.poster_path || item.backdrop_path, 'w500');
    const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
    const isAnime = t === 'anime' || item.original_language === 'ja' || item.genre_ids?.includes(16);

    return (
        <Link 
            to={`/watch/${t === 'anime' ? 'tv' : t}/${item.id}`} 
            className="group block relative w-full aspect-[2/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 hover:scale-[1.03] hover:border-primary/50 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] bg-[#121217]"
        >
            <img
                src={poster}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ease-out opacity-90 group-hover:opacity-100"
                alt={title}
                loading="lazy"
            />
            
            {/* Top Badges */}
            <div className="absolute top-2.5 inset-x-2.5 md:top-3 md:inset-x-3 flex items-center justify-between z-20 pointer-events-none">
                {rating ? (
                    <div className="bg-black/70 backdrop-blur-md text-yellow-400 border border-white/10 px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-black flex items-center gap-1 shadow-md">
                        <Star size={10} className="fill-current" /> {rating}
                    </div>
                ) : <div />}

                {date && (
                    <div className="bg-primary/90 text-white px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-black shadow-md uppercase">
                        {date}
                    </div>
                )}
            </div>

            {/* Hover Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4 z-10">
                <div className="flex items-center gap-2 mb-1.5 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                        {isAnime ? 'Anime' : t}
                    </span>
                    <span className="text-[8px] md:text-[9px] font-bold text-white/60 uppercase">
                        {isAnime ? 'JP • EN' : (item.original_language || 'EN').toUpperCase()}
                    </span>
                </div>

                <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-tight leading-tight line-clamp-2 translate-y-2 group-hover:translate-y-0 transition-transform">
                    {title}
                </h3>

                <div className="mt-2.5 flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-wider translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Play size={10} className="fill-current" /> Watch Now
                </div>
            </div>

            {/* Bottom Gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </Link>
    );
}
