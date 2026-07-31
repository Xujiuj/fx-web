import Image from "next/image";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactSection } from "@/components/home-page";
import { defaultHomeContent, type Subpage, type SubpageSection } from "@/lib/cms-content";
import styles from "./about-pages.module.css";

type AboutPageProps = { page: Subpage };

function AboutPageHero({ page }: AboutPageProps) {
  return (
    <section className={`${styles.hero} page-reveal`}>
      <div className={styles.heroShade} />
      <div className={styles.heroContent} data-motion="hero-copy">
        <p>{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className={styles.heroSummary}>{page.summary}</p>
      </div>
    </section>
  );
}

function getSection(page: Subpage, kind: SubpageSection["kind"], fallbackTitle: string): SubpageSection {
  return page.sections.find((section) => section.kind === kind) ?? {
    id: kind,
    kind,
    title: fallbackTitle,
    items: []
  };
}

export function HonorsPage({ page }: AboutPageProps) {
  const section = getSection(page, "gallery", "荣誉展示");

  return (
    <>
      <AboutPageHero page={page} />
      <section className={styles.content} aria-label={section.title} data-motion-group="about-grid">
        {section.items.length ? (
          <div className={styles.honorsGrid}>
            {section.items.map((item) => (
              <article className={`${styles.honorCard} page-reveal`} key={`${item.title}-${item.image ?? ""}`} data-motion-role="item">
                <h2>{item.title}</h2>
                {item.image ? <Image src={item.image} alt={item.title} width={560} height={680} sizes="(max-width: 720px) 100vw, (max-width: 1080px) 50vw, 33vw" /> : null}
                <p>{item.description ?? "相关信息将在确认后持续更新。"}</p>
              </article>
            ))}
          </div>
        ) : <p className={styles.emptyState}>荣誉信息正在持续更新。</p>}
      </section>
    </>
  );
}

export function PartnersPage({ page }: AboutPageProps) {
  const section = getSection(page, "gallery", "合作伙伴");

  return (
    <>
      <AboutPageHero page={page} />
      <section className={styles.content} aria-label={section.title} data-motion-group="about-grid">
        {section.items.length ? (
          <div className={styles.partnerGrid}>
            {section.items.map((item) => (
              <article className={`${styles.partnerCard} page-reveal`} key={`${item.title}-${item.image ?? ""}`} data-motion-role="item">
                {item.image ? <Image src={item.image} alt={item.title} width={320} height={160} sizes="(max-width: 720px) 42vw, 220px" /> : <strong>{item.title}</strong>}
              </article>
            ))}
          </div>
        ) : <p className={styles.emptyState}>合作伙伴信息正在持续更新。</p>}
      </section>
    </>
  );
}

export function ContactPage({ page }: AboutPageProps) {
  const section = getSection(page, "contacts", "联系信息");

  return (
    <>
      <AboutPageHero page={page} />
      <section className={styles.content} aria-label={section.title} data-motion-group="contact-grid">
        <div className={styles.contactLayout}>
          <div className={`${styles.contactLead} page-reveal`} data-motion-role="item">
            <span>LET&apos;S TALK</span>
            <h2>{page.summary}</h2>
            {section.description ? <p>{section.description}</p> : null}
          </div>
          <div className={styles.contactGrid}>
          {section.items.map((item) => {
            const isEmail = item.value?.includes("@");
            const isPhone = Boolean(item.value && /^\+?[\d\s-]{7,}$/.test(item.value));
            const href = item.value
              ? isEmail
                ? `mailto:${item.value}`
                : isPhone
                  ? `tel:${item.value.replace(/[^\d+]/g, "")}`
                  : undefined
              : undefined;
            const Icon = isEmail ? Mail : isPhone ? Phone : item.title.includes("地址") ? MapPin : MessageCircle;
            return (
              <article className={`${styles.contactCard} page-reveal`} key={`${item.title}-${item.value ?? ""}`} data-motion-role="item">
                <div className={styles.contactIcon} aria-hidden="true"><Icon size={21} /></div>
                <h3>{item.title}</h3>
                {href ? <a href={href}>{item.value}</a> : item.value ? <strong>{item.value}</strong> : null}
                {item.description ? <p>{item.description}</p> : null}
                {item.image ? <Image src={item.image} alt={`${item.title}二维码`} width={520} height={520} sizes="260px" /> : null}
              </article>
            );
          })}
          </div>
        </div>
      </section>
      <ContactSection contact={defaultHomeContent.contact} id="online-consultation" />
    </>
  );
}
