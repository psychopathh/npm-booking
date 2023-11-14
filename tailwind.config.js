module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blueCustom: "#1F88D4",
        grayCustom: "#F1F1F1",
      },
      boxShadow: {
        buttonHeader:
          " 0px 2px 24px 0px rgba(0, 0, 0, 0.2), 0px 0px 2px 0px rgba(0, 0, 0, 0.09);",
        tooltip: " 0px 1px 4px 0px #00000040",
      },
    },
  },
  plugins: [],
};
