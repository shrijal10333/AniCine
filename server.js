import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ytSearch from 'yt-search';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-sxrverse-key-1234';

// ── Pure-JS JSON Database ──
const DB_PATH = path.join(__dirname, 'users.json');

let users = [];
if (fs.existsSync(DB_PATH)) {
    try { users = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
    catch (e) { users = []; }
}

const saveUsers = () => {
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
};

const findByEmail = (email) => users.find(u => u.email === email);

const createUser = (name, email, hashedPassword) => {
    const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const user = { id, name, email, password: hashedPassword, avatar: '', slogan: '' };
    users.push(user);
    saveUsers();
    return user;
};

// ── Auth Routes ──
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        if (findByEmail(email)) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = createUser(name, email, hashedPassword);
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user: { id: user.id, name, email, avatar: '', slogan: '' }, token });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = findByEmail(email);
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ user: { id: user.id, name, email: user.email, avatar: user.avatar || '', slogan: user.slogan || '' }, token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/auth/profile', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No token provided' });
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { name, avatar, slogan } = req.body;
        if (name !== undefined) user.name = name;
        if (avatar !== undefined) user.avatar = avatar;
        if (slogan !== undefined) user.slogan = slogan;
        saveUsers();
        res.json({ user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar || '', slogan: user.slogan || '' } });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── Watch Party Rooms ──
const activeRooms = {};

app.post('/api/rooms', (req, res) => {
    const { roomName, host, password, media } = req.body || {};
    const finalHost = (host && host.trim()) || 'Host';
    let roomId;
    do {
        roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (activeRooms[roomId]);

    const title = media?.title || media?.name || 'Party';
    const finalRoomName = roomName?.trim() || `${finalHost}'s ${title}`;

    activeRooms[roomId] = {
        id: roomId,
        roomName: finalRoomName,
        hostName: finalHost,
        password: password || '',
        viewers: 0,
        users: {},
        media: media || null,
        playing: media || null,
        currentTime: 0,
        isPlaying: false,
        lastTimeUpdate: Date.now(),
        createdAt: Date.now()
    };

    const publicRooms = Object.values(activeRooms).map(r => ({
        id: r.id, roomName: r.roomName, host: r.hostName,
        hasPassword: !!r.password, viewers: r.viewers, media: r.media
    }));
    io.emit('rooms_updated', publicRooms);

    // Keep rooms available for at least 30 minutes
    setTimeout(() => {
        if (activeRooms[roomId] && activeRooms[roomId].viewers <= 0) {
            delete activeRooms[roomId];
            const updated = Object.values(activeRooms).map(r => ({
                id: r.id, roomName: r.roomName, host: r.hostName,
                hasPassword: !!r.password, viewers: r.viewers, media: r.media
            }));
            io.emit('rooms_updated', updated);
        }
    }, 30 * 60 * 1000);

    res.json({
        success: true,
        room: {
            id: roomId,
            roomName: activeRooms[roomId].roomName,
            host: finalHost,
            hasPassword: !!password,
            media: activeRooms[roomId].media
        }
    });
});

app.get('/api/rooms', (req, res) => {
    const publicRooms = Object.values(activeRooms).map(r => ({
        id: r.id, roomName: r.roomName, host: r.hostName,
        hasPassword: !!r.password, viewers: r.viewers, media: r.media
    }));
    res.json(publicRooms);
});

app.get('/api/rooms/:roomId', (req, res) => {
    const code = (req.params.roomId || '').toUpperCase();
    const room = activeRooms[code];
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    res.json({
        id: room.id,
        roomName: room.roomName,
        host: room.hostName,
        hasPassword: !!room.password,
        viewers: room.viewers,
        media: room.media,
        playing: room.playing,
        currentTime: room.currentTime,
        isPlaying: room.isPlaying
    });
});

app.post('/api/rooms/verify', (req, res) => {
    const { room, password } = req.body || {};
    const code = (room || '').toUpperCase();
    const targetRoom = activeRooms[code];
    if (!targetRoom) return res.status(404).json({ error: 'Room not found' });
    if (targetRoom.password && targetRoom.password !== password) {
        return res.status(401).json({ error: 'Incorrect password' });
    }
    res.json({
        success: true,
        room: {
            id: targetRoom.id,
            roomName: targetRoom.roomName,
            host: targetRoom.hostName,
            hasPassword: !!targetRoom.password,
            media: targetRoom.media
        }
    });
});

// ── YouTube Search API ──
app.get('/api/youtube', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Query string q is required' });
        const r = await ytSearch(q);
        const videos = (r.videos || []).slice(0, 16);
        res.json(videos);
    } catch (error) {
        console.error('YouTube Search API Error:', error);
        res.status(500).json({ error: 'Failed to search YouTube videos' });
    }
});

// ── Manga Engine Proxy ──
app.get('/api/manga/pages', async (req, res) => {
    try {
        const { id, provider = 'mangadex' } = req.query;
        if (!id) return res.status(400).json({ error: 'Manga ID/URL is required' });

        if (provider === 'mangadex') {
             const chapterRes = await fetch(`https://api.mangadex.org/at-home/server/${id}`);
             const chapterData = await chapterRes.json();
             if (!chapterData.chapter) throw new Error('Chapter not found on MangaDex');
             
             const host = chapterData.baseUrl;
             const hash = chapterData.chapter.hash;
             const filenames = chapterData.chapter.data || chapterData.chapter.dataSaver;
             const type = chapterData.chapter.data ? 'data' : 'data-saver';

             const pages = filenames.map(f => `${host}/${type}/${hash}/${f}`);
             return res.json({ pages });
        }
        
        if (provider === 'fallback') {
             const chapterUrl = id.startsWith('http') ? id : `https://mangakakalot.com/chapter/${id}`;
             const pageRes = await fetch(chapterUrl);
             const html = await pageRes.text();
             
             const imgRegex = /<img src="(https?:\/\/[^"]+)"[^>]+class="img-loading"/g;
             let match;
             const pages = [];
             while ((match = imgRegex.exec(html)) !== null) {
                 pages.push(match[1]);
             }
             
             if (pages.length === 0) {
                 const altRegex = /<img src="(https?:\/\/[^"]+)"[^>]+title="[^"]+" alt="[^"]+"/g;
                 while ((match = altRegex.exec(html)) !== null) {
                     if (match[1].includes('chapter')) pages.push(match[1]);
                 }
             }

             return res.json({ pages });
        }

        res.status(404).json({ error: 'Provider not supported via proxy yet' });
    } catch (error) {
        console.error('Manga Proxy Error:', error);
        res.status(500).json({ error: 'Manga server encountered a neural error' });
    }
});

app.get('/api/manga/search', async (req, res) => {
    try {
        const { title } = req.query;
        if (!title) return res.status(400).json({ error: 'Title is required' });
        
        const url = `https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=1&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&includes[]=cover_art`;
        const mdRes = await fetch(url);
        const data = await mdRes.json();
        res.json(data);
    } catch (error) {
        console.error('Manga Search Proxy Error:', error);
        res.status(500).json({ error: 'Failed to search MangaDex' });
    }
});

app.get('/api/manga/feed', async (req, res) => {
    try {
        const { id, offset = 0 } = req.query;
        if (!id) return res.status(400).json({ error: 'Manga ID is required' });
        
        const url = `https://api.mangadex.org/manga/${id}/feed?translatedLanguage[]=en&limit=500&offset=${offset}&order[chapter]=asc&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&includeExternalVol=0`;
        const mdRes = await fetch(url);
        const data = await mdRes.json();
        res.json(data);
    } catch (error) {
        console.error('Manga Feed Proxy Error:', error);
        res.status(500).json({ error: 'Failed to fetch manga feed' });
    }
});

app.get('/api/manga/fallback', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Query is required' });
        
        const searchUrl = `https://mangakakalot.com/search/story/${q.replace(/\s+/g, '_')}`;
        const searchRes = await fetch(searchUrl);
        const html = await searchRes.text();
        
        const items = [];
        const itemRegex = /<div class="story_item">[\s\S]*?<a href="([^"]+)" title="([^"]+)">[\s\S]*?<img src="([^"]+)"/g;
        let match;
        while ((match = itemRegex.exec(html)) !== null && items.length < 5) {
            items.push({
                url: match[1],
                title: match[2],
                image: match[3],
                id: match[1].split('/').pop()
            });
        }
        
        res.json({ results: items });
    } catch (error) {
        console.error('Fallback Search Error:', error);
        res.status(500).json({ error: 'Fallback engine offline' });
    }
});

// ── HTTP Server & Socket.io ──
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
    socket.on('join_room', (data) => {
        if (!data || !data.room) return;
        const roomId = data.room.toString().toUpperCase();
        socket.join(roomId);
        socket.roomId = roomId;
        socket.username = data.username || `Guest_${socket.id.substring(0, 4)}`;

        if (!activeRooms[roomId]) {
            activeRooms[roomId] = {
                id: roomId,
                roomName: `${socket.username}'s Watch Room`,
                hostName: socket.username,
                password: '',
                viewers: 0,
                users: {},
                media: null,
                playing: null,
                currentTime: 0,
                isPlaying: false,
                lastTimeUpdate: Date.now(),
                createdAt: Date.now()
            };
        }

        const room = activeRooms[roomId];
        room.viewers = Math.max(0, room.viewers) + 1;
        room.users[socket.id] = socket.username;

        const publicRooms = Object.values(activeRooms).map(r => ({
            id: r.id, roomName: r.roomName, host: r.hostName,
            hasPassword: !!r.password, viewers: r.viewers, media: r.media
        }));
        io.emit('rooms_updated', publicRooms);

        if (room.playing) {
            let estimatedTime = room.currentTime || 0;
            if (room.isPlaying && room.lastTimeUpdate) {
                const elapsed = (Date.now() - room.lastTimeUpdate) / 1000;
                estimatedTime += elapsed;
            }
            socket.emit('video_sync', {
                ...room.playing,
                currentTime: Math.floor(estimatedTime),
                isPlaying: room.isPlaying
            });
        }

        const roomUsers = Object.entries(room.users).map(([id, name]) => ({
            id, username: name, isHost: name?.toLowerCase() === room.hostName?.toLowerCase()
        }));
        io.to(roomId).emit('room_users', roomUsers);

        socket.to(roomId).emit('receive_message', {
            author: 'System',
            message: `${socket.username} has joined the Watch Party! 🎉`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('kick_user', (data) => {
        const roomId = data?.room?.toString().toUpperCase();
        const room = activeRooms[roomId];
        if (room && socket.username?.toLowerCase() === room.hostName?.toLowerCase()) {
            io.to(data.userId).emit('kicked');
        }
    });

    socket.on('send_message', (data) => {
        const roomId = data?.room?.toString().toUpperCase();
        if (roomId) socket.to(roomId).emit('receive_message', data);
    });

    socket.on('sync_play', (data) => {
        const roomId = data?.room?.toString().toUpperCase();
        const room = activeRooms[roomId];
        if (room && socket.username?.toLowerCase() === room.hostName?.toLowerCase()) {
            room.currentTime = data.currentTime || 0;
            room.isPlaying = true;
            room.lastTimeUpdate = Date.now();
            socket.to(roomId).emit('receive_sync_play', data);
        }
    });

    socket.on('sync_pause', (data) => {
        const roomId = data?.room?.toString().toUpperCase();
        const room = activeRooms[roomId];
        if (room && socket.username?.toLowerCase() === room.hostName?.toLowerCase()) {
            room.currentTime = data.currentTime || 0;
            room.isPlaying = false;
            room.lastTimeUpdate = Date.now();
            socket.to(roomId).emit('receive_sync_pause', data);
        }
    });

    socket.on('time_update', (data) => {
        const roomId = data?.room?.toString().toUpperCase();
        const room = activeRooms[roomId];
        if (room && socket.username?.toLowerCase() === room.hostName?.toLowerCase()) {
            room.currentTime = data.currentTime || 0;
            room.isPlaying = data.isPlaying !== false;
            room.lastTimeUpdate = Date.now();

            socket.to(roomId).emit('video_sync', {
                type: room.playing?.type,
                id: room.playing?.id,
                currentTime: room.currentTime,
                isPlaying: room.isPlaying
            });
        }
    });

    socket.on('start_video', (data) => {
        const roomId = data?.room?.toString().toUpperCase();
        const room = activeRooms[roomId];
        if (room && socket.username?.toLowerCase() === room.hostName?.toLowerCase()) {
            room.playing = { type: data.type, id: data.id, title: data.title };
            room.currentTime = 0;
            room.isPlaying = true;
            room.lastTimeUpdate = Date.now();
            io.to(roomId).emit('video_sync', { ...data, currentTime: 0, isPlaying: true });
        }
    });

    socket.on('disconnect', () => {
        if (socket.roomId && activeRooms[socket.roomId]) {
            const room = activeRooms[socket.roomId];
            room.viewers = Math.max(0, (room.viewers || 1) - 1);
            delete room.users[socket.id];

            const roomUsers = Object.entries(room.users).map(([id, name]) => ({
                id, username: name, isHost: name?.toLowerCase() === room.hostName?.toLowerCase()
            }));
            io.to(socket.roomId).emit('room_users', roomUsers);

            const publicRooms = Object.values(activeRooms).map(r => ({
                id: r.id, roomName: r.roomName, host: r.hostName,
                hasPassword: !!r.password, viewers: r.viewers, media: r.media
            }));
            io.emit('rooms_updated', publicRooms);
        }
    });
});

// ── Vite Integration / Production Static ──
const distPath = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distPath, 'index.html');

if (process.env.NODE_ENV !== 'production' || !fs.existsSync(indexHtmlPath)) {
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
    });
    app.use(vite.middlewares);
} else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(indexHtmlPath);
    });
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`AniCine fullstack server running on http://localhost:${PORT}`);
});
