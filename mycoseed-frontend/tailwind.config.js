/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10b981',
          foreground: '#ffffff'
        },
        accent: {
          DEFAULT: '#14b8a6',
          foreground: '#ffffff'
        },
        background: '#0a0b0d',
        foreground: '#ffffff',
        card: {
          DEFAULT: '#18181b',
          foreground: '#ffffff'
        },
        border: '#27272a',
        muted: {
          DEFAULT: '#3f3f46',
          foreground: '#a1a1aa'
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff'
        },
        success: {
          DEFAULT: '#10b981',
          foreground: '#ffffff'
        },
        warning: {
          DEFAULT: '#f59e0b',
          foreground: '#ffffff'
        },
        info: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff'
        },
        'mario-red': '#ff3844',
        'mario-green': '#00cc00',
        'mario-yellow': '#ffcc00',
        'mario-blue': '#3562ff',
        'mario-sky': '#6b8cff',
        'mario-ground': '#945e28',
        'mario-brick': '#c85050',
        'mario-brown': '#945e28',
        'mario-coin': '#ffcc00'
      },
      fontFamily: {
        pixel: ['Press Start 2P', 'cursive'],
        vt323: ['VT323', 'monospace']
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px #000000',
        'pixel-sm': '2px 2px 0px 0px #000000',
        'pixel-lg': '6px 6px 0px 0px #000000'
      }
    }
  },
  plugins: []
}
