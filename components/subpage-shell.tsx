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
    const clearProps = "transform,opacity,visibility,clipPath";

    const animateHero = (compact: boolean) => {
      const copy = query<HTMLElement>("[data-motion='hero-copy']");
      const visual = query<HTMLElement>("[data-motion='hero-visual']");
      const supporting = query<HTMLElement>("[data-motion='hero-support']");
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (copy.length) {
        timeline.fromTo(copy, {
          autoAlpha: 0,
          x: 0,
          y: compact ? 12 : 16
        }, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: compact ? 0.46 : 0.56,
          stagger: 0.05,
          clearProps
        });
      }

      if (visual.length) {
        timeline.fromTo(visual, {
          autoAlpha: 0,
          x: 0,
          y: compact ? 14 : 18,
          scale: 0.99,
          clipPath: "inset(4% 0 0 0)"
        }, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          clipPath: "inset(0 0 0 0)",
          duration: compact ? 0.52 : 0.66,
          stagger: 0.05,
          clearProps
        }, copy.length ? 0.08 : 0);
      }

      if (supporting.length) {
        timeline.fromTo(supporting, {
          autoAlpha: 0,
          y: 10,
          scale: 1
        }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.46,
          stagger: 0.04,
          clearProps
        }, copy.length ? 0.16 : 0.06);
      }
    };

    const animateGroup = (group: HTMLElement, compact: boolean) => {
      const roles = (role: string) => [
        ...(group.dataset.motionRole === role ? [group] : []),
        ...Array.from(group.querySelectorAll<HTMLElement>(`[data-motion-role='${role}']`))
      ];
      const heading = roles("heading");
      const copy = roles("copy");
      const visual = roles("visual");
      const items = roles("item");
      const kind = group.dataset.motionGroup ?? "content";
      const presentation = kind.match(/^solution-presentation-(01|02|03|04)$/)?.[1];
      const isFramework = kind === "solution-framework";
      const isPath = kind.includes("path") || kind.includes("process");
      const itemSequence = presentation === "04" ? [...items].reverse() : items;
      const itemY = (index: number) => {
        if (compact) return 10;
        return isFramework && index === 2 ? 16 : 14;
      };

      if (heading.length) {
        gsap.set(heading, {
          autoAlpha: 0,
          x: 0,
          y: compact ? 10 : 14
        });
      }

      if (kind === "diagram") {
        gsap.set(copy, { autoAlpha: 0, x: 0, y: compact ? 10 : 14 });
        gsap.set(visual, {
          autoAlpha: 0,
          x: 0,
          y: compact ? 12 : 16,
          scale: 0.992,
          clipPath: "inset(4% 0 0 0)"
        });
      } else if (kind === "platform-advantage") {
        gsap.set(copy, { autoAlpha: 0, x: 0, y: compact ? 10 : 14 });
        gsap.set(visual, {
          autoAlpha: 0,
          x: 0,
          y: compact ? 12 : 16,
          clipPath: "inset(4% 0 0 0)"
        });
      }

      if (items.length) {
        gsap.set(items, {
          autoAlpha: 0,
          x: 0,
          y: itemY,
          scale: 1,
          clipPath: "inset(0 0 0 0)",
          transformOrigin: presentation === "04" ? "center bottom" : "center"
        });
      }

      ScrollTrigger.create({
        trigger: group,
        start: compact ? "top 94%" : "top 91%",
        once: true,
        onEnter: () => {
          const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

          if (heading.length) {
            timeline.to(heading, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              duration: compact ? 0.4 : 0.5,
              clearProps
            });
          }

          if (kind === "diagram") {
            timeline.to(copy, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              duration: 0.48,
              clearProps
            }, heading.length ? 0.08 : 0)
              .to(visual, {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                clipPath: "inset(0 0 0 0)",
                duration: compact ? 0.5 : 0.6,
                clearProps
              }, 0.08);
            return;
          }

          if (kind === "platform-advantage") {
            timeline.to(copy, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              duration: 0.48,
              clearProps
            }, 0)
              .to(visual, {
                autoAlpha: 1,
                x: 0,
                y: 0,
                clipPath: "inset(0 0 0 0)",
                duration: 0.58,
                clearProps
              }, 0.08);
            return;
          }

          if (items.length) {
            timeline.to(itemSequence, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              clipPath: "inset(0 0 0 0)",
              duration: compact ? 0.38 : 0.5,
              stagger: compact ? 0.03 : isPath ? 0.045 : 0.05,
              clearProps
            }, heading.length ? 0.12 : 0);
          }
        }
      });
    };

    const setupMotion = (compact: boolean) => {
      animateHero(compact);
      gsap.utils.toArray<HTMLElement>(query("[data-motion-group]")).forEach((group) => animateGroup(group, compact));

      gsap.utils.toArray<HTMLElement>(query("[data-motion='cta']")).forEach((element) => {
        gsap.set(element, {
          autoAlpha: 0,
          y: 12,
          scaleX: 1,
          transformOrigin: "center"
        });
        ScrollTrigger.create({
          trigger: element,
          start: compact ? "top 94%" : "top 92%",
          once: true,
          onEnter: () => gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            scaleX: 1,
            duration: 0.5,
            ease: "power3.out",
            clearProps
          })
        });
      });
    };

    media.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => setupMotion(false));
    media.add("(max-width: 768px) and (prefers-reduced-motion: no-preference)", () => setupMotion(true));
    media.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(query("[data-motion], [data-motion-group], [data-motion-role]"), { clearProps: "all" });
    });

    return () => media.revert();
  }, { scope: pageRef, dependencies: [page.layout, page.slug], revertOnUpdate: true });

  return (
    <main ref={pageRef} className={`reference-page page-${page.layout}`} data-motion-family={page.layout}>
      <PageComponent page={page} />
    </main>
  );
}
