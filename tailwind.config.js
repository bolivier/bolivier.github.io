module.exports = {
  content: ["public/*.html"],

  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#d81e5b",
          secondary: "#eb5e55",
          neutral: "#374151",
          "base-100": "#fdf0d5",
        },
      },
    ],
  },

  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}
