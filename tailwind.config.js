/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cryptx: {
          bg: '#080B12',
          surface: '#101622',
          card: '#141D2B',
          cardHover: '#182436',
          border: '#1E293B',
          borderLight: '#2B3B52',
          cyan: '#00D4FF',
          blue: '#3B82F6',
          textMain: '#F8FAFC',
          textMuted: '#94A3B8',
          textSub: '#64748B',
          emerald: '#10B981',
          amber: '#F59E0B',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'subtle-cyan': '0 0 20px -5px rgba(0, 212, 255, 0.15)',
        'subtle-blue': '0 0 25px -5px rgba(59, 130, 246, 0.18)',
        'card-border': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        'neon-cyan': '0 0 25px 2px rgba(0, 212, 255, 0.35)',
        'neon-emerald': '0 0 25px 2px rgba(16, 185, 129, 0.35)',
        'neon-indigo': '0 0 25px 2px rgba(99, 102, 241, 0.35)',
      },
      animation: {
        'laser-scan': 'laserScan 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-delayed': 'float 4s ease-in-out 2s infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'stream-flow': 'streamFlow 2s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        laserScan: {
          '0%, 100%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '0.8' },
          '90%': { opacity: '0.8' },
          '50%': { transform: 'translateY(260%)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 15px 0px rgba(0, 212, 255, 0.2), inset 0 0 12px 0px rgba(0, 212, 255, 0.1)',
            borderColor: 'rgba(0, 212, 255, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 35px 5px rgba(0, 212, 255, 0.45), inset 0 0 20px 2px rgba(0, 212, 255, 0.25)',
            borderColor: 'rgba(0, 212, 255, 0.8)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        streamFlow: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};
