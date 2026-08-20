# AniCine

A modern, full-featured streaming, anime, manga, music, and synchronized watch party web platform.

## ✨ Features
- **Movies & TV Shows**: Stream the latest cinema releases, trending series, and 4K ultra-HD content.
- **Anime & Manga Engine**: High-speed manga reader with chapter navigation and multi-source fallbacks.
- **Saavn Music & Playlists**: Integrated music player with background streaming, curated playlists, and lyrics.
- **Watch Party**: Real-time synchronized watch rooms with live chat, host controls, and multi-viewer sync via Socket.io.
- **Personalized Experience**: Watchlist, watch history, liked tracks, user profile customization, and secure auth.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shrijal10333/AniCine.git
   ```

2. Navigate into the project directory:
   ```bash
   cd AniCine
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the fullstack development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

## 🌐 Deploy to Render (Free & 1-Click Ready)

AniCine includes full production support with `render.yaml`.

### Option A: Via Render Blueprints (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect your **AniCine** repository (`https://github.com/shrijal10333/AniCine`).
4. Click **Apply**. Render will automatically detect `render.yaml` and configure everything!

### Option B: Manual Web Service Setup
1. On [Render](https://dashboard.render.com), click **New +** -> **Web Service**.
2. Select your `AniCine` GitHub repository.
3. Configure the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables (optional, defaults provided):
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (Any secure random string)
5. Click **Deploy Web Service**!

## 🛠 Tech Stack
- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Express, Socket.io, JWT, bcryptjs, yt-search
- **Real-Time**: WebSockets for multi-user watch parties and room playback sync
- **Audio & Media**: Saavn Music API, MangaDex API, embed stream players

