import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ExternalLink, GraduationCap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHomeContent, getKnowledgeEntries, getKnowledgeEntry } from "@/lib/cms-content";
import { knowledgeEntries as defaultKnowledgeEntries } from "@/lib/knowledge-content";
import styles from "./knowledge-entry.module.css";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return defaultKnowledgeEntries.map((entry) => ({ entry: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ entry: string }> }) {
  const { entry: slug } = await params;
  const entry = await getKnowledgeEntry(slug);
  if (!entry) notFound();
  return { title: `${entry.title} - 峰行智成知识课堂`, description: entry.summary };
}

export default async function KnowledgeEntryPage({ params }: { params: Promise<{ entry: string }> }) {
  const { entry: slug } = await params;
  const entry = await getKnowledgeEntry(slug);
  if (!entry) notFound();
  const [home, knowledgeEntries] = await Promise.all([getHomeContent(), getKnowledgeEntries()]);
  const related = knowledgeEntries.filter((item) => item.type === entry.type && item.slug !== entry.slug).slice(0, 3);
  const EntryIcon = entry.type === "article" ? BookOpen : GraduationCap;

  return (
    <>
      <SiteHeader content={home} />
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <nav aria-label="面包屑">
              <Link href="/knowledge-center"><ArrowLeft size={15} aria-hidden="true" />返回知识课堂</Link>
            </nav>
            <div className={styles.category}><EntryIcon size={18} aria-hidden="true" />{entry.category}</div>
            <h1>{entry.title}</h1>
            <p>{entry.summary}</p>
            <span>{entry.meta}</span>
          </div>
        </header>

        <div className={styles.contentLayout}>
          <article className={styles.article}>
            {entry.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets?.length ? (
                  <ul>
                    {section.bullets.map((bullet) => <li key={bullet}><CheckCircle2 size={18} aria-hidden="true" />{bullet}</li>)}
                  </ul>
                ) : null}
              </section>
            ))}

            {entry.sourceHref ? (
              <aside className={styles.source}>
                <span>政策原文</span>
                <a href={entry.sourceHref} target="_blank" rel="noreferrer">{entry.sourceName}<ExternalLink size={16} aria-hidden="true" /></a>
              </aside>
            ) : (
              <aside className={styles.courseCta}>
                <div><span>COURSE ACCESS</span><strong>获取完整课程与企业内训安排</strong></div>
                <Link href="/#contact">联系课程顾问 <ArrowRight size={17} aria-hidden="true" /></Link>
              </aside>
            )}
          </article>

          <aside className={styles.related}>
            <span>{entry.type === "article" ? "相关文章" : "系列课程"}</span>
            {related.map((item, index) => (
              <Link href={`/knowledge-center/${item.slug}`} key={item.slug}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{item.title}</strong>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </aside>
        </div>
      </main>
      <SiteFooter footer={home.footer} />
    </>
  );
}
