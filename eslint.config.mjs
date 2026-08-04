import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * Configurazione ESLint.
 *
 * `eslint-config-prettier` va per ultimo: spegne tutte le regole di stile
 * che si sovrapporrebbero a Prettier. Senza, ESLint e Prettier litigano
 * sullo stesso file e ogni salvataggio riscrive quello di prima.
 */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // Le variabili inutilizzate sono un errore, ma il prefisso _ le esenta:
      // serve per i parametri che devi dichiarare e non usi.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // I tipi si importano con `import type`: con isolatedModules attivo
      // evita che finiscano nel bundle.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // `any` passa solo se dichiarato a voce alta.
      "@typescript-eslint/no-explicit-any": "warn",

      // Nel codice finale restano solo warn ed error.
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // <img> costa un layout shift e nessuna ottimizzazione: si usa
      // next/image, tranne dove serve davvero e lo si disabilita a mano.
      "@next/next/no-img-element": "error",
    },
  },

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },

  prettier,
];

export default eslintConfig;
