import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef } from "react";

import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/cn";
import type { IconName } from "@/types";

/**
 * Stili del Button.
 *
 * Le classi base contengono tutto cio che non cambia mai: layout, focus ring,
 * stato disabilitato. Le varianti contengono solo le differenze. Cosi non c'e
 * un solo attributo duplicato fra le tre varianti.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2.5 rounded-pill",
    "font-semibold whitespace-nowrap",
    "transition-[background-color,box-shadow,color,border-color] duration-200 ease-out-soft",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500",
    "disabled:pointer-events-none disabled:opacity-50",
    // Le icone non si deformano mai, qualunque sia il testo accanto
    "[&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-button-gradient text-primary-fg shadow-glow hover:shadow-glow-strong",
        secondary: "glass glass-hover text-ink",
        ghost: "text-ink-muted hover:bg-surface-hover hover:text-ink",
        danger: "bg-danger text-primary-fg hover:brightness-110",
      },
      size: {
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        md: "h-11 px-6 text-base [&_svg]:size-[18px]",
        lg: "h-14 px-8 text-base [&_svg]:size-5",
      },
      /** Bottone quadrato per la sola icona: usa `size` per il lato. */
      iconOnly: {
        true: "aspect-square px-0",
        false: "",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      iconOnly: false,
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends ComponentPropsWithRef<"button">, VariantProps<typeof buttonVariants> {
  /**
   * Rende il figlio invece di un <button>, passandogli gli stili.
   * Serve per i link: un CTA che naviga deve essere una <a>, non un bottone
   * con un onClick — altrimenti perde apertura in nuova scheda, tasto destro
   * e annuncio corretto agli screen reader.
   *
   * @example
   * <Button asChild><Link href="/projects">Vedi i progetti</Link></Button>
   */
  asChild?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  /** Disabilita e mostra lo spinner. */
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  iconOnly,
  fullWidth,
  asChild = false,
  iconLeft,
  iconRight,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={cn(
        buttonVariants({ variant, size, iconOnly, fullWidth }),
        className,
      )}
      disabled={disabled ?? loading}
      // Lo stato di caricamento va annunciato, non solo mostrato
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-pill border-2 border-current border-t-transparent"
        />
      ) : (
        iconLeft && <Icon name={iconLeft} />
      )}

      {/*
        Slottable marca il vero figlio quando asChild e attivo: senza,
        Slot vede tre figli (icona, contenuto, icona) e non sa su quale
        innestarsi. Con Slottable le icone finiscono dentro l'elemento
        del figlio, accanto al suo contenuto.
      */}
      <Slottable>{children}</Slottable>

      {iconRight && !loading && <Icon name={iconRight} />}
    </Component>
  );
}

export { buttonVariants };
