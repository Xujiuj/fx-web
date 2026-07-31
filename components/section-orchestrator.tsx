"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const latestUpdateOrigins = [
  { x: -36, y: 12, clipPath: "inset(0% 100% 0% 0%)" },
  { x: 18, y: -24, clipPath: "inset(100% 0% 0% 0%)" },
  { x: -18, y: 24, clipPath: "inset(0% 0% 100% 0%)" },
  { x: 36, y: 12, clipPath: "inset(0% 0% 0% 100%)" }
];

function animateLatestUpdates() {
  const list = document.querySelector(".latest-updates-list");
  const cards = gsap.utils.toArray<HTMLElement>(".latest-update");
  if (!list || cards.length === 0) return;

  const compact = window.matchMedia("(max-width: 720px)").matches;
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: list, start: compact ? "top 94%" : "top 88%", once: true }
  });

  cards.forEach((card, index) => {
    const desktopOrigin = latestUpdateOrigins[index % latestUpdateOrigins.length];
    const origin = compact
      ? { x: 0, y: 20, clipPath: "inset(8% 0% 0% 0%)" }
      : desktopOrigin;
    const startAt = compact ? index * 0.08 : [0, 0.16, 0.24, 0.08][index] ?? index * 0.1;
    const image = card.querySelector("img");
    const copy = card.querySelector<HTMLElement>(".latest-update-copy");

    timeline.fromTo(card, {
      autoAlpha: 0.72,
      x: origin.x,
      y: origin.y,
      scale: compact ? 0.99 : 1.015,
      clipPath: origin.clipPath
    }, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: 1,
      clipPath: "inset(0% 0% 0% 0%)",
      duration: compact ? 0.62 : 0.82,
      ease: "power3.out",
      clearProps: "transform,clipPath,opacity,visibility"
    }, startAt);

    if (image) {
      timeline.fromTo(image, { scale: compact ? 1.035 : 1.07 }, {
        scale: 1,
        duration: compact ? 0.76 : 1.02,
        ease: "power2.out",
        clearProps: "transform"
      }, startAt);
    }

    if (copy) {
      timeline.fromTo(copy, { autoAlpha: 0.78, y: 14 }, {
        autoAlpha: 1,
        y: 0,
        duration: compact ? 0.44 : 0.54,
        ease: "power2.out",
        clearProps: "transform,opacity,visibility"
      }, startAt + (compact ? 0.12 : 0.2));
    }
  });
}

export function SectionOrchestrator() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const groups = [
        { trigger: ".home-services", targets: ".home-service-list > a", y: 18, scale: 0.995, duration: 0.72 },
        { trigger: ".home-cases", targets: ".home-case-grid > a", y: 24, scale: 0.985, duration: 0.8 },
        { trigger: ".contact-section", targets: ".contact-section > *", y: 16, scale: 1, duration: 0.9 }
      ];

      groups.forEach((group) => {
        const trigger = document.querySelector(group.trigger);
        const targets = gsap.utils.toArray<HTMLElement>(group.targets);
        if (!trigger || targets.length === 0) return;

        gsap.fromTo(targets, {
          autoAlpha: 0.72,
          y: group.y,
          scale: group.scale,
        }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: group.duration,
          ease: "power2.out",
          stagger: 0.14,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: {
            trigger,
            start: "top 82%",
            once: true
          }
        });
      });

      animateLatestUpdates();

      const activeHeroDot = document.querySelector(".hero-dots button.is-active");
      if (activeHeroDot) {
        gsap.to(activeHeroDot, {
          scaleX: 1.22,
          duration: 4.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });
      }
    });

    return () => mm.revert();
  });

  return null;
}
