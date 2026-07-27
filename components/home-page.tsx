"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  DatabaseZap,
  Layers3,
  LineChart,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { HomeContent, IconKey } from "@/lib/cms-content";
import { AnimatedTimeline } from "./animated-timeline";
import { SectionHeading } from "./section-heading";
import { SectionOrchestrator } from "./section-orchestrator";

const iconMap = {
  chart: BarChart3,
  building: Building2,
  database: DatabaseZap,
  layers: Layers3,
  line: LineChart,
  shield: ShieldCheck,
  sparkles: Sparkles,
  workflow: Workflow,
  users: Building2
} satisfies Record<IconKey, typeof BarChart3>;

const aboutPresentation = {
  about: {
    label: "关于我们",
    kicker: "ABOUT US",
    layout: "text-only"
  },
  mission: {
    label: "公司理念",
    kicker: "OUR PHILOSOPHY",
    layout: "text-only"
  },
  vision: {
    label: "公司愿景",
    kicker: "COMPANY VISION",
    layout: "text-only"
  }
} as const;

export function HomePage({ content }: { content: HomeContent }) {
  return (
    <main>
      <SectionOrchestrator />
      <HeroCarousel slides={content.heroSlides} />
      <AboutSection tabs={content.aboutTabs} />
      <AnimatedTimeline title={content.sectionTitles.timeline} timeline={content.timeline} />
      <SolutionSection title={content.sectionTitles.solutions ?? "全阶段解决方案"} items={content.solutionItems} />
      <LatestUpdatesSection title={content.sectionTitles.news} items={content.newsItems} />
      <ProductSection title={content.sectionTitles.products} products={content.products} />
      <CertificateSection title={content.sectionTitles.certificates} images={content.certificateImages} />
      <PartnerSection title={content.sectionTitles.partners} partners={content.partners} />
      <ThinkingSection
        eyebrow={content.sectionTitles.thinkingEyebrow}
        title={content.sectionTitles.thinkingTitle}
        text={content.thinkingText}
        capabilities={content.capabilities}
      />
      <ContactSection contact={content.contact} />
      <Footer footer={content.footer} />
    </main>
  );
}

function HeroCarousel({ slides }: { slides: HomeContent["heroSlides"] }) {
  const [selected, setSelected] = useState(0);
  const [copyIndex, setCopyIndex] = useState<number | null>(0);
  const [copyExiting, setCopyExiting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const exitTimer = useRef<number | null>(null);
  const transitionTimer = useRef<number | null>(null);

  const clearTransitionTimers = useCallback(() => {
    if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    exitTimer.current = null;
    transitionTimer.current = null;
  }, []);

  const selectSlide = useCallback((nextIndex: number) => {
    if (nextIndex === selected || transitioning) return;

    clearTransitionTimers();
    if (reducedMotion) {
      setSelected(nextIndex);
      setCopyIndex(nextIndex);
      setCopyExiting(false);
      return;
    }

    setSelected(nextIndex);
    setCopyExiting(true);
    setTransitioning(true);
    exitTimer.current = window.setTimeout(() => setCopyIndex(null), 320);
    transitionTimer.current = window.setTimeout(() => {
      setCopyIndex(nextIndex);
      setCopyExiting(false);
      setTransitioning(false);
    }, 2000);
  }, [clearTransitionTimers, reducedMotion, selected, transitioning]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      setReducedMotion(media.matches);
      if (media.matches) {
        clearTransitionTimers();
        setCopyIndex(selected);
        setCopyExiting(false);
        setTransitioning(false);
      }
    };

    syncPreference();
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, [clearTransitionTimers, selected]);

  useEffect(() => {
    if (slides.length < 2 || reducedMotion || transitioning) return;
    const timer = window.setTimeout(
      () => selectSlide((selected + 1) % slides.length),
      12000
    );
    return () => window.clearTimeout(timer);
  }, [reducedMotion, selectSlide, selected, slides.length, transitioning]);

  useEffect(() => () => clearTransitionTimers(), [clearTransitionTimers]);

  useEffect(() => {
    if (!firstImageLoaded || slides.length < 2) return;
    const nextSlide = slides[(selected + 1) % slides.length];
    const source = heroMediaSource(nextSlide.image, 1280, "avif") ?? nextSlide.image;
    const prefetch = new window.Image();
    prefetch.decoding = "async";
    prefetch.src = source;
  }, [firstImageLoaded, selected, slides]);

  if (!slides[selected]) return null;

  return (
    <section className="hero" id="home">
      <div className="hero-fade-stage">
        {slides.map((slide, index) => (
          <article
            className={index === selected ? "hero-slide is-active" : "hero-slide"}
            key={slide.title}
            aria-hidden={index !== selected}
          >
            <ResponsiveHeroImage
              src={slide.image}
              priority={index === 0}
              onLoad={index === 0 ? () => setFirstImageLoaded(true) : undefined}
            />
            {copyIndex === index ? (
              <div className={copyExiting ? "hero-copy is-exiting" : "hero-copy"} aria-live="polite">
                <p className="hero-copy-eyebrow">{slide.eyebrow}</p>
                <div className="hero-copy-title"><HeroTitle title={slide.title} /></div>
                <span className="hero-description hero-copy-body">{slide.description}</span>
                <div className="hero-actions hero-copy-actions">
                  <Link className="outline-button" href={index === 0 ? "/solution-standard" : "/#contact"}>
                    {slide.cta}
                    <ArrowRight size={16} />
                  </Link>
                  {index === 0 ? <Link className="hero-secondary-link" href="/#contact">预约产品演示</Link> : null}
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <div className="hero-dots" aria-label="轮播导航">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            className={selected === index ? "is-active" : ""}
            onClick={() => selectSlide(index)}
            aria-label={"切换到第 " + (index + 1) + " 张"}
            aria-current={selected === index ? "true" : undefined}
            disabled={transitioning}
          />
        ))}
      </div>
    </section>
  );
}

type HeroMedia = { key: string; width: number; height: number; widths: number[] };

const heroMedia: Record<string, HeroMedia> = {
  "/media/fengxing-hero-accounting.png": { key: "fengxing-hero-accounting", width: 1672, height: 941, widths: [480, 768, 1280, 1672] },
  "/media/fengxing-hero-management.png": { key: "fengxing-hero-management", width: 1672, height: 941, widths: [480, 768, 1280, 1672] }
};

function heroMediaSource(src: string, width: number, format: "avif" | "webp" | "jpg") {
  const media = heroMedia[src];
  if (!media) return null;
  return `/media/optimized/${media.key}/${media.key}-${width}.${format}`;
}

function heroSrcSet(media: HeroMedia, format: "avif" | "webp" | "jpg") {
  return media.widths
    .map((width) => `${heroMediaSource(`/media/${media.key}.png`, width, format)} ${width}w`)
    .join(", ");
}

function ResponsiveHeroImage({ src, priority, onLoad }: { src: string; priority: boolean; onLoad?: () => void }) {
  const media = heroMedia[src];

  /* Native picture sources are required here for AVIF/WebP fallback and explicit preload priority. */
  /* eslint-disable @next/next/no-img-element */
  if (!media) {
    return <img className="hero-bg" src={src} alt="" loading={priority ? "eager" : "lazy"} decoding="async" onLoad={onLoad} />;
  }

  return (
    <picture className="hero-picture">
      <source type="image/avif" srcSet={heroSrcSet(media, "avif")} sizes="100vw" />
      <source type="image/webp" srcSet={heroSrcSet(media, "webp")} sizes="100vw" />
      <img
        className="hero-bg"
        src={heroMediaSource(src, media.width, "jpg") ?? src}
        srcSet={heroSrcSet(media, "jpg")}
        sizes="100vw"
        width={media.width}
        height={media.height}
        alt=""
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={onLoad}
      />
    </picture>
  );
  /* eslint-enable @next/next/no-img-element */
}

function HeroTitle({ title }: { title: string }) {
  const brandClaim = "让碳数据从“算得出”走向“管得好、用得上、可价值化”";

  if (title !== brandClaim) return <h1>{title}</h1>;

  return (
    <h1 aria-label={title}>
      <span className="hero-title-row">
        让碳数据从<span className="hero-title-phrase">“算得出”</span>
      </span>
      <span className="hero-title-row">
        走向“<span className="hero-title-phrase">管得好、</span>
        <span className="hero-title-phrase">用得上、</span>
        <span className="hero-title-phrase">可价值化”</span>
      </span>
    </h1>
  );
}

function AboutSection({ tabs }: { tabs: HomeContent["aboutTabs"] }) {
  const [activeValue, setActiveValue] = useState(tabs[0]?.value ?? "about");
  const activeTab = tabs.find((tab) => tab.value === activeValue) ?? tabs[0];

  if (!activeTab) return null;

  const presentation = aboutPresentation[activeTab.value as keyof typeof aboutPresentation] ?? {
    label: activeTab.label,
    kicker: activeTab.kicker,
    layout: "text-only" as const
  };

  const copyInitial = { opacity: 0, y: 20 };

  return (
    <section className="about-section" id="about">
      <Tabs.Root className="about-tabs" value={activeValue} onValueChange={setActiveValue}>
        <Tabs.List className="about-tab-list" aria-label="公司介绍">
          {tabs.map((tab) => (
            <Tabs.Trigger value={tab.value} key={tab.value} id={`about-tab-${tab.value}`}>
              {aboutPresentation[tab.value as keyof typeof aboutPresentation]?.label ?? tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <div className="about-content" role="tabpanel" aria-labelledby={`about-tab-${activeTab.value}`}>
          <AnimatePresence mode="popLayout">
            <motion.div
              className={`about-panel ${presentation.layout}`}
              key={activeTab.value}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="about-copy"
                initial={copyInitial}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.98, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="kicker">{presentation.kicker}</p>
                <span className="about-rule" aria-hidden="true" />
                <h2>{activeTab.title}</h2>
                <p>{activeTab.body}</p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs.Root>
    </section>
  );
}

function SolutionSection({ title, items }: { title: string; items: HomeContent["solutionItems"] }) {
  return (
    <section className="news-section" id="solutions">
      <div className="news-section-inner">
        <SectionHeading title={title} />
        <div className="news-grid">
          {items.map((item, index) => (
            <a
              className={"news-card news-card-" + (index + 1)}
              href={item.href}
              key={item.title}
            >
              <span>{item.action}</span>
              <h3>{item.title}</h3>
              <small>查看方案 <ArrowRight size={14} /></small>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestUpdatesSection({ title, items }: { title: string; items: HomeContent["newsItems"] }) {
  return (
    <section className="latest-updates-section" id="updates">
      <div className="latest-updates-inner">
        <SectionHeading title={title} />
        <div className="latest-updates-list">
          {items.map((item, index) => (
            <a className="latest-update" href={item.href} key={item.title}>
              <span className="latest-update-index">0{index + 1}</span>
              <div>
                <p>{item.action}</p>
                <h3>{item.title}</h3>
                {item.summary ? <span>{item.summary}</span> : null}
              </div>
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          ))}
        </div>
        <Link className="latest-updates-more" href="/knowledge-center">
          查看全部动态 <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

function ProductSection({ title, products }: { title: string; products: HomeContent["products"] }) {
  const [productEmblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    breakpoints: { "(min-width: 721px)": { active: false } }
  });

  return (
    <section className="product-section" id="products">
      <SectionHeading title={title} />
      <div className="product-carousel" ref={productEmblaRef}>
        <div className="product-band">
          {products.map((product, index) => {
            const Icon = iconMap[product.icon] ?? BarChart3;
            return (
              <motion.a
                className="product-card"
                href={product.href}
                key={product.name}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.62, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Icon size={42} />
                <h3>{product.name}</h3>
                <p>{product.summary}</p>
                <span className="product-card-action">
                  了解更多
                  <ArrowRight size={15} />
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CertificateSection({ title, images }: { title: string; images: string[] }) {
  const configuredImages = images.filter(Boolean);
  const [emblaRef] = useEmblaCarousel({ align: "center", loop: true }, [
    Autoplay({ delay: 9000, stopOnInteraction: false })
  ]);

  return (
    <section className="certificate-section">
      <SectionHeading title={title} />
      <div className="certificate-carousel" ref={emblaRef}>
        {configuredImages.length ? (
          <div className="certificate-track">
            {configuredImages.map((src) => (
              <motion.figure className="certificate-card" key={src} whileHover={{ y: -8, rotate: -0.5 }}>
                <Image src={src} alt="企业荣誉证书" width={210} height={300} loading="lazy" />
              </motion.figure>
            ))}
          </div>
        ) : <div className="certificate-empty" aria-hidden="true" />}
      </div>
    </section>
  );
}

function PartnerSection({ title, partners }: { title: string; partners: HomeContent["partners"] }) {
  return (
    <section className="partner-section" id="partners">
      <SectionHeading title={title} />
      <div className="partner-grid">
        {partners.map((partner, index) => (
          <motion.div
            className="partner-logo"
            key={partner.name + "-" + index}
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.06 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: index * 0.015 }}
          >
            {partner.logo ? <Image src={partner.logo} alt={partner.name} width={180} height={72} /> : partner.name}
          </motion.div>
        ))}
        {!partners.length ? <div className="partner-empty" aria-hidden="true" /> : null}
      </div>
    </section>
  );
}

function ThinkingSection({ eyebrow, title, text, capabilities }: { eyebrow: string; title: string; text: string; capabilities: HomeContent["capabilities"] }) {
  return (
    <section className="thinking-section" id="capabilities">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <p>{text}</p>
      <div className="capability-framework page-reveal">
        <div className="capability-stage-line" aria-label="碳管理能力进阶路径">
          <span>核算基础</span>
          <ArrowRight aria-hidden="true" size={18} />
          <span>数据治理</span>
          <ArrowRight aria-hidden="true" size={18} />
          <span>管理决策</span>
        </div>
        <div className="capability-grid">
        {capabilities.map((item, index) => {
          const Icon = iconMap[item.icon] ?? Sparkles;
          return (
            <article
              className="capability-node"
              key={item.label}
            >
              <span className="capability-index">0{index + 1}</span>
              <Icon size={22} />
              <strong>{item.label}</strong>
            </article>
          );
        })}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ contact }: { contact: HomeContent["contact"] }) {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData))
    });

    if (response.ok) {
      setStatus("sent");
      form.reset();
    } else {
      setStatus("error");
    }
  }

  return (
    <section className="contact-section" id="contact">
      <div>
        <Mail size={28} />
        <h2>{contact.title}</h2>
        <p>{contact.description}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder={contact.namePlaceholder} required />
        <input name="company" placeholder={contact.companyPlaceholder} />
        <input name="email" type="email" placeholder={contact.emailPlaceholder} required />
        <textarea name="message" placeholder={contact.messagePlaceholder} required />
        <button type="submit">
          {contact.submitLabel}
          <Send size={15} />
        </button>
        {status === "sent" ? (
          <p className="form-state success">
            <CheckCircle2 size={15} />
            {contact.successLabel}
          </p>
        ) : null}
        {status === "error" ? <p className="form-state">{contact.errorLabel}</p> : null}
      </form>
    </section>
  );
}

function Footer({ footer }: { footer: HomeContent["footer"] }) {
  return (
    <footer className="site-footer">
      <span>{footer.copyright}</span>
      <a href={footer.icpHref}>{footer.icpText}</a>
      <span>{footer.ipv6Text}</span>
    </footer>
  );
}
