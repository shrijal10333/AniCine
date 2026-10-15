# AniCine — Premium Anime & Entertainment Streaming Platform

AniCine is a production-oriented cinematic entertainment discovery and streaming platform built with React, Node.js/Express, Tailwind CSS, and HLS.js.

## 🚀 Key Features

### 1. Verified Audio & Subtitle Language Engine
- **Strict Distinction**: Explicitly separates Original Audio, Dubbed Audio tracks, and Subtitle tracks.
- **Zero Fake Dubs**: Never claims a Hindi Dub or other audio dub exists merely because subtitles exist or original language is known.
- **Provider Manifest Auditing**: Verifies actual stream tracks against media manifests before declaring playback availability.
- **Audio-Preserving Fallback**: If a server experiences issues, the player automatically switches to an alternate verified provider that maintains the user's selected language.

### 2. Smart Server Selector
- Provides authenticated provider streams:
  - **Alpha Core (Official HLS)**: Low-latency HLS stream with dual audio tracks.
  - **Kitsune Anime Stream**: High-bitrate original audio source.
  - **Titan Multilingual**: Multi-language HLS stream with multi-audio master playlist.
  - **Official Partner Embed**: Certified embed player.
- Live health checks, latency ping in milliseconds, and territory status.
- Bounded retries and graceful error recovery for expired playback tokens.

### 3. Production HLS.js Streaming Player
- Custom responsive video player powered by `hls.js`.
- Real audio-track switching (`hls.audioTracks` and `hls.audioTrack`).
- Subtitle track switching.
- Keyboard navigation (Space/K for play/pause, M for mute, F for fullscreen, J/L for seeking, Arrow keys for volume).
- Progress tracking with automatic Continue Watching persistence.

### 4. Admin Dashboard (`/admin`)
- Role-Based Access Control (RBAC): server-side verification of administrator credentials.
- Metric analytics: total users, active providers, verified availability count, stream error stats.
- Provider manager: priority ranking, endpoint configuration, enable/disable toggles.
- Audio & Dub Inspector: live overview of audio and subtitle availability per content.
- User Management: promote or demote user roles.
- System Audit Logs: immutable history of admin modifications.

### 5. Automated 10-Scenario Test Suite
An integrated QA verification runner accessible directly via `/admin` and `/api/tests/run`:
1. **TEST 1**: Anime title with Japanese & English audio does **not** display Hindi Dub.
2. **TEST 2**: Hindi subtitles are not mistaken for Hindi audio.
3. **TEST 3**: Provider claiming Hindi audio with no Hindi stream track is rejected.
4. **TEST 4**: Provider fallback preserves the user's requested audio language.
5. **TEST 5**: Honest unavailable state displayed when no provider supports requested language.
6. **TEST 6**: Expired playback URL produces recoverable error with bounded retry.
7. **TEST 7**: Unauthorized users rejected from modifying provider settings (HTTP 403).
8. **TEST 8**: Watchlist and playback progress persistence across sessions.
9. **TEST 9**: Search and filtering by verified audio tracks.
10. **TEST 10**: Player accessibility, touch controls, and 8+ keyboard shortcuts.

---

## 🔐 Credentials & Default Admin

- **Default Administrator**:
  - Email: `admin@anicine.tv`
  - Password: `admin123`
- Regular users can register freely via `/auth`.

---

## ⚙️ Environment Variables

Create `.env` using `.env.example`:

```bash
PORT=3000
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BEARER_TOKEN=
DATABASE_URL=
AUTH_SECRET=your_auth_secret_here
JWT_SECRET=super-secret-sxrverse-key-1234
CORS_ORIGIN=*
```

> **Note**: The backend proxy securely manages TMDB queries server-side with in-memory caching (TTL 5 minutes). TMDB credentials are never exposed to browser clients.

---

## 📜 Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
All movie and television metadata and poster artwork are provided via TMDB API interfaces.
