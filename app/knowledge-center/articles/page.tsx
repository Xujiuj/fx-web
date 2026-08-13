import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHomeContent, getKnowledgeEntries } from "@/lib/cms-content";
import styles from "./articles.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "双碳专栏 - 峰行智成资料中心",
  description: "双碳政策、企业碳管理方法与实践文章列表。",
};

export default async function KnowledgeArticlesPage() {
  const [home, entries] = await Promise.all([getHomeContent(), getKnowledgeEntries()]);
  const articles = entries.filter((entry) => entry.type === "article");

  return <>
    <SiteHeader content={home} />
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.wrap}>
          <Link href="/knowledge-center"><ArrowLeft size={16} aria-hidden="true" />返回资料中心</Link>
          <span>DOUBLE CARBON COLUMN</span>
          <h1>双碳专栏</h1>
          <p>持续整理双碳政策、核算方法与企业碳管理实践。</p>
        </div>
      </header>
      <section className={`${styles.wrap} ${styles.list}`} aria-label="双碳专栏文章列表">
        {articles.map((article, index) => {
          const contents = <><span>{String(index + 1).padStart(2, "0")}</span><BookOpen size={21} aria-hidden="true" /><div><small>{article.category} · {article.meta}</small><h2>{article.title}</h2><p>{article.summary}</p></div><ArrowRight size={20} aria-hidden="true" /></>;
          return article.sourceHref
            ? <a href={article.sourceHref} target="_blank" rel="noreferrer" key={article.slug}>{contents}</a>
            : <Link href={`/knowledge-center/${article.slug}`} key={article.slug}>{contents}</Link>;
        })}
        {!articles.length ? <p className={styles.empty}>文章正在整理中。</p> : null}
      </section>
    </main>
    <SiteFooter footer={home.footer} />
  </>;
}
