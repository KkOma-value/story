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
        // 黑金书阁主题 (Black-Gold Library)
        primary: {
          DEFAULT: '#D4AF37', // 香槟金 (主品牌)
          light: '#F4D03F',
          dark: '#B7950B',
        },
        accent: {
          DEFAULT: '#D4AF37', // 金 (高亮)
          highlight: '#F1C40F',
          dim: 'rgba(212, 175, 55, 0.1)',
        },
        action: {
          DEFAULT: '#C0392B', // 丹砂红 (行动/热点)
          hover: '#E74C3C',
          glow: 'rgba(192, 57, 43, 0.4)',
        },
        // 境界色
        rank: {
          gold: '#FFD700',   // 金榜
          silver: '#C0C0C0', // 银榜
          bronze: '#CD7F32', // 铜榜
        },
        // 背景色系 - 极简黑
        dark: {
          DEFAULT: '#0A0A0A', // 纯黑/深碳
          paper: '#141414',   // 卡片背景
          hover: '#1F1F1F',   // 悬停反馈
          border: '#262626',  // 分割线
          overlay: 'rgba(0, 0, 0, 0.85)',
        },
        // 文字色系
        text: {
          primary: '#EBEBEB', // 主文本 (高对比)
          secondary: '#A3A3A3', // 次级文本
          muted: '#525252',   // 弱化文本
          gold: '#D4AF37',
        },
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'serif'], // 标题 - 改用宋体，更显质感
        body: ['"Inter"', '"Noto Sans SC"', 'sans-serif'], // 正文 - 易读黑体
        mono: ['"JetBrains Mono"', 'monospace'],
        // 书法字体仅用于 Logo 或极其特殊的印章
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
        'sm': '1px',  // 极简硬朗风格
        'md': '2px',
        'lg': '4px',
        'xl': '8px',
        'full': '9999px',
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
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
