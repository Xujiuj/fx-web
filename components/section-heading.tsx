"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function SectionHeading({
  eyebrow,
  title
}: {
  eyebrow?: string;
  title: string;
}) {
  const headingRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const element = headingRef.current;
    if (!element) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(element, {
        autoAlpha: 0,
        y: 18,
        duration: 1.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true
        }
      });
    });

    return () => media.revert();
  }, { scope: headingRef });

  return (
    <div
      ref={headingRef}
      className="section-heading"
    >
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h2>{title}</h2>
    </div>
  );
}
