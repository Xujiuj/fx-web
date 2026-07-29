"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>(".reference-page .page-reveal").forEach((element) => {
        const isMajorModule = element.matches("section, aside") || element.querySelector("h1");

        gsap.fromTo(element, {
          autoAlpha: 0,
          y: isMajorModule ? 24 : 16
        }, {
          autoAlpha: 1,
          y: 0,
          duration: isMajorModule ? 1.6 : 1.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true
          }
        });
      });
    });

    return () => media.revert();
  }, { dependencies: [page.layout, page.slug], revertOnUpdate: true });

  return (
    <main className={`reference-page page-${page.layout}`}>
      <PageComponent page={page} />
    </main>
  );
}
