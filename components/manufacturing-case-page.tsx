"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BarChart3, Boxes, ChartNoAxesCombined, UsersRound } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import type { Subpage, SubpageSection } from "@/lib/cms-content";
import styles from "./manufacturing-case-page.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const defaultCaseModules = [
  {
    title: "温室气体核算",
    description: "围绕固定燃烧、外购电力和生产过程数据，明确组织与运营边界，形成可复核的温室气体核算基础。",
    icon: ChartNoAxesCombined,
    image: "/media/manufacturing-carbon-accounting.png"
  },
  {
    title: "活动数据治理",
    description: "梳理能源、原辅料、生产与运输等活动数据的来源、责任人和维护频率，建立统一的数据口径。",
    icon: UsersRound,
    image: "/media/manufacturing-carbon-governance.png"
  },
  {
    title: "碳数据分析",
    description: "通过总量、强度、基准年和趋势分析，帮助企业识别重点排放环节，为减排管理和披露准备提供依据。",
    icon: Boxes,
    image: "/media/manufacturing-carbon-analytics.png"
  },
  {
    title: "持续运营管理",
    description: "以 Excel 核算工具或数字化平台支持多年度更新、集团汇总和过程追溯，让碳管理成为持续可用的业务能力。",
    icon: BarChart3,
    image: "/media/manufacturing-carbon-operations.png"
  }
];

function createSingleEntryTrigger(trigger: Element, start: string, onEnter: () => void) {
  let hasEntered = false;

  return ScrollTrigger.create({
    trigger,
    start,
    once: true,
    onEnter: () => {
      if (hasEntered) return;
      hasEntered = true;
      onEnter();
    }
  });
}

function HeroArtwork({ image }: { image?: string }) {
  return (
    <div className={styles.heroArtwork} aria-hidden="true">
      <Image
        src={image ?? "/media/manufacturing-carbon-case-hero-warm.png"}
        alt=""
        fill
        priority
        sizes="(max-width: 760px) calc(100vw - 32px), 1120px"
      />
    </div>
  );
}

function CaseArtwork({ image, title }: Pick<(typeof defaultCaseModules)[number], "image" | "title">) {
  return (
    <div className={styles.caseArtwork}>
      <Image src={image} alt={title} fill sizes="(max-width: 760px) calc(100vw - 32px), 650px" />
    </div>
  );
}

function configuredModules(page: Subpage) {
  const section = page.sections.find((entry) => entry.id === "applications") as SubpageSection | undefined;
  if (!section?.items.length) return defaultCaseModules;
  return section.items.map((item, index) => ({
    title: item.title,
    description: item.description ?? "",
    image: item.image ?? defaultCaseModules[index % defaultCaseModules.length].image,
    icon: defaultCaseModules[index % defaultCaseModules.length].icon
  }));
}

export function ManufacturingCasePage({ page }: { page: Subpage }) {
  const applications = page.sections.find((entry) => entry.id === "applications");
  const caseModules = configuredModules(page);
  const pageRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const pageElement = pageRef.current;
    if (!pageElement) return;

    const query = gsap.utils.selector(pageElement);
    const media = gsap.matchMedia();
    const clearProps = "transform,opacity,visibility,clipPath";

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const compact = window.matchMedia("(max-width: 760px)").matches;

      gsap.timeline()
        .fromTo(query(`.${styles.heroCopy}`), {
          autoAlpha: 0,
          x: compact ? 0 : -44,
          y: compact ? 30 : 0,
          filter: "blur(7px)"
        }, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          filter: "blur(0px)",
          duration: compact ? 0.9 : 1.08,
          ease: "power3.out",
          clearProps: `${clearProps},filter`
        })
        .fromTo(query(`.${styles.heroArtwork} img`), {
          autoAlpha: 0,
          x: compact ? 0 : 54,
          y: compact ? 34 : 0,
          scale: compact ? 1.08 : 1.12,
          clipPath: compact ? "inset(10% 0 0 0)" : "inset(0 0 0 14%)"
        }, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          clipPath: "inset(0 0 0 0)",
          duration: compact ? 1.12 : 1.5,
          ease: "power2.out",
          clearProps
        }, 0.14);

      gsap.utils.toArray<HTMLElement>(query(`.${styles.introduction} p`)).forEach((element) => {
        createSingleEntryTrigger(element, compact ? "top 92%" : "top 84%", () => {
          gsap.fromTo(element, {
            autoAlpha: 0,
            x: compact ? 0 : -34,
            y: compact ? 24 : 0,
            filter: "blur(5px)"
          }, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            filter: "blur(0px)",
            duration: compact ? 0.76 : 0.94,
            ease: "power3.out",
            clearProps: `${clearProps},filter`
          });
        });
      });

      const sectionHeading = query<HTMLElement>(`.${styles.sectionHeading}`)[0];
      if (sectionHeading) {
        createSingleEntryTrigger(sectionHeading, compact ? "top 92%" : "top 84%", () => {
          gsap.fromTo(sectionHeading, {
            autoAlpha: 0,
            x: compact ? 0 : -38,
            y: compact ? 24 : 0,
            filter: "blur(5px)"
          }, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            filter: "blur(0px)",
            duration: compact ? 0.78 : 0.98,
            ease: "power3.out",
            clearProps: `${clearProps},filter`
          });
        });
      }

      gsap.utils.toArray<HTMLElement>(query(`.${styles.caseItem}`)).forEach((element, index) => {
        const artwork = element.querySelector<HTMLElement>(`.${styles.caseArtwork}`);
        const copy = element.querySelector<HTMLElement>(`.${styles.caseCopy}`);
        const origins = [
          { x: -30, y: 0, clipPath: "inset(0 10% 0 0)" },
          { x: 0, y: 26, clipPath: "inset(10% 0 0 0)" },
          { x: 30, y: 0, clipPath: "inset(0 0 0 10%)" }
        ];
        const origin = origins[index % origins.length];

        createSingleEntryTrigger(element, compact ? "top 92%" : "top 84%", () => {
          const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
          if (artwork) {
            timeline.fromTo(artwork, {
              autoAlpha: 0,
              ...origin
            }, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              clipPath: "inset(0 0 0 0)",
              duration: compact ? 0.86 : 1.08,
              clearProps
            });
            const image = artwork.querySelector("img");
            if (image) {
              timeline.fromTo(image, { scale: compact ? 1.07 : 1.11 }, {
                scale: 1,
                duration: compact ? 1.08 : 1.38,
                ease: "power2.out",
                clearProps: "transform"
              }, 0);
            }
          }
          if (copy) {
            timeline.fromTo(copy, {
              autoAlpha: 0,
              y: compact ? 24 : 30,
              filter: "blur(4px)"
            }, {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: compact ? 0.72 : 0.88,
              clearProps: `${clearProps},filter`
            }, artwork ? (compact ? 0.18 : 0.24) : 0);
          }
        });
      });
    });

    media.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(query(`.${styles.heroCopy}, .${styles.heroArtwork} img, .${styles.introduction} p, .${styles.sectionHeading}, .${styles.caseItem}, .${styles.caseArtwork}, .${styles.caseCopy}`), { clearProps: "all" });
    });

    return () => media.revert();
  }, { scope: pageRef });

  return (
    <main ref={pageRef} className={styles.page} data-motion-family="customer-case">
      <section className={styles.hero} aria-labelledby="manufacturing-case-title">
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <p>{page.eyebrow}</p>
            <h1 id="manufacturing-case-title">{page.title}</h1>
            <span>{page.navLabel}</span>
          </div>
          <HeroArtwork image={page.media?.hero} />
        </div>
      </section>

      <section className={styles.introduction} aria-labelledby="manufacturing-introduction-title">
        <h2 id="manufacturing-introduction-title" className="sr-only">制造企业碳管理服务</h2>
        <p>{page.summary}</p>
      </section>

      <section className={styles.applications} aria-labelledby="manufacturing-applications-title">
        <div className={styles.sectionHeading}>
          <p>{applications?.description ?? "应用场景"}</p>
          <h2 id="manufacturing-applications-title">{applications?.title ?? "围绕碳管理，连接关键业务数据"}</h2>
        </div>
        <div className={styles.caseList}>
          {caseModules.map(({ title, description, icon: Icon, image }, index) => (
            <article className={styles.caseItem} key={title}>
              <CaseArtwork image={image} title={title} />
              <div className={styles.caseCopy}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon size={22} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
