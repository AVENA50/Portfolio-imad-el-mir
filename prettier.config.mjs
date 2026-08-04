/**
 * Configurazione Prettier.
 *
 * Il plugin di Tailwind riordina le classi nell'ordine canonico del
 * framework. Non e estetica: con un ordine stabile due sviluppatori — o
 * lo stesso in due momenti diversi — non producono diff diversi per lo
 * stesso identico markup.
 *
 * In Tailwind v4 il plugin ha bisogno del foglio di stile per conoscere
 * i token del progetto: senza `tailwindStylesheet` non riconosce le classi
 * generate da @theme (bg-surface, rounded-card, text-h1...).
 *
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 80,
  tabWidth: 2,
  arrowParens: "always",
  endOfLine: "lf",

  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/styles/globals.css",
  tailwindFunctions: ["cn", "clsx", "cva"],
};

export default config;
