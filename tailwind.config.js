/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#030303',
        foreground: '#ffffff',
        card: '#0a0a0a',
        'card-foreground': '#ffffff',
        popover: '#0a0a0a',
        'popover-foreground': '#ffffff',
        primary: '#3b82f6',
        'primary-foreground': '#ffffff',
        secondary: '#1f2937',
        'secondary-foreground': '#ffffff',
        muted: '#374151',
        'muted-foreground': '#9ca3af',
        accent: '#1f2937',
        'accent-foreground': '#ffffff',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
        border: '#1f1f1f',
        input: '#1f1f1f',
        ring: '#3b82f6',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}