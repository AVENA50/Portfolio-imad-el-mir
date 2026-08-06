# Deploy su Vercel

Procedura per mettere online il portfolio, prima in privato e poi in
pubblico. Il passaggio fra i due stati è un interruttore solo.

---

## 1. Collegare il repository

Su [vercel.com](https://vercel.com), **Add New → Project**, e importa
`Portfolio-imad-el-mir` da GitHub.

Vercel riconosce Next.js da solo: non toccare comando di build, cartella di
output e directory di installazione.

**Root Directory** resta `./`. Sul computer il percorso è
`Portfolio Imad El mir\portfolio\`, ma il repository git parte proprio da
lì: `package.json`, `next.config.ts` e `src` stanno alla radice, non in una
sottocartella. Nel selettore di Vercel si riconosce dalla **Ⓝ** di Next.js
accanto alla riga `(root)` — è quella l'indicazione che conta.

---

## 2. Le variabili d'ambiente

`.env.local` è in `.gitignore` — giustamente — quindi Vercel non le vede.
Vanno riscritte a mano in **Settings → Environment Variables**.

| Nome                 | Valore                   | Ambiente            |
| -------------------- | ------------------------ | ------------------- |
| `RESEND_API_KEY`     | la chiave di Resend      | Production, Preview |
| `CONTACT_EMAIL_FROM` | `onboarding@resend.dev`  | Production, Preview |
| `CONTACT_EMAIL_TO`   | `imadelmir900@gmail.com` | Production, Preview |

Non aggiungere `NEXT_PUBLIC_SITE_URL`. Quella variabile è l'interruttore
che rende il sito visibile ai motori di ricerca: finché resta assente,
`robots.txt` risponde `Disallow: /`. Va scritta solo al passo 5.

> **L'errore più comune del primo deploy.** Tutto compila, il sito si vede,
> e il form risponde "errore del server" senza spiegazioni. Nove volte su
> dieci è una di queste tre variabili dimenticata. Il motivo esatto è nei
> log di Vercel, sotto **Deployments → Runtime Logs**, dove la rotta scrive
> `[contact]` seguito dalla causa.

---

## 3. Rendere il sito privato

Questo è il punto che merita attenzione, perché su piano gratuito la
protezione con login **copre le anteprime, non la produzione**. Proteggere
il dominio di produzione richiede il piano Pro.

La soluzione non costa niente ed è più semplice: **non creare affatto una
produzione**.

In **Settings → Git → Production Branch**, scrivi `release` — un branch che
non esiste ancora. Da quel momento ogni push su `main` genera
un'**anteprima**, e le anteprime sono protette dal login Vercel: le vedi
solo tu, entrando col tuo account.

Poi in **Settings → Deployment Protection** verifica che _Vercel
Authentication_ sia attiva su _Standard Protection_.

Il risultato: un indirizzo vero su cui provare tutto, che nessun altro può
aprire.

---

## 4. Verificare che funzioni davvero

Sull'indirizzo dell'anteprima, nell'ordine:

1. **Le sette pagine si aprono**, in entrambe le lingue.
2. **Il cambio lingua resta sulla stessa pagina** — da `/it/projects` deve
   portare a `/en/projects`, non alla home.
3. **Il form manda l'email.** È la prova che le variabili sono a posto.
4. **`/robots.txt` dice `Disallow: /`.** Se dicesse `Allow`, il sito
   sarebbe indicizzabile prima del previsto.
5. **`/sitemap.xml` elenca le pagine** con gli indirizzi di Vercel, non
   `localhost`.
6. **Le anteprime social.** Incolla il link del sito in una chat con te
   stesso su WhatsApp: deve comparire l'immagine col tuo nome, non un
   rettangolo grigio. Attenzione: finché l'anteprima è protetta dal login,
   i crawler non entrano — questa prova va rifatta dopo il passo 5.
7. **`/it/design-system` risponde 404.** In produzione deve sparire.

---

## 5. Rendere il sito pubblico

Quando i progetti sono pronti e vuoi condividere il link, tre cose:

1. Crea il branch di produzione:

   ```
   git checkout main
   git pull
   git checkout -b release
   git push -u origin release
   ```

2. Aggiungi `NEXT_PUBLIC_SITE_URL` fra le variabili, **solo per
   Production**, con l'indirizzo completo e senza slash finale:

   ```
   https://portfolio-imad-el-mir.vercel.app
   ```

3. Rilancia il deploy da **Deployments → ⋯ → Redeploy**, così la nuova
   variabile viene letta.

Da quel momento `robots.txt` cambia da solo, la sitemap punta all'indirizzo
giusto e i link canonici pure. Nessun codice da modificare.

---

## 6. Se un giorno compri un dominio

Aggiungilo in **Settings → Domains**, segui le istruzioni DNS del
registrar, e cambia `NEXT_PUBLIC_SITE_URL` con il nuovo indirizzo. Basta
quello: tutto il sito legge quella variabile.

Per mandare email dal tuo dominio invece che da `onboarding@resend.dev`,
verificalo anche su Resend (tre record DNS) e aggiorna
`CONTACT_EMAIL_FROM`. Non è obbligatorio: il form funziona lo stesso.

---

## Come si aggiorna il sito, da qui in avanti

```
git checkout -b feat/qualcosa
# modifiche
npm run check
git commit -m "..."
git push -u origin feat/qualcosa
```

Vercel crea un'anteprima per quel branch, con un suo indirizzo, e la
commenta nella pull request. La guardi, e se va bene unisci in `main`: il
sito online si aggiorna da solo in un paio di minuti.

Non c'è niente da fermare, cancellare o rilanciare a mano. L'unico caso in
cui si torna qui è per cambiare una variabile d'ambiente: quelle vengono
lette al momento della build, quindi dopo averle modificate serve un
**Deployments → ⋯ → Redeploy**.

Se un deploy fallisce, il sito online resta quello di prima. Vercel
sostituisce la versione pubblica solo quando la build è andata a buon fine.

---

## Il piano gratuito non può generare una bolletta

Il piano Hobby non ha addebiti a consumo: senza un metodo di pagamento
registrato non esiste il meccanismo per superare la soglia pagando. Al
raggiungimento dei limiti mensili — 100 GB di traffico, un milione di
richieste, 100 minuti di build — il progetto viene **sospeso** fino al
ciclo successivo. È l'opposto del modello AWS, dove il conto cresce e basta.

Per dare un ordine di grandezza: 100 GB corrispondono a decine di migliaia
di visite. Un portfolio personale ne fa qualche centinaio al mese.

L'unico modo per iniziare a pagare è scegliere di passare al piano Pro.
