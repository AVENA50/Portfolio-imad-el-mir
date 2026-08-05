/**
 * Barrel dei componenti UI.
 *
 * I consumatori scrivono sempre `import { Button } from "@/components/ui"`,
 * mai il percorso del singolo file: se un componente cambia casa si aggiorna
 * solo questa riga.
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
export {
  Field,
  Input,
  Textarea,
  fieldVariants,
  type InputProps,
  type TextareaProps,
} from "./input";
export { TabPanel, Tabs, type TabItem } from "./tabs";
