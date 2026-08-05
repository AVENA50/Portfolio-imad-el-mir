/**
 * Barrel dei componenti UI.
 *
 * I consumatori scrivono sempre `import { Button } from "@/components/ui"`,
 * mai il percorso del singolo file: se un componente cambia casa si aggiorna
 * solo questa riga.
 *
 * Badge, Card, Tabs e Input arrivano in M2-T2 e M2-T3.
 */

export { Button, buttonVariants, type ButtonProps } from "./button";
