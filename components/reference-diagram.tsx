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
      <div className={styles.canvas} data-motion-role="visual">
        {/* SVGs remain native so the browser can render the supplied vector source directly. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={1200}
          height={800}
          loading="lazy"
          decoding="async"
        />
      </div>
    </figure>
  );
}
