"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function SectionOrchestrator() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const groups = [
        { trigger: ".news-section", targets: ".news-card", y: 22, scale: 0.992, duration: 0.95 },
        { trigger: ".latest-updates-section", targets: ".latest-update", y: 20, scale: 0.998, duration: 0.95 },
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
