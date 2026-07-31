"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function animateLatestUpdates() {
  const list = document.querySelector(".latest-updates-list");
  const cards = gsap.utils.toArray<HTMLElement>(".latest-update");
  if (!list || cards.length === 0) return;

  const compact = window.matchMedia("(max-width: 720px)").matches;
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: list, start: compact ? "top 94%" : "top 90%", once: true }
  });

  cards.forEach((card, index) => {
    const startAt = index * (compact ? 0.045 : 0.06);
    const image = card.querySelector("img");
    const copy = card.querySelector<HTMLElement>(".latest-update-copy");

    timeline.fromTo(card, {
      autoAlpha: 0,
      y: compact ? 14 : 18
    }, {
      autoAlpha: 1,
      y: 0,
      duration: compact ? 0.46 : 0.56,
      ease: "power3.out",
      clearProps: "transform,opacity,visibility"
    }, startAt);

    if (image) {
      timeline.fromTo(image, { scale: compact ? 1.015 : 1.025 }, {
        scale: 1,
        duration: compact ? 0.58 : 0.7,
        ease: "power2.out",
        clearProps: "transform"
      }, startAt);
    }

    if (copy) {
      timeline.fromTo(copy, { autoAlpha: 0, y: 8 }, {
        autoAlpha: 1,
        y: 0,
        duration: compact ? 0.38 : 0.44,
        ease: "power2.out",
        clearProps: "transform,opacity,visibility"
      }, startAt + 0.08);
    }
  });
}

export function SectionOrchestrator() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const groups = [
        { trigger: ".timeline-section", heading: ".timeline-section-heading", targets: ".timeline-horizontal > li, .timeline-summary" },
        { trigger: ".home-drivers", heading: ".home-drivers .home-editorial-heading", targets: ".home-driver-grid > article" },
        { trigger: ".home-challenges", heading: ".home-challenge-intro", targets: ".home-challenge-list > li" },
        { trigger: ".home-management-path", heading: ".home-management-heading", targets: ".home-management-flow > li, .home-management-summary" },
        { trigger: ".home-services", heading: ".home-services .home-editorial-heading", targets: ".home-service-list > a" },
        { trigger: ".home-cases", heading: ".home-cases-heading", targets: ".home-case-grid > a" },
        { trigger: ".home-positioning", heading: ".home-positioning header", targets: ".home-positioning p" },
        { trigger: ".contact-section", heading: ".contact-intro", targets: ".contact-form-panel" }
      ];

      groups.forEach((group) => {
        const trigger = document.querySelector(group.trigger);
        const heading = group.heading ? document.querySelector<HTMLElement>(group.heading) : null;
        const targets = gsap.utils.toArray<HTMLElement>(group.targets);
        if (!trigger || (!heading && targets.length === 0)) return;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger,
            start: "top 90%",
            once: true
          }
        });

        if (heading) {
          timeline.fromTo(heading, {
            autoAlpha: 0,
            y: 16
          }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility"
          });
        }

        if (targets.length) {
          timeline.fromTo(targets, {
            autoAlpha: 0,
            y: 18
          }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.56,
            ease: "power3.out",
            stagger: 0.055,
            clearProps: "transform,opacity,visibility"
          }, heading ? 0.1 : 0);
        }
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
