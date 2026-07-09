/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  // 小程序不需要 preflight (它依赖 html/body 等标签，小程序里无效且会报错)
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: '#0085FF',
        promo: '#FF5000',
        success: '#00B578',
      },
    },
  },
  plugins: [],
};
