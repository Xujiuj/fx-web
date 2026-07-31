import { Maximize2 } from "lucide-react";
import styles from "./reference-diagram.module.css";

type ReferenceDiagramProps = {
  eyebrow: string;
  title: string;
  description: string;
  src: string;
  alt: string;
};

export function ReferenceDiagram({ eyebrow, title, description, src, alt }: ReferenceDiagramProps) {
  return (
    <figure className={`${styles.figure} page-reveal`} data-motion="diagram" data-motion-group="diagram">
      <figcaption className={styles.caption} data-motion-role="copy">
        <span>{eyebrow}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </figcaption>
      <a
        className={styles.canvas}
        data-motion-role="visual"
        href={src}
        target="_blank"
        rel="noreferrer"
        aria-label={`查看${title}原图`}
      >
        {/* SVGs remain native so the browser can render the supplied vector source directly. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={1200}
          height={800}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <span className={styles.openOriginal}>
          <Maximize2 size={16} aria-hidden="true" />
          查看原图
        </span>
      </a>
    </figure>
  );
}
