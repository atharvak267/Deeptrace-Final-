/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          deep: '#05070A',
          surface: '#0A0E14',
          card: '#111415',
        },
        electric: {
          blue: '#007BFF',
          glow: '#00D4FF',
        },
        verdict: {
          deepfake: '#ef4444', // Red
          suspicious: '#f59e0b', // Amber
          authentic: '#10b981', // Green
        },
        surface: {
          DEFAULT: '#111415',
          dim: '#111415',
          bright: '#373a3b',
        },
        onSurface: {
          DEFAULT: '#e1e3e4',
          muted: '#8b90a0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 15px rgba(0, 123, 255, 0.4)',
        'glow-cyan': '0 0 15px rgba(0, 212, 255, 0.4)',
        'card-subtle': '0 4px 6px rgba(0, 123, 255, 0.15)',
      },
      borderRadius: {
        'soft-sharp': '0.25rem',
      }
    },
  },
  plugins: [],
}
