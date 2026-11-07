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
      },
    },
  },
  plugins: [],
};
