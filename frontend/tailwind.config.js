/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Organic & Relaxed Theme (Playground V2)
        organic: {
          sand: '#E6DDC4',
          aqua: '#678983',
          wood: '#F0E9D2',
          ink: '#181D31',
        },
        // Legacy colors (kept for compatibility)
        primary: {
          DEFAULT: '#678983', // Shifted to aqua
          light: '#A0BCC2',
          dark: '#4C6A65',
        },
        accent: {
          DEFAULT: '#E6DDC4', // Shifted to sand
          highlight: '#F0E9D2',
          dim: 'rgba(230, 221, 196, 0.2)',
        },
        action: {
          DEFAULT: '#678983',
          hover: '#181D31',
          glow: 'rgba(103, 137, 131, 0.4)',
        },
        // 境界色
        rank: {
          gold: '#FFD700',   // 金榜
          silver: '#C0C0C0', // 银榜
          bronze: '#CD7F32', // 铜榜
        },
        // 背景色系 - 自然木色/沙色
        dark: {
          DEFAULT: '#F0E9D2',
          paper: '#FFFFFF',
          hover: '#E6DDC4',
          border: '#D1CBAE',
          overlay: 'rgba(24, 29, 49, 0.5)', /* overlay with ink color */
        },
        // 文字色系 - 深墨色
        text: {
          primary: '#181D31',
          secondary: 'rgba(24, 29, 49, 0.7)',
          muted: 'rgba(24, 29, 49, 0.5)',
          gold: '#678983', /* aqua */
        },
      },
      fontFamily: {
        display: ['"Ma Shan Zheng"', 'cursive'], // 自然薄笔书法风
        body: ['"Nunito"', 'sans-serif'], // 可读性高的圆润无衬线
        mono: ['"JetBrains Mono"', 'monospace'],
        calligraphy: ['"Ma Shan Zheng"', 'cursive'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #B7950B 100%)',
        'subtle-glow': 'radial-gradient(circle at center, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
        'grid-white': 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-white': '40px 40px',
      },
      boxShadow: {
        'elevation-1': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        'elevation-2': '0 10px 15px -3px rgba(0, 0, 0, 0.7)',
        'glow-gold': '0 0 15px rgba(212, 175, 55, 0.2)',
      },
      borderRadius: {
        'none': '0',
        'sm': '8px',  // 变成更圆润的风格
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        'full': '9999px',
        'blob': '40% 60% 70% 30% / 40% 50% 60% 50%',
        'blob2': '60% 40% 30% 70% / 60% 30% 70% 40%',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'spotlight': 'spotlight 2s ease .75s 1 forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'meteor-effect': 'meteor 5s linear infinite',
        'beam': 'beam 7s infinite',
        'grid': 'grid 15s linear infinite',
        'aurora': 'aurora 60s linear infinite',
        'scroll': 'scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite',
        'blob-bounce': 'blobBounce 10s infinite alternate ease-in-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        spotlight: {
          '0%': {
            opacity: '0',
            transform: 'translate(-72%, -62%) scale(0.5)',
          },
          '100%': {
            opacity: '1',
            transform: 'translate(-50%,-40%) scale(1)',
          },
        },
        shimmer: {
          from: {
            backgroundPosition: '0 0',
          },
          to: {
            backgroundPosition: '-200% 0',
          },
        },
        meteor: {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': {
            transform: 'rotate(215deg) translateX(-500px)',
            opacity: '0',
          },
        },
        beam: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        grid: {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
        aurora: {
          from: {
            backgroundPosition: '50% 50%, 50% 50%',
          },
          to: {
            backgroundPosition: '350% 50%, 350% 50%',
          },
        },
        scroll: {
          to: {
            transform: 'translate(calc(-50% - 0.5rem))',
          },
        },
        blobBounce: {
          '0%': { borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', transform: 'translateY(0) rotate(0deg)' },
          '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', transform: 'translateY(-20px) rotate(10deg)' },
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
