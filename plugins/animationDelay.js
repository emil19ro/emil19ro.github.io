const plugin = require("tailwindcss/plugin");

const animationDelay = plugin(function ({ matchUtilities, theme }) {
  matchUtilities({
    "animation-delay": (value) => {
      return {
        animationDelay: value
      };
    }
  },
    {
      values: theme("animationDelay"),
    }
  );
},
  {
    theme: {
      animationDelay: {
        100: "100ms",
        200: "200ms",
        300: "300ms",
        400: "400ms",
        500: "500ms",
        600: "600ms",
        700: "700ms",
        800: "800ms",
        900: "900ms",
        1000: "1000ms",
        1100: "1100ms",
        1200: "1200ms",
        1300: "1300ms",
        1400: "1400ms",
        1500: "1500ms",
        1600: "1600ms",
        1700: "1700ms",
        1800: "1800ms",
        1900: "1900ms",
        2000: "2000ms",
        2100: "2100ms",
        2200: "2200ms",
        2300: "2300ms",
        2400: "2400ms",
        2500: "2500ms",
        2600: "2600ms",
        2700: "2700ms",
        2800: "2800ms",
        2900: "2900ms",
        3000: "3000ms",
      }
    }
  });

  module.exports = animationDelay;