/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#fffdf7",
        paperLine: "#e9eefc",
        ink: "#171717",
        mutedInk: "#595959",
        blueInk: "#2f67e8",
        blueSoft: "#edf4ff",
        sticky: "#fff2a8",
        stickyDark: "#efd77d",
        borderSoft: "#d9dee9",
        success: "#2f9b62",
        warning: "#c2831b",
        danger: "#db5548"
      },
      boxShadow: {
        sketch: "2px 3px 0 rgba(23,23,23,0.06)",
        sticky: "0 10px 24px rgba(137,115,42,0.18)"
      },
      fontFamily: {
        handwritten: ['"Comic Sans MS"', '"Segoe Print"', "cursive"],
        sans: ['"Inter"', '"Segoe UI"', "Arial", "sans-serif"]
      }
    }
  },
  plugins: [],
};
