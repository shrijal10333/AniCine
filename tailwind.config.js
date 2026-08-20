/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0b0b',
        primary: '#1db954',
        accent: '#ff4d4d',
        secondaryAccent: '#2d5da1',
        text: '#ffffff',
        textMuted: '#a7a7a7',
        border: '#ffffff15',
        card: '#181818',
        muted: '#282828',
        // Playful Geometric Scope Colors
        playful: {
          bg: '#FFFDF5',
          fg: '#1E293B',
          muted: '#F1F5F9',
          mutedFg: '#64748B',
          accent: '#8B5CF6',
          accentFg: '#FFFFFF',
          secondary: '#F472B6',
          tertiary: '#FBBF24',
          quaternary: '#34D399',
          border: '#E2E8F0',
          input: '#FFFFFF',
          card: '#FFFFFF',
          ring: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'pop-sm': '2px 2px 0px #1E293B',
        'pop-md': '4px 4px 0px #1E293B',
        'pop-lg': '6px 6px 0px #1E293B',
      },
      borderRadius: {
        'large': '24px',
        'medium': '16px',
        'small': '8px',
      }
    },
  },
  plugins: [],
}
