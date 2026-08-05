import type { ReactNode } from "react";

import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/cn";
import type { IconName } from "@/types";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  /** Bottone di uscita: "Azzera i filtri", "Torna ai progetti". */
  action?: ReactNode;
  className?: string;
}

/**
 * Stato vuoto.
 *
 * Serve dove una lista puo risultare vuota: filtri senza risultati nella
 * pagina Progetti (M6-T5), ricerca senza corrispondenze.
 *
 * La regola che rende utile uno stato vuoto e che deve **offrire una via
 * d'uscita**, non limitarsi a dire che non c'e niente. Per questo `action`
 * e previsto: senza, l'utente resta davanti a una pagina vuota e torna
 * indietro col tasto del browser.
 */
export function EmptyState({
  icon = "search",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "glass-flat flex flex-col items-center rounded-card px-6 py-16 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className="mb-5 flex size-14 items-center justify-center rounded-panel bg-surface-strong text-ink-subtle"
      >
        <Icon name={icon} className="size-6" />
      </span>

      <p className="font-display text-lg font-bold text-ink">{title}</p>

      {description && (
        <p className="mt-2 max-w-sm text-sm text-ink-muted">{description}</p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
