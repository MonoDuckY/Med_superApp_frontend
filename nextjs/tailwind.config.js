/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0EA5E9',
        success: '#10B981',
        warning: '#F59E0B',
        critical: '#EF4444',
        neutral: {
          900: '#0F172A',
          500: '#64748B',
        },
        surface: '#F8FAFC',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '8pt': '8px',
      },
      borderRadius: {
        'hms': '8px',
        'hms-lg': '16px',
      },
    },
  },
  plugins: [],
};
