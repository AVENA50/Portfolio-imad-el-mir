"use client";

import { useState } from "react";

import { TabPanel, Tabs } from "@/components/ui";
import { Timeline, type TimelineEntry } from "@/components/timeline/timeline";
import type { Locale } from "@/config/i18n";
import type { Dictionary } from "@/lib/dictionary";

interface ExperienceTabsProps {
  education: readonly TimelineEntry[];
  work: readonly TimelineEntry[];
  certificates: readonly TimelineEntry[];
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Le tre timeline del percorso, in schede (M9-T6).
 *
 * Perche le schede e non tre sezioni impilate: formazione, lavoro e
 * certificati non si leggono in sequenza, si consultano. Un selezionatore
 * cerca una cosa sola — di solito la formazione — e impilarle lo
 * costringerebbe a scorrere oltre due elenchi che non gli servono.
 *
 * L'unico pezzo client della pagina, e contiene solo `useState`: i dati
 * arrivano gia pronti dal server.
 *
 * TabPanel smonta il contenuto non attivo invece di nasconderlo con CSS.
 * E la scelta giusta: uno screen reader non legge cio che e `hidden`, e
 * lasciarlo nel DOM significherebbe far annunciare tre timeline quando ne
 * e visibile una.
 */
export function ExperienceTabs({
  education,
  work,
  certificates,
  locale,
  dictionary,
}: ExperienceTabsProps) {
  const [tab, setTab] = useState("education");

  const items = [
    {
      value: "education",
      label: dictionary.experience.tabEducation,
      count: education.length,
    },
    {
      value: "work",
      label: dictionary.experience.tabWork,
      count: work.length,
    },
    {
      value: "certificates",
      label: dictionary.experience.tabCertificates,
      count: certificates.length,
    },
  ];

  return (
    <>
      <Tabs
        items={items}
        value={tab}
        onValueChange={setTab}
        idPrefix="experience"
        ariaLabel={dictionary.experience.tabsLabel}
      />

      <div className="mt-12">
        <TabPanel value="education" activeValue={tab} idPrefix="experience">
          <Timeline
            entries={education}
            locale={locale}
            ariaLabel={dictionary.experience.tabEducation}
          />
        </TabPanel>

        <TabPanel value="work" activeValue={tab} idPrefix="experience">
          <Timeline
            entries={work}
            locale={locale}
            ariaLabel={dictionary.experience.tabWork}
          />
        </TabPanel>

        <TabPanel value="certificates" activeValue={tab} idPrefix="experience">
          <Timeline
            entries={certificates}
            locale={locale}
            ariaLabel={dictionary.experience.tabCertificates}
          />
        </TabPanel>
      </div>
    </>
  );
}
