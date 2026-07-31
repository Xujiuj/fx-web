"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import type { FooterContent } from "@/lib/cms-content";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function SiteFooter({ footer }: { footer: FooterContent }) {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const element = footerRef.current;
    if (!element) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const children = Array.from(element.children) as HTMLElement[];
      gsap.set(children, { autoAlpha: 0 });
      gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 94%",
          once: true
        }
      }).fromTo(children, {
        autoAlpha: 0,
        y: 24,
        filter: "blur(4px)"
      }, {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility,filter"
      });
    });

    media.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(element, { clearProps: "all" });
    });

    element.dataset.motionReady = "true";
    return () => {
      media.revert();
      delete element.dataset.motionReady;
    };
  }, { scope: footerRef });

  return (
    <footer ref={footerRef} className="site-footer">
      <span>{footer.copyright}</span>
      <a href={footer.icpHref}>{footer.icpText}</a>
      <span>{footer.ipv6Text}</span>
    </footer>
  );
}
