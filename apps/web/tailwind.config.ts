import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Sans"', 'Inter', 'Impact', 'system-ui', 'sans-serif'],
        display: ['Inter', '"Geist Sans"', 'system-ui', 'sans-serif']
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          foreground: 'hsl(var(--brand-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        highlight: {
          DEFAULT: 'hsl(var(--highlight))',
          foreground: 'hsl(var(--highlight-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))'
      },
      borderRadius: {
        xl: '1.5rem',
        '2xl': '1.75rem',
        large: '1.75rem'
      },
      boxShadow: {
        glow: '0 25px 80px -35px rgba(4, 120, 87, 0.55)',
        ember: '0 30px 90px -40px rgba(190, 18, 60, 0.45)'
      },
      backgroundImage: {
        'ghana-gradient':
          'radial-gradient(circle at top left, rgba(220,38,38,0.35), transparent 55%), radial-gradient(circle at top right, rgba(234,179,8,0.25), transparent 60%), radial-gradient(circle at bottom left, rgba(5,150,105,0.32), transparent 65%)'
      }
    }
  }
};

export default config;