const plugin = require("tailwindcss/plugin");
const { default: lightOrDarkColor } = require("@check-light-or-dark/color");

const buttonPlugin = plugin(function ({ addComponents, matchUtilities, theme }) {
  let components = {};

  components[".btn"] = {
    display: "inline-block",
    cursor: "pointer",
    fontWeight: "bold",
    padding: `${theme("spacing.2")} ${theme("spacing.4")}`,
    borderRadius: theme("borderRadius.lg"),
    transition: "background-color 0.3s, color 0.3s",
    textAlign: "center",
  };

  for (let key in theme("colors")) {
    if (typeof theme("colors")[key] !== "string") {
      for (let shade in theme("colors")[key]) {
        const bgColor = theme("colors")[key][shade];
        const textColor = lightOrDarkColor(bgColor) === "dark" ? "white" : "black";

        components[`.btn-${key}-${shade}`] = {
          ...components[".btn"],
          backgroundColor: bgColor,
          color: textColor,
        };
      }
    } else {

      const textColor = lightOrDarkColor(theme("colors")[key]) === "dark" ? "white" : "black";

      components[`.btn-${key}`] = {
        ...components[".btn"],
        backgroundColor: theme("colors")[key],
        color: textColor,
      };
    }
  }

  addComponents(components);

  matchUtilities({
    btn: (value) => {
      return {
        ...components[".btn"],
        backgroundColor: value,
        color: lightOrDarkColor(value) === "dark" ? "white" : "black",
      };
    },
  });
});

module.exports = buttonPlugin;
