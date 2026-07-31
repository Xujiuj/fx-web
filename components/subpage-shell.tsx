"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import type { Subpage, SubpageLayout } from "@/lib/cms-content";
import {
  CasesPage,
  CompanyPage,
  KnowledgePage
} from "./subpages/editorial-pages";
import {
  ContactPage,
  HonorsPage,
  PartnersPage
} from "./subpages/about-pages";
import {
  ExcelProductPage,
  PlatformProductPage
} from "./subpages/product-pages";
import {
  ConsultingPage,
  PlatformSolutionPage,
  PracticalPage,
  TrainingPage
} from "./subpages/solution-pages";
import { ServicePage } from "./subpages/service-page";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const pageComponents: Record<SubpageLayout, React.ComponentType<{ page: Subpage }>> = {
  training: TrainingPage,
  practical: PracticalPage,
  consulting: ConsultingPage,
  "solution-platform": PlatformSolutionPage,
  excel: ExcelProductPage,
  "product-platform": PlatformProductPage,
  cases: CasesPage,
  knowledge: KnowledgePage,
  company: CompanyPage,
  honors: HonorsPage,
  partners: PartnersPage,
  contact: ContactPage,
  service: ServicePage
};

export function SubpageShell({ page }: { page: Subpage }) {
  const PageComponent = pageComponents[page.layout] ?? TrainingPage;
  const pageRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const pageElement = pageRef.current;
    if (!pageElement) return;

    const query = gsap.utils.selector(pageElement);
    const media = gsap.matchMedia();
    const clearProps = "transform,opacity,visibility,clipPath,filter";

    const animateHero = (compact: boolean) => {
      const copy = query<HTMLElement>("[data-motion='hero-copy']");
      const visual = query<HTMLElement>("[data-motion='hero-visual']");
      const supporting = query<HTMLElement>("[data-motion='hero-support']");
      const editorial = ["cases", "knowledge", "company"].includes(page.layout);
      const imageLed = ["honors", "partners", "contact", "service"].includes(page.layout);
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      const copyDuration = compact ? 1 : 1.2;
      const visualDuration = compact ? 1.08 : 1.4;
      let nextPosition: number | string = 0;

      if (copy.length) {
        timeline.fromTo(copy, {
          autoAlpha: 0,
          x: compact || editorial || imageLed ? 0 : -46,
          y: compact ? 28 : editorial ? 38 : imageLed ? 26 : 0,
          filter: "blur(7px)",
          clipPath: editorial ? "inset(0 0 16% 0)" : "inset(0 0 0 0)"
        }, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          filter: "blur(0px)",
          clipPath: "inset(0 0 0 0)",
          duration: copyDuration,
          stagger: compact ? 0.16 : 0.22,
          clearProps
        });
        nextPosition = `>${compact ? 0.2 : 0.24}`;
      }

      if (visual.length) {
        timeline.fromTo(visual, {
          autoAlpha: 0,
          x: compact || editorial || imageLed ? 0 : 56,
          y: compact ? 34 : editorial ? 30 : imageLed ? 22 : 0,
          scale: compact ? 0.97 : imageLed ? 1.04 : 0.95,
          clipPath: compact || editorial || imageLed ? "inset(10% 0 0 0)" : "inset(0 0 0 13%)"
        }, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          clipPath: "inset(0 0 0 0)",
          duration: visualDuration,
          stagger: compact ? 0.16 : 0.22,
          clearProps
        }, nextPosition);

        const images = visual.flatMap((element) => Array.from(element.querySelectorAll<HTMLElement>("img")));
        if (images.length) {
          timeline.fromTo(images, { scale: compact ? 1.06 : 1.1 }, {
            scale: 1,
            duration: compact ? 1.24 : 1.62,
            stagger: compact ? 0.14 : 0.2,
            ease: "power2.out",
            clearProps: "transform"
          }, nextPosition);
        }
        nextPosition = `>${compact ? 0.2 : 0.24}`;
      }

      if (supporting.length) {
        timeline.fromTo(supporting, {
          autoAlpha: 0,
          y: compact ? 24 : 30,
          scale: 0.94
        }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: compact ? 0.94 : 1.12,
          stagger: compact ? 0.14 : 0.2,
          clearProps
        }, nextPosition);
      }
    };

    const animateGroup = (group: HTMLElement, compact: boolean) => {
      const groupRoles = Array.from(group.querySelectorAll<HTMLElement>("[data-motion-role]"))
        .filter((element) => element.closest<HTMLElement>("[data-motion-group]") === group);
      const roles = (role: string) => [
        ...(group.dataset.motionRole === role ? [group] : []),
        ...groupRoles.filter((element) => element.dataset.motionRole === role)
      ].filter((element) => !groupRoles.some((descendant) => descendant !== element && element.contains(descendant)));
      const heading = roles("heading");
      const copy = roles("copy");
      const visual = roles("visual");
      const items = roles("item");
      const kind = group.dataset.motionGroup ?? "content";
      const presentation = kind.match(/^solution-presentation-(01|02|03|04)$/)?.[1];
      const isFramework = kind === "solution-framework";
      const isPath = /path|process|services|outcomes/.test(kind);
      const isGrid = /grid|belief|framework|deliverables/.test(kind);
      const isCompare = kind.includes("compare");
      const isArchitecture = kind.includes("architecture");
      const isIntroduction = /introduction|section-heading|overview/.test(kind);
      const itemSequence = presentation === "04" ? [...items].reverse() : items;
      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: group,
          start: compact ? "top 92%" : "top 84%",
          once: true
        }
      });

      const headingDuration = compact ? 1.02 : 1.16;
      const contentDuration = compact ? 0.98 : 1.12;
      const visualDuration = compact ? 1.08 : 1.28;

      if (heading.length) {
        timeline.fromTo(heading, {
          autoAlpha: 0,
          x: compact || isIntroduction ? 0 : -32,
          y: compact || isIntroduction ? 24 : 0,
          filter: "blur(5px)",
          clipPath: isIntroduction ? "inset(0 0 18% 0)" : "inset(0 0 0 0)"
        }, {
          autoAlpha: 1, x: 0, y: 0, filter: "blur(0px)", clipPath: "inset(0 0 0 0)",
          duration: headingDuration, clearProps
        });
      }

      let nextPosition: number | string = heading.length ? headingDuration + 0.2 : 0;

      if (copy.length) {
        timeline.fromTo(copy, {
          autoAlpha: 0, x: compact ? 0 : -42, y: compact ? 28 : 0
        }, {
          autoAlpha: 1, x: 0, y: 0, duration: contentDuration,
          stagger: compact ? 0.12 : 0.18, clearProps
        }, nextPosition);
        nextPosition = `>${compact ? 0.2 : 0.24}`;
      }

      if (visual.length) {
        timeline.fromTo(visual, {
          autoAlpha: 0,
          x: compact ? 0 : 50,
          y: compact ? 32 : 0,
          scale: 0.95,
          clipPath: compact ? "inset(10% 0 0 0)" : "inset(0 0 0 12%)"
        }, {
          autoAlpha: 1, x: 0, y: 0, scale: 1, clipPath: "inset(0 0 0 0)",
          duration: visualDuration,
          stagger: compact ? 0.14 : 0.2,
          clearProps
        }, nextPosition);

        const images = visual.flatMap((element) => Array.from(element.querySelectorAll<HTMLElement>("img")));
        if (images.length) {
          timeline.fromTo(images, { scale: 1.08 }, {
            scale: 1, duration: compact ? 1.2 : 1.5, stagger: compact ? 0.12 : 0.18,
            ease: "power2.out", clearProps: "transform"
          }, ">-0.82");
        }
        nextPosition = `>${compact ? 0.18 : 0.22}`;
      }

      if (!itemSequence.length) {
        const fallbackItems = Array.from(group.children).filter((element) => {
          const target = element as HTMLElement;
          return !target.matches("[data-motion-group], [data-motion-role]") && Boolean(target.textContent?.trim());
        }) as HTMLElement[];
        if (fallbackItems.length) {
          gsap.set(fallbackItems, { autoAlpha: 0 });
          timeline.fromTo(fallbackItems, {
            autoAlpha: 0,
            y: compact ? 28 : 36,
            clipPath: "inset(0 0 12% 0)"
          }, {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0 0 0 0)",
            duration: contentDuration,
            stagger: compact ? 0.18 : 0.24,
            clearProps
          }, nextPosition);
        }
        return;
      }

      const itemX = (index: number) => {
        if (compact) return isPath ? -18 : 0;
        if (isCompare) return index === 0 ? -58 : index === itemSequence.length - 1 ? 58 : 0;
        if (isFramework) return [-44, 44, 0][index % 3];
        if (isArchitecture) return index === 0 ? 0 : index % 2 === 0 ? 36 : -36;
        if (isPath || presentation === "02") return -42;
        if (presentation === "03") return index % 2 === 0 ? -38 : 38;
        return isIntroduction ? 0 : index % 2 === 0 ? -24 : 24;
      };
      const itemY = (index: number) => {
        if (compact) return 28;
        if (isCompare) return index === 1 ? 34 : 0;
        if (isArchitecture) return index === 0 ? 42 : 20;
        if (presentation === "01" || presentation === "04" || isGrid) return 42;
        if (isFramework && index === 2) return 46;
        return isIntroduction ? 26 : 0;
      };
      const stagger = compact ? 0.18 : isPath ? 0.24 : isCompare ? 0.28 : isGrid ? 0.22 : 0.2;

      timeline.fromTo(itemSequence, {
        autoAlpha: 0,
        x: itemX,
        y: itemY,
        scale: isArchitecture ? 0.88 : isGrid || isCompare || presentation ? 0.94 : 1,
        rotation: (index) => compact || isPath || isCompare ? 0 : isGrid ? (index % 2 === 0 ? -1.3 : 1.3) : 0,
        clipPath: isFramework && !compact ? "inset(0 8% 0 8%)" : isIntroduction ? "inset(0 0 14% 0)" : "inset(0 0 0 0)",
        transformOrigin: presentation === "04" ? "center bottom" : "center"
      }, {
        autoAlpha: 1, x: 0, y: 0, scale: 1, rotation: 0, clipPath: "inset(0 0 0 0)",
        duration: compact ? 0.98 : isArchitecture ? 1.18 : 1.08,
        stagger,
        ease: isGrid || isArchitecture ? "back.out(1.25)" : "power3.out",
        clearProps
      }, nextPosition);
    };

    const animateUnmanagedSections = (compact: boolean) => {
      const candidates = query<HTMLElement>(".page-reveal:not([data-motion]):not([data-motion-group])")
        .filter((element) => !element.closest("[data-motion-group]"))
        .filter((element) => !element.querySelector("[data-motion], [data-motion-group], [data-motion-role]"));

      candidates.forEach((section) => {
        const children = Array.from(section.children).filter((element) => Boolean(element.textContent?.trim())) as HTMLElement[];
        if (!children.length) return;

        gsap.set(children, { autoAlpha: 0 });
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: compact ? "top 92%" : "top 84%",
            once: true
          }
        }).fromTo(children, {
          autoAlpha: 0,
          y: compact ? 26 : 38,
          clipPath: "inset(0 0 12% 0)"
        }, {
          autoAlpha: 1,
          y: 0,
          clipPath: "inset(0 0 0 0)",
          duration: compact ? 1 : 1.14,
          stagger: compact ? 0.2 : 0.26,
          ease: "power3.out",
          clearProps
        });
      });
    };

    const setupMotion = (compact: boolean) => {
      gsap.set(query([
        "[data-motion='hero-copy']",
        "[data-motion='hero-visual']",
        "[data-motion='hero-support']",
        "[data-motion='cta']",
        "[data-motion-group][data-motion-role]",
        "[data-motion-group] [data-motion-role]"
      ].join(", ")), { autoAlpha: 0 });

      // A role that wraps another role must stay visible while its leaf roles animate.
      // Otherwise the parent opacity hides the child timeline and creates a second-looking reveal.
      query<HTMLElement>("[data-motion-group][data-motion-role], [data-motion-group] [data-motion-role]")
        .filter((element) => {
          const group = element.closest<HTMLElement>("[data-motion-group]");
          return Boolean(group && Array.from(element.querySelectorAll<HTMLElement>("[data-motion-role]"))
            .some((descendant) => descendant.closest<HTMLElement>("[data-motion-group]") === group));
        })
        .forEach((element) => gsap.set(element, { autoAlpha: 1 }));

      animateHero(compact);
      gsap.utils.toArray<HTMLElement>(query("[data-motion-group]")).forEach((group) => animateGroup(group, compact));
      animateUnmanagedSections(compact);

      gsap.utils.toArray<HTMLElement>(query("[data-motion='cta']")).forEach((element) => {
        gsap.fromTo(element, {
          autoAlpha: 0,
          y: compact ? 32 : 0,
          scaleX: compact ? 1 : 0.92,
          clipPath: compact ? "inset(12% 0 0 0)" : "inset(0 4% 0 4%)",
          transformOrigin: "center"
        }, {
          autoAlpha: 1,
          y: 0,
          scaleX: 1,
          clipPath: "inset(0 0 0 0)",
          duration: compact ? 1 : 1.2,
          ease: "power3.out",
          clearProps,
          scrollTrigger: {
            trigger: element,
            start: compact ? "top 92%" : "top 86%",
            once: true
          }
        });
      });
    };

    media.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => setupMotion(false));
    media.add("(max-width: 768px) and (prefers-reduced-motion: no-preference)", () => setupMotion(true));
    media.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(query("[data-motion], [data-motion-group], [data-motion-role]"), { clearProps: "all" });
    });

    pageElement.dataset.motionReady = "true";

    return () => {
      media.revert();
      delete pageElement.dataset.motionReady;
    };
  }, { scope: pageRef, dependencies: [page.layout, page.slug], revertOnUpdate: true });

  return (
    <main ref={pageRef} className={`reference-page page-${page.layout}`} data-motion-family={page.layout}>
      <PageComponent page={page} />
    </main>
  );
}
