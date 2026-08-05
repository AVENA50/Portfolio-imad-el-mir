import "server-only";

import Image from "next/image";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { ComponentProps, ReactElement } from "react";

/**
 * Compilazione dell'MDX dei case study.
 *
 * Gira su server, a build time: il compilatore MDX non finisce mai nel
 * bundle del browser. Il risultato e un albero React gia pronto.
 *
 * Due plugin, entrambi con una ragione pratica:
 *
 * - **remark-gfm** abilita tabelle, liste di spunte e barrato. Servono:
 *   una tabella di confronto fra due scelte tecniche e il modo piu chiaro
 *   di raccontare una decisione.
 * - **rehype-slug** mette un `id` su ogni titolo. Da li nascono gli indici
 *   dei case study e i link diretti a una sezione.
 */

/** Immagini: sempre via next/image, mai <img> grezzo. */
function MdxImage({ src, alt }: ComponentProps<"img">) {
  if (typeof src !== "string") return null;

  return (
    <Image
      src={src}
      alt={alt ?? ""}
      width={1200}
      height={700}
      sizes="(max-width: 768px) 100vw, 800px"
      className="my-8 rounded-card border border-border"
    />
  );
}

/**
 * Link: interni con next/link per navigare senza ricaricare,
 * esterni con il rel di sicurezza.
 */
function MdxLink({ href, children, ...props }: ComponentProps<"a">) {
  if (!href) return <span {...props}>{children}</span>;

  const isInternal = href.startsWith("/") || href.startsWith("#");

  if (isInternal) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

/**
 * Componenti disponibili dentro gli MDX.
 * Aggiungerne uno qui lo rende scrivibile nei case study come fosse un tag.
 */
const mdxComponents = {
  img: MdxImage,
  a: MdxLink,
};

/**
 * Compila una stringa MDX in un albero React.
 *
 * @example
 * const content = await renderMdx(project.content);
 * return <div className="prose-case-study">{content}</div>;
 */
export async function renderMdx(source: string): Promise<ReactElement> {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
  });

  return content;
}

export { extractHeadings, type Heading } from "./headings";
