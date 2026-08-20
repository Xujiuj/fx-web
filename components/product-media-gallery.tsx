"use client";

import { CheckCircle2, ExternalLink } from "lucide-react";
import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import styles from "./subpages/product-pages.module.css";

export type ProductMediaItem = {
  src: string;
  thumbnailSrc?: string;
  fullSrc?: string;
  alt: string;
  label: string;
  width: number;
  height: number;
};

export type PlatformOverviewItem = ProductMediaItem & {
  summary: string;
  points: string[];
  gallery?: ProductMediaItem[];
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

      <a className={styles.mediaStage} href={selected.fullSrc ?? selected.src} target="_blank" rel="noreferrer">
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
            <img src={item.thumbnailSrc ?? item.src} alt="" width={item.width} height={item.height} loading="lazy" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function PlatformOverview({ items, title = "平台三大核心优势", description = "选择一项能力查看对应说明和真实界面，避免在长页面中重复铺陈同类内容。" }: { items: PlatformOverviewItem[]; title?: string; description?: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [gallerySelections, setGallerySelections] = useState<Record<number, number>>({});
  const generatedId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = items[selectedIndex] ? selectedIndex : 0;
  const idPrefix = `platform-overview-${generatedId.replace(/:/g, "")}`;
  const headingId = `${idPrefix}-title`;
  const tabId = (index: number) => `${idPrefix}-tab-${index}`;
  const panelId = (index: number) => `${idPrefix}-panel-${index}`;

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    setSelectedIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  if (items.length === 0) return null;

  return (
    <section className={`${styles.platformOverview} ${styles.container}`} aria-labelledby={headingId}>
      <header className={styles.sectionHeading}>
        <span>PRODUCT OVERVIEW</span>
        <h2 id={headingId}>{title}</h2>
        <p>{description}</p>
      </header>
      <div className={styles.overviewWorkspace}>
        <div className={styles.overviewTabs} role="tablist" aria-label="平台核心能力">
          {items.map((item, index) => {
            const isSelected = index === activeIndex;

            return (
              <button
                type="button"
                role="tab"
                id={tabId(index)}
                aria-controls={panelId(index)}
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={isSelected ? styles.activeOverviewTab : undefined}
                key={item.label}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                onClick={() => setSelectedIndex(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.label}</strong>
                {isSelected ? <p>{item.summary}</p> : null}
              </button>
            );
          })}
        </div>
        {items.map((item, index) => (
          <div
            className={styles.overviewVisual}
            role="tabpanel"
            id={panelId(index)}
            aria-labelledby={tabId(index)}
            hidden={index !== activeIndex}
            key={item.label}
          >
            {index === activeIndex ? (
              <>
                {item.gallery?.length ? (
                  (() => {
                    const galleryIndex = Math.min(gallerySelections[index] ?? 0, item.gallery.length - 1);
                    const selectedGalleryItem = item.gallery[galleryIndex];
                    if (!selectedGalleryItem) return null;

                    return (
                      <>
                        <a className={styles.overviewGalleryStage} href={selectedGalleryItem.fullSrc ?? selectedGalleryItem.src} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={selectedGalleryItem.src} alt={selectedGalleryItem.alt} width={selectedGalleryItem.width} height={selectedGalleryItem.height} />
                        </a>
                        <div className={styles.overviewGalleryControls} role="group" aria-label={`${item.label}图组切换`}>
                          {item.gallery.map((galleryItem, galleryItemIndex) => (
                            <button
                              type="button"
                              key={galleryItem.src}
                              aria-pressed={galleryItemIndex === galleryIndex}
                              className={galleryItemIndex === galleryIndex ? styles.activeGalleryControl : undefined}
                              onClick={() => setGallerySelections((current) => ({ ...current, [index]: galleryItemIndex }))}
                            >
                              {String(galleryItemIndex + 1).padStart(2, "0")} {galleryItem.label}
                            </button>
                          ))}
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <a href={item.fullSrc ?? item.src} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.src} alt={item.alt} width={item.width} height={item.height} />
                  </a>
                )}
                <ul>
                  {item.points.map((point) => (
                    <li key={point}><CheckCircle2 size={16} aria-hidden="true" />{point}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
