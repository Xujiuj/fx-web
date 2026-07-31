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
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import type { HomeContent, IconKey } from "@/lib/cms-content";
import { AnimatedTimeline } from "./animated-timeline";
import { SectionHeading } from "./section-heading";
import { SectionOrchestrator } from "./section-orchestrator";
import { SiteFooter } from "./site-footer";

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

export function HomePage({ content }: { content: HomeContent }) {
  return (
    <main>
      <SectionOrchestrator />
      <HeroCarousel slides={content.heroSlides} />
      <AboutSection tabs={content.aboutTabs} />
      <AnimatedTimeline title={content.sectionTitles.timeline} timeline={content.timeline} />
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
      <SiteFooter footer={content.footer} />
    </main>
  );
}

function HeroCarousel({ slides }: { slides: HomeContent["heroSlides"] }) {
  const [selected, setSelected] = useState(0);
  const slide = slides[selected];

  if (!slide) return null;

  return (
    <section className="hero" id="home">
      <div className="hero-gradient" aria-hidden="true" />
      <div className="hero-fade-stage">
        <article className="hero-slide is-active" key={slide.title}>
          <div className="hero-copy" aria-live="polite">
            <p className="hero-copy-eyebrow">{slide.eyebrow}</p>
            <div className="hero-copy-title"><HeroTitle title={slide.title} /></div>
            <span className="hero-description hero-copy-body">{slide.description}</span>
            <div className="hero-actions hero-copy-actions">
              <Link className="outline-button" href={slide.href ?? "/#contact"}>
                {slide.cta}
                <ArrowRight size={16} />
              </Link>
              {slide.secondaryCta ? <Link className="hero-secondary-link" href={slide.secondaryHref ?? "/#contact"}>{slide.secondaryCta}</Link> : null}
            </div>
          </div>
        </article>
      </div>
      {slides.length > 1 ? <div className="hero-dots" aria-label="轮播导航">
        {slides.map((entry, index) => (
          <button
            key={entry.title}
            className={selected === index ? "is-active" : ""}
            onClick={() => setSelected(index)}
            aria-label={"切换到第 " + (index + 1) + " 张"}
            aria-current={selected === index ? "true" : undefined}
          />
        ))}
      </div> : null}
    </section>
  );
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
  const shouldReduceMotion = useReducedMotion();
  const activeTab = tabs.find((tab) => tab.value === activeValue) ?? tabs[0];

  if (!activeTab) return null;

  return (
    <section className="about-section" id="about">
      <Tabs.Root className="about-tabs" value={activeValue} onValueChange={setActiveValue}>
        <Tabs.List className="about-tab-list" aria-label="公司介绍">
          {tabs.map((tab) => (
            <Tabs.Trigger value={tab.value} key={tab.value} id={`about-tab-${tab.value}`}>
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <div className="about-content" role="tabpanel" aria-labelledby={`about-tab-${activeTab.value}`}>
          <AnimatePresence mode="wait">
            <motion.div
              className="about-panel"
              key={activeTab.value}
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -18, transition: { duration: 0.2 } }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="about-copy"
                initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="about-kicker">{activeTab.kicker}</p>
                <span className="about-rule" aria-hidden="true" />
                <h2>{activeTab.title}</h2>
                <p>{activeTab.body}</p>
              </motion.div>
              <motion.div
                className={`about-media about-diagram about-diagram-${activeTab.value}`}
                aria-label={activeTab.label}
                initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <strong>{activeTab.label}</strong>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs.Root>
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
            <a className={`latest-update latest-update-${index + 1}`} href={item.href} key={item.title}>
              <span className="latest-update-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div className="latest-update-copy">
                <h3>{item.title}</h3>
                <p>{item.subtitle ?? item.summary ?? item.action}</p>
              </div>
            </a>
          ))}
        </div>
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
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="thinking-section" id="capabilities">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <p>{text}</p>
      <div className="thinking-bubbles" aria-label="碳管理能力">
        {capabilities.map((item, index) => {
          return (
            <motion.div
              className={`thinking-bubble thinking-bubble-${index % 6}`}
              key={item.label}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.36, y: 26 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.55 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.58, delay: shouldReduceMotion ? 0 : index * 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <strong>{item.label}</strong>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function ContactSection({ contact }: { contact: HomeContent["contact"] }) {
  const [hasError, setHasError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const successDialogRef = useRef<HTMLDialogElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    setHasError(false);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      if (!response.ok) throw new Error("提交失败");
      form.reset();
      successDialogRef.current?.showModal();
    } catch {
      setHasError(true);
    } finally {
      setSubmitting(false);
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
        <div className="contact-field">
          <label htmlFor="contact-name">联系人</label>
          <input id="contact-name" name="name" placeholder={contact.namePlaceholder} required />
        </div>
        <div className="contact-field">
          <label htmlFor="contact-company">企业名称（选填）</label>
          <input id="contact-company" name="company" placeholder={contact.companyPlaceholder} />
        </div>
        <div className="contact-field">
          <label htmlFor="contact-method">手机号 / 微信号</label>
          <input id="contact-method" name="contact" placeholder={contact.contactPlaceholder} inputMode="tel" required />
        </div>
        <div className="contact-field">
          <label htmlFor="contact-email">联系邮箱</label>
          <input id="contact-email" name="email" type="email" placeholder={contact.emailPlaceholder} required />
        </div>
        <div className="contact-field">
          <label htmlFor="contact-message">咨询需求</label>
          <textarea id="contact-message" name="message" placeholder={contact.messagePlaceholder} required />
        </div>
        <button type="submit" disabled={submitting}>
          {contact.submitLabel}
          <Send size={15} />
        </button>
        {hasError ? <p className="form-state">{contact.errorLabel}</p> : null}
      </form>
      <dialog ref={successDialogRef} className="contact-success-dialog" aria-labelledby="contact-success-title">
        <div className="contact-success-dialog-content">
          <CheckCircle2 size={32} aria-hidden="true" />
          <h3 id="contact-success-title">已收到您的咨询</h3>
          <p>{contact.successLabel}</p>
          <button type="button" autoFocus onClick={() => successDialogRef.current?.close()}>知道了</button>
        </div>
      </dialog>
    </section>
  );
}
