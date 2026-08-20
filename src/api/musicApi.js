// Saavn / Music API Client

export const FEATURED_PLAYLISTS = [
  { id: '1134542526', title: 'Top Hits Global', description: 'Biggest hits worldwide' },
  { id: '1077874987', title: 'Trending Vibes', description: 'Hot and viral tracks' },
  { id: '1081546875', title: 'Chill & Relax', description: 'Smooth acoustic and lo-fi' },
  { id: '1081546876', title: 'Electronic Energy', description: 'High tempo dance and EDM' }
];

const SAAVN_BASE = 'https://saavn.dev/api';

// Fallback sample songs in case Saavn external API is unreachable
const FALLBACK_SONGS = [
  {
    id: 'sample-1',
    name: 'Starboy (Remix)',
    primaryArtists: 'The Weeknd, Daft Punk',
    image: [{ quality: '500x500', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60' }],
    downloadUrl: [{ quality: '320kbps', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }],
    duration: 372
  },
  {
    id: 'sample-2',
    name: 'Midnight Drive',
    primaryArtists: 'Neon Dreams',
    image: [{ quality: '500x500', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60' }],
    downloadUrl: [{ quality: '320kbps', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }],
    duration: 423
  },
  {
    id: 'sample-3',
    name: 'Cosmic Echoes',
    primaryArtists: 'Luna Wave',
    image: [{ quality: '500x500', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60' }],
    downloadUrl: [{ quality: '320kbps', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }],
    duration: 345
  },
  {
    id: 'sample-4',
    name: 'Golden Hour Horizons',
    primaryArtists: 'Aura Sound',
    image: [{ quality: '500x500', url: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=60' }],
    downloadUrl: [{ quality: '320kbps', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }],
    duration: 310
  }
];

export const getBestImage = (image) => {
  if (!image) return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60';
  if (typeof image === 'string') return image;
  if (Array.isArray(image) && image.length > 0) {
    const highest = image[image.length - 1];
    return highest?.url || highest?.link || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60';
  }
  return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60';
};

export const getBestAudio = (downloadUrl) => {
  if (!downloadUrl) return '';
  if (typeof downloadUrl === 'string') return downloadUrl;
  if (Array.isArray(downloadUrl) && downloadUrl.length > 0) {
    const highest = downloadUrl[downloadUrl.length - 1];
    return highest?.url || highest?.link || '';
  }
  return '';
};

export const getPlaylistById = async (id) => {
  try {
    const res = await fetch(`${SAAVN_BASE}/playlists?id=${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Playlist fetch failed');
    const json = await res.json();
    const data = json.data || json;
    return {
      id: data.id || id,
      title: data.name || data.title || 'Playlist',
      name: data.name || data.title || 'Playlist',
      songs: (data.songs || []).map(normalizeSong)
    };
  } catch (err) {
    console.warn('Using fallback for playlist', id, err);
    return {
      id,
      title: FEATURED_PLAYLISTS.find(p => p.id === id)?.title || 'Curated Playlist',
      name: FEATURED_PLAYLISTS.find(p => p.id === id)?.title || 'Curated Playlist',
      songs: FALLBACK_SONGS
    };
  }
};

export const searchSongs = async (query) => {
  try {
    const res = await fetch(`${SAAVN_BASE}/search/songs?query=${encodeURIComponent(query)}&limit=20`);
    if (!res.ok) throw new Error('Search failed');
    const json = await res.json();
    const data = json.data || json;
    const results = (data.results || []).map(normalizeSong);
    return { results };
  } catch (err) {
    console.warn('Using fallback search for', query, err);
    const filtered = FALLBACK_SONGS.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.primaryArtists.toLowerCase().includes(query.toLowerCase())
    );
    return { results: filtered.length > 0 ? filtered : FALLBACK_SONGS };
  }
};

export const getLyrics = async (id) => {
  try {
    const res = await fetch(`${SAAVN_BASE}/lyrics?id=${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data || json;
    return data.lyrics || null;
  } catch {
    return null;
  }
};

function normalizeSong(s) {
  return {
    id: s.id,
    name: s.name || s.title || 'Unknown Track',
    title: s.name || s.title || 'Unknown Track',
    primaryArtists: s.primaryArtists || s.singers || s.artist || 'Unknown Artist',
    image: s.image,
    downloadUrl: s.downloadUrl,
    duration: s.duration
  };
}
