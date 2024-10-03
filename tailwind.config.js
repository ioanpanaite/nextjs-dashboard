/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      poppins: "var(--font-poppins)",
    },
    colors: {
      transparent: 'transparent',
      white: '#FFF',
      lightGray: "#151719",
      gray: {
        lightest: '#474955',
        light: '#7C7C7C',
        regular: '#1E1F25',
        dark: '#282A2B'
      },
      green: '#A1FBA2',
      orange: '#F7931A',
      blue: '#6C9FCE',
      black: '#131517'
    },
    extend: {
      fontSize: {
        '2xl+': ['1.75rem', '2.125rem'],
        '3xl+': ['2rem', '2.375rem']
      },
      spacing: {
        4.5: "1.125rem",
        13: "3.25rem",
        18: "4.5rem"
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
