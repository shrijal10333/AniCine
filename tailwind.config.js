/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0B0E',
        surface: '#121217',
        card: '#181822',
        cardHover: '#20202F',
        border: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(139, 92, 246, 0.3)',
        primary: '#8B5CF6',
        primaryHover: '#7C3AED',
        primaryGlow: 'rgba(139, 92, 246, 0.35)',
        accent: '#EC4899',
        accentViolet: '#A855F7',
        accentCyan: '#06B6D4',
        accentEmerald: '#10B981',
        textMain: '#F8FAFC',
        textMuted: '#94A3B8',
        textDark: '#475569',
        muted: '#1E1E28',
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
