"use client";

import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  DatabaseZap,
  Layers3,
  LineChart,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { homeEditorialContent, type HomeContent, type HomeEditorialContent, type IconKey } from "@/lib/cms-content";
import { AnimatedTimeline } from "./animated-timeline";
import { SiteFooter } from "./site-footer";

gsap.registerPlugin(useGSAP);

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
    <main data-motion-ready="true">
      <HeroCarousel slides={content.heroSlides} />
      <AnimatedTimeline
        eyebrow={homeEditorialContent.path.eyebrow}
        title={homeEditorialContent.path.title}
        description={homeEditorialContent.path.description}
        summary={homeEditorialContent.path.summary}
        timeline={content.timeline}
      />
      <DriversSection items={homeEditorialContent.drivers} />
      <ChallengesSection items={homeEditorialContent.challenges} />
      <ManagementPathSection items={homeEditorialContent.managementPath} />
      <ServicesSection items={homeEditorialContent.services} />
      <CasesSection items={homeEditorialContent.cases} />
      <LatestUpdatesSection title={content.sectionTitles.news} items={content.newsItems} />
      <BrandPositioningSection />
      <ContactSection contact={content.contact} />
      <SiteFooter footer={content.footer} />
    </main>
  );
}

function HeroCarousel({ slides }: { slides: HomeContent["heroSlides"] }) {
  const [selected, setSelected] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const slide = slides[selected];

  useGSAP(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const media = gsap.matchMedia();
    let activeDotTween: gsap.core.Tween | undefined;
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const query = gsap.utils.selector(hero);
      const copyItems = query<HTMLElement>(".hero-copy-eyebrow, .hero-copy-title, .hero-copy-body, .hero-copy-actions");
      const activeDot = query<HTMLElement>(".hero-dots button.is-active")[0];

      gsap.set(copyItems, { animation: "none", autoAlpha: 0 });
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline.fromTo(copyItems, {
        autoAlpha: 0,
        x: -28,
        y: 24,
        filter: "blur(7px)"
      }, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
        duration: 1.16,
        stagger: 0.2,
        clearProps: "transform,opacity,visibility,filter"
      });

      if (activeDot) {
        activeDotTween = gsap.to(activeDot, {
          scaleX: 1.24,
          duration: 4.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });
      }
    });

    return () => {
      activeDotTween?.kill();
      media.revert();
    };
  }, { scope: heroRef, dependencies: [selected], revertOnUpdate: true });

  if (!slide) return null;

  return (
    <section ref={heroRef} className="hero" id="home">
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

function DriversSection({ items }: { items: HomeEditorialContent["drivers"] }) {
  return (
    <section className="home-drivers" id="drivers">
      <div className="home-editorial-heading">
        <span>WHY CARBON MANAGEMENT</span>
        <h2>企业为什么需要碳管理？</h2>
      </div>
      <div className="home-driver-grid">
        {items.map((item, index) => <EditorialItem key={item.title} item={item} index={index} />)}
      </div>
    </section>
  );
}

function ChallengesSection({ items }: { items: HomeEditorialContent["challenges"] }) {
  return (
    <section className="home-challenges" id="challenges">
      <div className="home-challenge-intro">
        <span>CORE CHALLENGES</span>
        <h2>企业面临的核心挑战</h2>
        <p>当核算仍依赖分散表格与临时协作，数据很难成为持续管理的基础。</p>
      </div>
      <ol className="home-challenge-list">
        {items.map((item, index) => {
          const Icon = iconMap[item.icon] ?? BarChart3;
          return <li key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span><Icon size={22} aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.description}</p></div>
          </li>;
        })}
      </ol>
    </section>
  );
}

function ManagementPathSection({ items }: { items: HomeEditorialContent["managementPath"] }) {
  return (
    <section className="home-management-path" id="management-path">
      <div className="home-management-heading">
        <span>MANAGEMENT LOGIC</span>
        <h2>从核算走向碳管理</h2>
        <p>峰行智成总体思路</p>
      </div>
      <ol className="home-management-flow">
        {items.map((item, index) => {
          const Icon = iconMap[item.icon] ?? BarChart3;
          return <li key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span><Icon size={25} aria-hidden="true" /><h3>{item.title}</h3><p>{item.description}</p>{index < items.length - 1 ? <ArrowRight className="flow-arrow" size={19} aria-hidden="true" /> : null}
          </li>;
        })}
      </ol>
      <p className="home-management-summary">通过统一数据模型与数字化平台，推动企业从“一次性核算”走向“持续运营管理”。</p>
    </section>
  );
}

function ServicesSection({ items }: { items: HomeEditorialContent["services"] }) {
  return (
    <section className="home-services" id="solutions">
      <div className="home-editorial-heading"><span>WHAT WE PROVIDE</span><h2>我们提供什么</h2></div>
      <div className="home-service-list">
        {items.map((item, index) => {
          const Icon = iconMap[item.icon] ?? BarChart3;
          return <a href={item.href} key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><Icon size={27} aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.description}</p></div><ArrowRight size={19} aria-hidden="true" /></a>;
        })}
      </div>
    </section>
  );
}

function CasesSection({ items }: { items: HomeEditorialContent["cases"] }) {
  return (
    <section className="home-cases" id="cases">
      <div className="home-cases-heading"><span>CLIENT CASES</span><h2>客户案例</h2><Link href="/customer-cases">查看全部案例 <ArrowRight size={16} /></Link></div>
      <div className="home-case-grid">
        {items.map((item, index) => {
          const Icon = iconMap[item.icon] ?? BarChart3;
          return <Link href={item.href} key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><Icon size={24} aria-hidden="true" /><h3>{item.title}</h3><p>{item.description}</p><small>查看案例框架 <ArrowRight size={14} /></small></Link>;
        })}
      </div>
    </section>
  );
}

function LatestUpdatesSection({ title, items }: { title: string; items: HomeContent["newsItems"] }) {
  if (!items.length) return null;

  return (
    <section className="latest-updates-section" id="updates">
      <div className="latest-updates-inner">
        <div className="home-editorial-heading">
          <span>INSIGHTS</span>
          <h2>{title}</h2>
        </div>
        <div className="latest-updates-list">
          {items.map((item, index) => (
            <Link className={`latest-update latest-update-${index + 1}`} href={item.href} key={item.title}>
              <span className="latest-update-drawer" aria-hidden="true" />
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(max-width: 720px) calc(100vw - 36px), (max-width: 1100px) 50vw, 720px"
              />
              <span className="latest-update-shade" aria-hidden="true" />
              <div className="latest-update-copy">
                <span className="latest-update-meta">{item.action}</span>
                <h3>{item.title}</h3>
                <p>{item.subtitle ?? item.summary ?? item.action}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandPositioningSection() {
  return (
    <section className="home-positioning" aria-labelledby="home-positioning-title">
      <div className="home-positioning-inner">
        <header>
          <span>OUR POSITIONING</span>
          <h2 id="home-positioning-title">企业碳管理能力建设专家</h2>
        </header>
        <p>
          从培训赋能到咨询实施，从Excel工具到数字化平台，从温室气体核算到碳数据价值释放，帮助企业构建可持续运行的碳管理体系。
        </p>
      </div>
    </section>
  );
}

function EditorialItem({ item, index }: { item: HomeEditorialContent["drivers"][number]; index: number }) {
  const Icon = iconMap[item.icon] ?? BarChart3;
  return <article>
    <div><span>{String(index + 1).padStart(2, "0")}</span><Icon size={27} aria-hidden="true" /></div><h3>{item.title}</h3><p>{item.description}</p>
  </article>;
}

export function ContactSection({ contact, id = "contact" }: { contact: HomeContent["contact"]; id?: string }) {
  const [hasError, setHasError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const successDialogRef = useRef<HTMLDialogElement>(null);
  const phone = contact.description.match(/1\d{10}/)?.[0];
  const email = contact.description.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0];

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
    <section className="contact-section" id={id} data-motion-group="contact-form">
      <div className="contact-intro" data-motion-role="copy">
        <div className="contact-mark" aria-hidden="true"><Mail size={22} /></div>
        <span className="contact-kicker">CONSULTATION</span>
        <h2>{contact.title}</h2>
        <p>{contact.description}</p>
        {(phone || email) ? <div className="contact-channels" aria-label="联系渠道">
          {phone ? <a href={`tel:${phone}`}><Phone size={17} aria-hidden="true" /><span><small>业务咨询</small>{phone}</span></a> : null}
          {email ? <a href={`mailto:${email}`}><Mail size={17} aria-hidden="true" /><span><small>电子邮箱</small>{email}</span></a> : null}
        </div> : null}
      </div>
      <div className="contact-form-panel" data-motion-role="visual">
        <div className="contact-form-heading" data-motion-role="heading">
          <span>在线咨询</span>
          <p>填写基本信息，我们将尽快与您联系。</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="contact-field" data-motion-role="item">
            <label htmlFor="contact-name">联系人</label>
            <input id="contact-name" name="name" placeholder={contact.namePlaceholder} required />
          </div>
          <div className="contact-field" data-motion-role="item">
            <label htmlFor="contact-company">企业名称（选填）</label>
            <input id="contact-company" name="company" placeholder={contact.companyPlaceholder} />
          </div>
          <div className="contact-field" data-motion-role="item">
            <label htmlFor="contact-method">联系电话</label>
            <input id="contact-method" name="contact" placeholder={contact.contactPlaceholder} inputMode="tel" required />
          </div>
          <div className="contact-field" data-motion-role="item">
            <label htmlFor="contact-email">联系邮箱（选填）</label>
            <input id="contact-email" name="email" type="email" placeholder={contact.emailPlaceholder} />
          </div>
          <div className="contact-field contact-field-message" data-motion-role="item">
            <label htmlFor="contact-message">企业需求</label>
            <textarea id="contact-message" name="message" placeholder={contact.messagePlaceholder} required />
          </div>
          <button type="submit" disabled={submitting}>
            {contact.submitLabel}
            <Send size={15} />
          </button>
          {hasError ? <p className="form-state">{contact.errorLabel}</p> : null}
        </form>
      </div>
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
