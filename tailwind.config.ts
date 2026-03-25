import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{mdx,md}',
  ],
  theme: {
    extend: {
      colors: {
        novartis: {
          blue: '#0460A9',
          'blue-dark': '#003D6B',
          'blue-light': '#E8F1FA',
          'blue-mid': '#0978D4',
          orange: '#EC6608',
          'orange-light': '#FFF3E8',
          red: '#E03C31',
          yellow: '#F0AB00',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
