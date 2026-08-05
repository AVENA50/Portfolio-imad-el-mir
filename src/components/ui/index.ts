/**
 * Barrel dei componenti UI.
 *
 * I consumatori scrivono sempre `import { Button } from "@/components/ui"`,
 * mai il percorso del singolo file: se un componente cambia casa si aggiorna
 * solo questa riga.
 *
 * Tabs e Input arrivano in M2-T3.
 */

export { Badge, badgeVariants, type BadgeProps } from "./badge";
export { Button, buttonVariants, type ButtonProps } from "./button";
export {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
  cardVariants,
  type CardProps,
} from "./card";
