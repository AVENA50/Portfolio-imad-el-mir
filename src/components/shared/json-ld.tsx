interface JsonLdProps {
  /** Uno o piu oggetti schema.org gia composti da `lib/json-ld.ts`. */
  data: Record<string, unknown> | readonly Record<string, unknown>[];
}

/**
 * Inserisce i dati strutturati nella pagina (M10-T4).
 *
 * **Perche `dangerouslySetInnerHTML` qui e corretto.** React sfugge il
 * contenuto testuale, quindi scrivendo `{JSON.stringify(data)}` dentro un
 * `<script>` le virgolette diventerebbero `&quot;` e il JSON risulterebbe
 * illeggibile ai crawler. Serve inserirlo grezzo, e questa e l'unica via.
 *
 * **Da dove viene il rischio, e perche qui non c'e.** Il pericolo sarebbe
 * un valore contenente `</script>`, che chiuderebbe il tag in anticipo e
 * permetterebbe di iniettare codice. Ma i dati arrivano da `SITE`, dai
 * file MDX e dai dizionari — tutta roba scritta da noi e letta a build
 * time, non da un visitatore. In piu `JSON.stringify` non puo produrre un
 * `<` non sfuggito dentro una stringa a meno che non ci sia gia nella
 * fonte, e la sostituzione qui sotto neutralizza anche quel caso.
 *
 * Resta un Server Component: e markup, non costa un byte al browser.
 */
export function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data) ? data : [data];

  return (
    <>
      {payload.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // La cintura oltre alle bretelle: se un titolo contenesse mai
            // `</script>`, questo lo rende inerte senza rompere il JSON.
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
