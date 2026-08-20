"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const clearProps = "transform,opacity,visibility,clipPath,filter";

function createScrollTimeline(trigger: Element, compact: boolean) {
  return gsap.timeline({
    scrollTrigger: {
      trigger,
      start: compact ? "top 92%" : "top 85%",
      once: true
    }
  });
}

function addHeadingReveal(
  timeline: gsap.core.Timeline,
  targets: HTMLElement[],
  from: gsap.TweenVars,
  compact: boolean,
  duration = compact ? 0.98 : 1.12,
  position: number | string = 0
) {
  if (targets.length === 0) return timeline;

  return timeline.fromTo(targets, from, {
    autoAlpha: 1,
    x: 0,
    y: 0,
    filter: "blur(0px)",
    duration,
    ease: "power3.out",
    clearProps
  }, position);
}

function animateProductCenter(query: gsap.utils.SelectorFunc, compact: boolean) {
  const list = query<HTMLElement>(".product-center-list")[0];
  const cards = query<HTMLElement>(".product-center-card");
  if (!list || cards.length === 0) return;

  const origins = [-18, 18];
  const desktopStarts = cards.map((_, index) => index * 0.3);
  const heading = query<HTMLElement>(".product-center-section .home-editorial-heading");
  const headingDuration = compact ? 0.98 : 1.12;
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: list,
      start: compact ? "top 92%" : "top 84%",
      once: true
    }
  });

  if (heading.length) {
    timeline.fromTo(heading, {
      autoAlpha: 0,
      x: compact ? 0 : -30,
      y: compact ? 24 : 0,
      filter: "blur(5px)"
    }, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      duration: headingDuration,
      ease: "power3.out",
      clearProps
    });
  }

  cards.forEach((card, index) => {
    const origin = compact ? (index % 2 === 0 ? -12 : 12) : origins[index % origins.length];
    const startAt = (heading.length ? headingDuration + 0.24 : 0) + (compact ? index * 0.26 : desktopStarts[index] ?? index * 0.3);
    const copy = card.querySelector<HTMLElement>(".product-center-copy");

    timeline.fromTo(card, {
      autoAlpha: 0,
      x: origin,
      y: compact ? 18 : 22
    }, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      duration: compact ? 1.08 : 1.3,
      ease: "power3.out",
      clearProps: "transform"
    }, startAt);

    if (copy) {
      timeline.fromTo(copy, { autoAlpha: 0, y: 16 }, {
        autoAlpha: 1,
        y: 0,
        duration: compact ? 0.86 : 1,
        ease: "power2.out",
        clearProps: "transform,opacity,visibility"
      }, startAt + (compact ? 0.16 : 0.24));
    }
  });
}

export function SectionOrchestrator({ scope }: { scope: HTMLElement | null }) {
  useGSAP(() => {
    const root = scope;
    if (!root) return;

    const query = gsap.utils.selector(root);
    const media = gsap.matchMedia();

    const setupMotion = (compact: boolean) => {
      gsap.set(query([
        ".timeline-section-heading",
        ".capability-orbit-track",
        ".capability-orbit-sweep",
        ".capability-orbit-core",
        ".capability-orbit-stage",
        ".capability-orbit-link",
        ".capability-orbit-node",
        ".home-drivers .home-editorial-heading",
        ".home-driver-grid > article",
        ".home-challenge-intro",
        ".home-challenge-list > li",
        ".home-management-heading",
        ".home-management-flow > li",
        ".home-management-summary",
        ".home-services .home-editorial-heading",
        ".home-service-list > a",
        ".home-cases-heading",
        ".home-case-grid > a",
        ".home-positioning header",
        ".home-positioning p",
        ".contact-intro",
        ".contact-form-panel",
        ".product-center-section .home-editorial-heading",
        ".product-center-card"
      ].join(", ")), { autoAlpha: 0 });

      const headingFrom = compact
        ? { autoAlpha: 0, y: 24, filter: "blur(5px)" }
        : { autoAlpha: 0, x: -30, filter: "blur(6px)" };

      const timelineSection = query<HTMLElement>(".timeline-section")[0];
      if (timelineSection) {
        const heading = query<HTMLElement>(".timeline-section-heading");
        const tracks = query<SVGCircleElement>(".capability-orbit-track");
        const sweeps = query<SVGCircleElement>(".capability-orbit-sweep");
        const core = query<HTMLElement>(".capability-orbit-core");
        const entries = query<HTMLElement>(".capability-orbit-stage");
        const links = query<HTMLElement>(".capability-orbit-link");
        const nodes = query<HTMLElement>(".capability-orbit-node");
        const timeline = createScrollTimeline(timelineSection, compact);

        addHeadingReveal(timeline, heading, headingFrom, compact).fromTo(tracks, {
          autoAlpha: 0,
          strokeDashoffset: (index) => index === 0 ? 1458 : 1106
        }, {
          autoAlpha: 0.72,
          strokeDashoffset: 0,
          duration: compact ? 1.05 : 1.35,
          stagger: 0.08,
          ease: "power2.inOut"
        }, ">+0.12").fromTo(sweeps, {
          autoAlpha: 0,
          strokeDasharray: (index) => index === 0 ? "0 1458" : "0 1106",
          strokeDashoffset: 0
        }, {
          autoAlpha: 1,
          strokeDasharray: (index) => index === 0 ? "510 948" : "268 838",
          strokeDashoffset: 0,
          duration: compact ? 1.18 : 1.55,
          stagger: 0.12,
          ease: "power3.inOut"
        }, ">-0.82").fromTo(core, {
          autoAlpha: 0,
          scale: 0.72,
          rotation: -10
        }, {
          autoAlpha: 1,
          scale: 1,
          rotation: 0,
          duration: compact ? 0.9 : 1.12,
          ease: "back.out(1.45)",
          clearProps
        }, ">+0.16").fromTo(entries, {
          autoAlpha: 0,
          x: (index) => index === 0 || index === 3 ? -30 : 30,
          y: (index) => index < 2 ? -22 : 22,
          scale: 0.94
        }, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: compact ? 0.98 : 1.12,
          stagger: compact ? 0.2 : 0.26,
          ease: "power3.out",
          clearProps
        }, ">+0.22");
        timeline.fromTo(links, { scaleX: 0 }, {
          scaleX: 1,
          duration: 0.72,
          stagger: compact ? 0.2 : 0.26,
          ease: "power2.inOut",
          clearProps: "transform"
        }, "<+=0.12");
        timeline.fromTo(nodes, { scale: 0, transformOrigin: "center" }, {
          scale: 1, rotation: 0, duration: 0.66, stagger: compact ? 0.2 : 0.26,
          ease: "back.out(1.8)", clearProps: "transform"
        }, "<+=0.08");
      }

      const drivers = query<HTMLElement>(".home-drivers")[0];
      if (drivers) {
        const timeline = createScrollTimeline(drivers, compact);
        addHeadingReveal(timeline, query<HTMLElement>(".home-drivers .home-editorial-heading"), headingFrom, compact, compact ? 1 : 1.16).fromTo(query<HTMLElement>(".home-driver-grid > article"), {
          autoAlpha: 0, y: compact ? 30 : 48, scale: 0.94,
          rotation: (index) => compact ? 0 : index % 2 === 0 ? -1.5 : 1.5
        }, {
          autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: compact ? 0.98 : 1.16,
          stagger: compact ? 0.18 : 0.22, ease: "back.out(1.2)", clearProps
        }, 0.18);
      }

      const challenges = query<HTMLElement>(".home-challenges")[0];
      if (challenges) {
        const timeline = createScrollTimeline(challenges, compact);
        addHeadingReveal(timeline, query<HTMLElement>(".home-challenge-intro"), headingFrom, compact).fromTo(query<HTMLElement>(".home-challenge-list > li"), {
          autoAlpha: 0, x: compact ? 24 : 58, clipPath: "inset(0 0 0 16%)"
        }, {
          autoAlpha: 1, x: 0, clipPath: "inset(0 0 0 0)", duration: compact ? 0.96 : 1.12,
          stagger: compact ? 0.18 : 0.24, ease: "power3.out", clearProps
        }, 0.2);
      }

      const management = query<HTMLElement>(".home-management-path")[0];
      if (management) {
        const flowItems = query<HTMLElement>(".home-management-flow > li");
        const timeline = createScrollTimeline(management, compact);
        addHeadingReveal(timeline, query<HTMLElement>(".home-management-heading"), headingFrom, compact).fromTo(flowItems, {
          autoAlpha: 0, x: compact ? -18 : -38, scale: 0.9, transformOrigin: "left center"
        }, {
          autoAlpha: 1, x: 0, scale: 1, duration: compact ? 0.98 : 1.16,
          stagger: compact ? 0.2 : 0.26, ease: "back.out(1.25)", clearProps
        }, 0.2).fromTo(query<HTMLElement>(".home-management-summary"), {
          autoAlpha: 0, y: 24
        }, {
          autoAlpha: 1, y: 0, duration: 0.82, ease: "power2.out", clearProps
        }, ">-0.25");
      }

      const services = query<HTMLElement>(".home-services")[0];
      if (services) {
        const timeline = createScrollTimeline(services, compact);
        addHeadingReveal(timeline, query<HTMLElement>(".home-services .home-editorial-heading"), headingFrom, compact).fromTo(query<HTMLElement>(".home-service-list > a"), {
          autoAlpha: 0,
          x: (index) => compact ? 0 : index % 2 === 0 ? -46 : 46,
          y: compact ? 28 : 0,
          clipPath: (index) => compact ? "inset(10% 0 0 0)" : index % 2 === 0 ? "inset(0 12% 0 0)" : "inset(0 0 0 12%)"
        }, {
          autoAlpha: 1, x: 0, y: 0, clipPath: "inset(0 0 0 0)", duration: compact ? 0.98 : 1.16,
          stagger: compact ? 0.18 : 0.24, ease: "power3.out", clearProps
        }, 0.2);
      }

      const cases = query<HTMLElement>(".home-cases")[0];
      if (cases) {
        const cards = query<HTMLElement>(".home-case-grid > a");
        const images = query<HTMLElement>(".home-case-grid > a img");
        const timeline = createScrollTimeline(cases, compact);
        addHeadingReveal(timeline, query<HTMLElement>(".home-cases-heading"), headingFrom, compact).fromTo(cards, {
          autoAlpha: 0, y: compact ? 34 : 54, scale: 0.94, clipPath: "inset(8% 0 0 0)"
        }, {
          autoAlpha: 1, y: 0, scale: 1, clipPath: "inset(0 0 0 0)", duration: compact ? 1 : 1.2,
          stagger: compact ? 0.2 : 0.26, ease: "power3.out", clearProps
        }, 0.18);

        if (images.length) {
          timeline.fromTo(images, { scale: 1.1 }, {
            scale: 1, duration: compact ? 1.08 : 1.42, stagger: compact ? 0.12 : 0.17,
            ease: "power2.out", clearProps: "transform"
          }, 0.18);
        }
      }

      const positioning = query<HTMLElement>(".home-positioning")[0];
      if (positioning) {
        const timeline = createScrollTimeline(positioning, compact);
        addHeadingReveal(timeline, query<HTMLElement>(".home-positioning header"), headingFrom, compact).fromTo(query<HTMLElement>(".home-positioning p"), {
          autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)"
        }, {
          autoAlpha: 1, y: 0, clipPath: "inset(0 0 0 0)", duration: compact ? 0.98 : 1.16,
          stagger: compact ? 0.18 : 0.24, ease: "power3.out", clearProps
        }, 0.18);
      }

      const contact = query<HTMLElement>(".contact-section")[0];
      if (contact) {
        const timeline = createScrollTimeline(contact, compact);
        timeline.fromTo(query<HTMLElement>(".contact-intro"), {
          autoAlpha: 0, x: compact ? 0 : -46, y: compact ? 26 : 0
        }, {
          autoAlpha: 1, x: 0, y: 0, duration: compact ? 1 : 1.2,
          ease: "power3.out", clearProps
        }).fromTo(query<HTMLElement>(".contact-form-panel"), {
          autoAlpha: 0, x: compact ? 0 : 54, y: compact ? 34 : 0, scale: 0.97
        }, {
          autoAlpha: 1, x: 0, y: 0, scale: 1, duration: compact ? 1.04 : 1.28,
          ease: "power3.out", clearProps
        }, compact ? 0.16 : 0.08);
      }

      animateProductCenter(query, compact);
    };

    media.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => setupMotion(false));
    media.add("(max-width: 768px) and (prefers-reduced-motion: no-preference)", () => setupMotion(true));
    media.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(query(".timeline-section, .home-drivers, .home-challenges, .home-management-path, .home-services, .product-center-section, .home-cases, .home-positioning, .contact-section"), { clearProps: "all" });
    });

    gsap.set(root, { attr: { "data-motion-ready": "true" } });

    return () => {
      media.revert();
      gsap.set(root, { attr: { "data-motion-ready": "" } });
    };
  }, { scope: scope ?? undefined, dependencies: [scope], revertOnUpdate: true });

  return null;
}
