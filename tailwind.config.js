/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'goal-not-started': '#6B7280', // gray
        'goal-active': '#10B981', // green
        'goal-out-of-cadence': '#FBBF24', // yellow
        'goal-past-due': '#F97316', // orange
      },
    },
  },
  plugins: [],
}
