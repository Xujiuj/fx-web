"use client";

import { CheckCircle2, ExternalLink } from "lucide-react";
import { useState } from "react";
import styles from "./subpages/product-pages.module.css";

export type ProductMediaItem = {
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
};

export type PlatformOverviewItem = ProductMediaItem & {
  summary: string;
  points: string[];
};

export function ProductMediaGallery({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: ProductMediaItem[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = items[selectedIndex] ?? items[0];
  const headingId = `${eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-gallery-title`;

  if (!selected) return null;

  return (
    <section className={`${styles.mediaGallery} ${styles.container}`} aria-labelledby={headingId}>
      <header className={styles.sectionHeading}>
        <span>{eyebrow}</span>
        <h2 id={headingId}>{title}</h2>
        <p>{description}</p>
      </header>

      <a className={styles.mediaStage} href={selected.src} target="_blank" rel="noreferrer">
        {/* Keep supplied screenshots at their native aspect ratio and make the full-resolution file directly accessible. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={selected.src} alt={selected.alt} width={selected.width} height={selected.height} />
        <span>
          查看原图
          <ExternalLink size={16} aria-hidden="true" />
        </span>
      </a>

      <div className={styles.mediaThumbs} aria-label={`${title}截图选择`}>
        {items.map((item, index) => (
          <button
            className={index === selectedIndex ? styles.activeThumb : undefined}
            type="button"
            key={item.src}
            onClick={() => setSelectedIndex(index)}
            aria-pressed={index === selectedIndex}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt="" width={item.width} height={item.height} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function PlatformOverview({ items }: { items: PlatformOverviewItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = items[selectedIndex] ?? items[0];

  if (!selected) return null;

  return (
    <section className={`${styles.platformOverview} ${styles.container}`} aria-labelledby="platform-overview-title">
      <header className={styles.sectionHeading}>
        <span>PRODUCT OVERVIEW</span>
        <h2 id="platform-overview-title">三项能力，贯穿企业碳数据全流程</h2>
        <p>选择一项能力查看对应说明和真实界面，避免在长页面中重复铺陈同类内容。</p>
      </header>
      <div className={styles.overviewWorkspace}>
        <div className={styles.overviewTabs} role="tablist" aria-label="平台核心能力">
          {items.map((item, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={index === selectedIndex}
              className={index === selectedIndex ? styles.activeOverviewTab : undefined}
              key={item.label}
              onClick={() => setSelectedIndex(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.label}</strong>
              {index === selectedIndex ? <p>{item.summary}</p> : null}
            </button>
          ))}
        </div>
        <div className={styles.overviewVisual} role="tabpanel">
          <a href={selected.src} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.src} alt={selected.alt} width={selected.width} height={selected.height} />
          </a>
          <ul>
            {selected.points.map((point) => (
              <li key={point}><CheckCircle2 size={16} aria-hidden="true" />{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
