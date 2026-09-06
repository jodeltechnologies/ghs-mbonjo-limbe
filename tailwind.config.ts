import type { Config } from 'tailwindcss';

// Colours taken from the school shield: the green ring, the yellow field,
// the red lettering.
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:    '#17201B',
        ink2:   '#4A544C',
        green:  { DEFAULT: '#0B5D33', deep: '#063C21', lit: '#12854A' },
        gold:   '#F2C300',
        brick:  '#B2202B',
        paper:  '#FFFFFF',
        surface:{ DEFAULT: '#F2F1EC', 2: '#E8E7E0' },
        rule:   '#D6D3C8',
      },
      fontFamily: {
        sans:  ['Archivo', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        doc:   ['Tinos', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
