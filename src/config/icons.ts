/**
 * Nomi delle icone del sito.
 *
 * Perche una tupla a runtime e non solo un tipo: il frontmatter dei case
 * study dichiara un'icona per ogni feature e per ogni lezione appresa, e il
 * frontmatter e un dato esterno letto a runtime. Con un semplice
 * `z.string()` un refuso come "layres" passerebbe la validazione e
 * diventerebbe una pagina rotta in produzione. Con `z.enum(ICON_NAMES)` la
 * build si ferma indicando file e campo.
 *
 * Sta in config/ e non in types/ per la stessa ragione di TECH_SLUGS e
 * CATEGORY_SLUGS: e un registro, non un tipo. Il tipo `IconName` ne deriva
 * (types/ui.ts), e il registro dei glifi in components/shared/icon.tsx e
 * tipizzato `Record<IconName, ...>` — quindi aggiungere un nome qui senza
 * mapparlo li non compila.
 */
export const ICON_NAMES = [
  // --- navigazione e azioni
  "arrow-right",
  "arrow-left",
  "arrow-up-right",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "close",
  "menu",
  "download",
  "external",
  "search",
  "zoom-in",
  "check",

  // --- marchi e contatti
  "github",
  "linkedin",
  "mail",

  // --- interfaccia
  "file",
  "home",
  "grid",
  "list",
  "sun",
  "moon",
  "image",

  // --- case study: architettura e sistemi
  "layers",
  "server",
  "database",
  "network",
  "container",
  "boxes",
  "workflow",
  "route",
  "git-branch",
  "terminal",
  "code",
  "cpu",

  // --- case study: qualita e prestazioni
  "zap",
  "gauge",
  "shield",
  "lock",
  "key",
  "bug",
  "timer",
  "activity",
  "refresh",
  "scale",
  "accessibility",

  // --- case study: prodotto e risultati
  "users",
  "target",
  "lightbulb",
  "sparkles",
  "rocket",
  "puzzle",
  "wrench",
  "chart",
  "trending-up",
  "trophy",
  "clock",
  "globe",
  "brain",
  "bot",
  "gamepad",
] as const;
