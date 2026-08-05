import { cva, type VariantProps } from "class-variance-authority";
import {
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/cn";

/**
 * Stili condivisi da Input e Textarea.
 *
 * `invalid` non e solo rosso: cambia bordo e anello di focus insieme, cosi
 * l'errore resta percepibile anche a chi non distingue i colori. Il colore
 * non e mai l'unico portatore dell'informazione — c'e sempre anche il testo
 * dell'errore, legato al campo con aria-describedby.
 */
const fieldVariants = cva(
  [
    "w-full rounded-input border bg-surface px-4 text-base text-ink",
    "placeholder:text-ink-subtle",
    "transition-[border-color,box-shadow] duration-200 ease-out-soft",
    "focus:outline-none focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      invalid: {
        false:
          "border-border hover:border-border-strong focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30",
        true: "border-danger focus:border-danger focus:ring-2 focus:ring-danger/30",
      },
    },
    defaultVariants: { invalid: false },
  },
);

/* ------------------------------------------------------------------ Field --
   Wrapper che tiene insieme label, campo, suggerimento ed errore.
   Genera gli id e li collega con aria-describedby: senza, lo screen reader
   legge il campo e si ferma, e l'errore resta invisibile a chi non vede.
   ------------------------------------------------------------------------ */

interface FieldProps {
  label: string;
  /** Testo di aiuto sotto il campo. */
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
  }) => React.ReactNode;
  className?: string;
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-danger">
            *
          </span>
        )}
      </label>

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-subtle">
          {hint}
        </p>
      )}

      {error && (
        // role="alert" fa annunciare l'errore appena compare, senza che
        // l'utente debba tornare sul campo per scoprirlo
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Input -- */

export interface InputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof fieldVariants> {}

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      className={cn(fieldVariants({ invalid }), "h-12", className)}
      {...props}
    />
  );
}

/* --------------------------------------------------------------- Textarea -- */

export interface TextareaProps
  extends
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof fieldVariants> {}

export function Textarea({
  className,
  invalid,
  rows = 5,
  ...props
}: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(fieldVariants({ invalid }), "resize-y py-3", className)}
      {...props}
    />
  );
}

export { fieldVariants };
