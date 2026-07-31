"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const latestUpdateOrigins = [
  { x: -48, y: 16, clipPath: "inset(0% 100% 0% 0%)" },
  { x: 24, y: -32, clipPath: "inset(100% 0% 0% 0%)" },
  { x: -24, y: 32, clipPath: "inset(0% 0% 100% 0%)" },
  { x: 48, y: 16, clipPath: "inset(0% 0% 0% 100%)" }
];

const latestUpdateStartTimes = [0, 0.22, 0.3, 0.08];

function animateLatestUpdates() {
  const list = document.querySelector(".latest-updates-list");
  const cards = gsap.utils.toArray<HTMLElement>(".latest-update");
  if (!list || cards.length === 0) return;

  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: list,
      start: "top 88%",
      once: true
    }
  });

  cards.forEach((card, index) => {
    const desktopOrigin = latestUpdateOrigins[index % latestUpdateOrigins.length];
    const origin = isMobile ? {
      x: index % 2 === 0 ? -22 : 22,
      y: 26,
      clipPath: index % 2 === 0 ? "inset(0% 0% 14% 0%)" : "inset(14% 0% 0% 0%)"
    } : desktopOrigin;
    const startAt = isMobile ? index * 0.11 : latestUpdateStartTimes[index] ?? index * 0.12;
    const image = card.querySelector("img");
    const copy = card.querySelector<HTMLElement>(".latest-update-copy");

    timeline.fromTo(card, {
      autoAlpha: 0,
      x: origin.x,
      y: origin.y,
      scale: isMobile ? 1.01 : 1.025,
      clipPath: origin.clipPath
    }, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: 1,
      clipPath: "inset(0% 0% 0% 0%)",
      duration: isMobile ? 0.72 : 0.96,
      ease: "power3.out",
      clearProps: "transform,clipPath,opacity,visibility"
    }, startAt);

    if (image) {
      timeline.fromTo(image, {
        scale: isMobile ? 1.06 : 1.11
      }, {
        scale: 1,
        duration: isMobile ? 0.9 : 1.3,
        ease: "power2.out",
        clearProps: "transform"
      }, startAt);
    }

    if (copy) {
      timeline.fromTo(copy, {
        autoAlpha: 0,
        y: 20
      }, {
        autoAlpha: 1,
        y: 0,
        duration: isMobile ? 0.48 : 0.62,
        ease: "power2.out",
        clearProps: "transform,opacity,visibility"
      }, startAt + (isMobile ? 0.18 : 0.28));
    }
  });
}

export function SectionOrchestrator() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const groups = [
        { trigger: ".news-section", targets: ".news-card", y: 22, scale: 0.992, duration: 0.95 },
        { trigger: ".certificate-section", targets: ".certificate-card", y: 20, scale: 0.995, duration: 0.95 },
        { trigger: ".partner-section", targets: ".partner-logo", y: 10, scale: 0.998, duration: 0.95 },
        { trigger: ".thinking-section", targets: ".capability-node", y: 18, scale: 0.995, duration: 0.95 },
        { trigger: ".contact-section", targets: ".contact-section > *", y: 16, scale: 1, duration: 1.1 }
      ];

      groups.forEach((group) => {
        const trigger = document.querySelector(group.trigger);
        const targets = gsap.utils.toArray<HTMLElement>(group.targets);
        if (!trigger || targets.length === 0) return;

        gsap.from(targets, {
          autoAlpha: 0,
          y: group.y,
          scale: group.scale,
          duration: group.duration,
          ease: "power2.out",
          stagger: 0.14,
          scrollTrigger: {
            trigger,
            start: "top 82%",
            once: true
          }
        });
      });

      animateLatestUpdates();

      gsap.to(".hero-dots button.is-active", {
        scaleX: 1.22,
        duration: 4.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    });

    return () => mm.revert();
  });

  return null;
}
