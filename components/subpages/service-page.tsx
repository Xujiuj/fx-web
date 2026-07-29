import Image from "next/image";
import { ReferenceDiagram } from "@/components/reference-diagram";
import type { Subpage } from "@/lib/cms-content";
import styles from "./service-page.module.css";

export function ServicePage({ page }: { page: Subpage }) {
  const visuals = page.sections.flatMap((section) => section.items.filter((item) => item.image).map((item) => ({ ...item, eyebrow: section.title || page.eyebrow })));

  return (
    <>
      <section className={`${styles.hero} page-reveal`}>
        <Image src={page.image} alt="" fill priority sizes="100vw" className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroTitle}>
          <p>{page.eyebrow}</p>
          <h1>{page.title}</h1>
        </div>
      </section>

      <section className={`${styles.introduction} page-reveal`} aria-label={page.title}>
        <p>{page.summary}</p>
      </section>

      {visuals.map((visual) => <ReferenceDiagram key={visual.title} eyebrow={visual.eyebrow} title={visual.title} description={visual.description ?? ""} src={visual.image!} alt={visual.title} />)}
    </>
  );
}
