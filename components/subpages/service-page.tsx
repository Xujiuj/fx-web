import Image from "next/image";
import { ReferenceDiagram } from "@/components/reference-diagram";
import type { Subpage } from "@/lib/cms-content";
import styles from "./service-page.module.css";

export function ServicePage({ page }: { page: Subpage }) {
  const visuals = page.sections.flatMap((section) => section.items.filter((item) => item.image).map((item) => ({ ...item, eyebrow: section.title || page.eyebrow })));

  return (
    <>
      <section className={`${styles.hero} page-reveal`}>
        <Image className={styles.heroImage} src={page.image} alt="" fill priority sizes="(max-width: 680px) calc(100vw - 36px), 1200px" data-motion="hero-visual" />
        <div className={styles.heroShade} />
        <div className={styles.heroTitle} data-motion="hero-copy">
          <p>{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className={styles.heroSummary}>{page.summary}</p>
        </div>
      </section>

      {visuals.map((visual) => <ReferenceDiagram key={visual.title} eyebrow={visual.eyebrow} title={visual.title} description={visual.description ?? ""} src={visual.image!} alt={visual.title} />)}
    </>
  );
}
