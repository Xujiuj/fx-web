import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ExternalLink, GraduationCap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHomeContent, getKnowledgeEntries, getKnowledgeEntry } from "@/lib/cms-content";
import { courseVideoPlaceholderHref, knowledgeEntries as defaultKnowledgeEntries } from "@/lib/knowledge-content";
import { getManagedVideoStreamUrl } from "@/lib/media-url";
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
  const configuredVideoSrc = entry.type === "course"
    ? getManagedVideoStreamUrl(entry.videoHref) ?? entry.videoHref
    : undefined;
  const videoSrc = entry.type === "course" ? configuredVideoSrc || courseVideoPlaceholderHref : undefined;
  const usesVideoPlaceholder = entry.type === "course" && !configuredVideoSrc;

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
            {entry.type === "course" && videoSrc ? (
              <section className={styles.videoSection} aria-labelledby="course-video-title">
                <span>{usesVideoPlaceholder ? "COURSE PREVIEW" : "COURSE VIDEO"}</span>
                <h2 id="course-video-title">课程视频</h2>
                {usesVideoPlaceholder ? <p id="course-video-hint" className={styles.videoHint}>当前课程视频正在完善，暂以统一课程视频展示。</p> : null}
                <video controls playsInline preload="metadata" src={videoSrc} aria-describedby={usesVideoPlaceholder ? "course-video-hint" : undefined}>
                  您的浏览器暂不支持视频播放。
                </video>
              </section>
            ) : null}

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

            {entry.type === "article" && entry.sourceHref ? (
              <aside className={styles.source}>
                <span>政策原文</span>
                <a href={entry.sourceHref} target="_blank" rel="noreferrer">{entry.sourceName}<ExternalLink size={16} aria-hidden="true" /></a>
              </aside>
            ) : entry.type === "course" && !entry.videoHref ? (
              <aside className={styles.courseCta}>
                <div><span>COURSE ACCESS</span><strong>获取完整课程与企业内训安排</strong></div>
                <Link href="/#contact">联系课程顾问 <ArrowRight size={17} aria-hidden="true" /></Link>
              </aside>
            ) : null}
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
