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
      gsap.timeline()
        .fromTo(query(`.${styles.heroCopy}`), {
          autoAlpha: 0,
          x: -34
        }, {
          autoAlpha: 1,
          x: 0,
          duration: 0.9,
          ease: "power3.out",
          clearProps
        })
        .fromTo(query(`.${styles.heroArtwork} img`), {
          autoAlpha: 0,
          x: 42,
          scale: 1.06,
          clipPath: "inset(0 0 0 12%)"
        }, {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          clipPath: "inset(0 0 0 0)",
          duration: 1.25,
          ease: "power3.out",
          clearProps
        }, 0.1);

      gsap.utils.toArray<HTMLElement>(query(`.${styles.introduction} p`)).forEach((element) => {
        ScrollTrigger.create({
          trigger: element,
          start: "top 90%",
          once: true,
          onEnter: () => gsap.fromTo(element, {
            autoAlpha: 0,
            x: -22
          }, {
            autoAlpha: 1,
            x: 0,
            duration: 0.72,
            ease: "power3.out",
            clearProps
          })
        });
      });

      const sectionHeading = query(`.${styles.sectionHeading}`);
      ScrollTrigger.create({
        trigger: sectionHeading,
        start: "top 90%",
        once: true,
        onEnter: () => gsap.fromTo(sectionHeading, {
          autoAlpha: 0,
          x: -26
        }, {
          autoAlpha: 1,
          x: 0,
          duration: 0.76,
          ease: "power3.out",
          clearProps
        })
      });

      gsap.utils.toArray<HTMLElement>(query(`.${styles.caseItem}`)).forEach((element, index) => {
        const artwork = element.querySelector<HTMLElement>(`.${styles.caseArtwork}`);
        const copy = element.querySelector<HTMLElement>(`.${styles.caseCopy}`);
        const origins = [
          { x: -30, y: 0, clipPath: "inset(0 10% 0 0)" },
          { x: 0, y: 26, clipPath: "inset(10% 0 0 0)" },
          { x: 30, y: 0, clipPath: "inset(0 0 0 10%)" }
        ];
        const origin = origins[index % origins.length];

        ScrollTrigger.create({
          trigger: element,
          start: "top 90%",
          once: true,
          onEnter: () => {
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
                duration: 0.86,
                clearProps
              });
              const image = artwork.querySelector("img");
              if (image) {
                timeline.fromTo(image, { scale: 1.07 }, { scale: 1, duration: 1.05, clearProps: "transform" }, 0);
              }
            }
            if (copy) {
              timeline.fromTo(copy, {
                autoAlpha: 0,
                y: 18
              }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.68,
                clearProps
              }, artwork ? 0.16 : 0);
            }
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
