import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHomeContent, getKnowledgeEntries } from "@/lib/cms-content";
import { filterArticlesByCategory, getArticleCategories, getKnowledgeMeta, paginateKnowledgeEntries } from "@/lib/knowledge-content";
import styles from "./articles.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "双碳专栏 - 峰行智成资源中心",
  description: "双碳政策、企业碳管理方法与实践文章列表。",
};

const articlePageSize = 10;

export default async function KnowledgeArticlesPage({ searchParams }: { searchParams: Promise<{ category?: string | string[]; page?: string | string[] }> }) {
  const query = await searchParams;
  const requestedCategory = query.category;
  const requestedPage = typeof query.page === "string" ? Number(query.page) : 1;
  const [home, entries] = await Promise.all([getHomeContent(), getKnowledgeEntries()]);
  const categories = getArticleCategories(entries);
  const category = typeof requestedCategory === "string" && categories.includes(requestedCategory) ? requestedCategory : undefined;
  const articles = filterArticlesByCategory(entries, category);
  const pagination = paginateKnowledgeEntries(articles, requestedPage, articlePageSize);
  const articleHref = (page: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (page > 1) params.set("page", String(page));
    const suffix = params.toString();
    return `/knowledge-center/articles${suffix ? `?${suffix}` : ""}`;
  };

  return <>
    <SiteHeader content={home} />
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.wrap}>
          <Link href="/knowledge-center"><ArrowLeft size={16} aria-hidden="true" />返回资源中心</Link>
          <span>DOUBLE CARBON COLUMN</span>
          <h1>双碳专栏</h1>
          <p>持续整理双碳政策、核算方法与企业碳管理实践。</p>
        </div>
      </header>
      <nav className={`${styles.wrap} ${styles.filters}`} aria-label="文章分类">
        <Link href="/knowledge-center/articles" className={!category ? styles.activeFilter : undefined} aria-current={!category ? "page" : undefined}>全部</Link>
        {categories.map((item) => (
          <Link href={`/knowledge-center/articles?category=${encodeURIComponent(item)}`} className={category === item ? styles.activeFilter : undefined} aria-current={category === item ? "page" : undefined} key={item}>{item}</Link>
        ))}
      </nav>
      <section className={`${styles.wrap} ${styles.list}`} aria-label="双碳专栏文章列表">
        {pagination.items.map((article, index) => {
          const number = (pagination.currentPage - 1) * pagination.pageSize + index + 1;
          const contents = <><span>{String(number).padStart(2, "0")}</span><BookOpen size={21} aria-hidden="true" /><div><small>{getKnowledgeMeta(article)}</small><h2>{article.title}</h2><p>{article.summary}</p></div><ArrowRight size={20} aria-hidden="true" /></>;
          return article.sourceHref
            ? <a href={article.sourceHref} target="_blank" rel="noreferrer" key={article.slug}>{contents}</a>
            : <Link href={`/knowledge-center/${article.slug}`} key={article.slug}>{contents}</Link>;
        })}
        {!articles.length ? <p className={styles.empty}>该分类下暂无文章。</p> : null}
      </section>
      {pagination.totalPages > 1 ? (
        <nav className={`${styles.wrap} ${styles.pagination}`} aria-label="文章分页">
          <div>
            {pagination.currentPage > 1
              ? <Link href={articleHref(pagination.currentPage - 1)} aria-label="上一页"><ArrowLeft size={17} aria-hidden="true" />上一页</Link>
              : <span aria-disabled="true"><ArrowLeft size={17} aria-hidden="true" />上一页</span>}
            <ol>
              {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => (
                <li key={page}>
                  <Link href={articleHref(page)} aria-current={page === pagination.currentPage ? "page" : undefined}>{page}</Link>
                </li>
              ))}
            </ol>
            {pagination.currentPage < pagination.totalPages
              ? <Link href={articleHref(pagination.currentPage + 1)} aria-label="下一页">下一页<ArrowRight size={17} aria-hidden="true" /></Link>
              : <span aria-disabled="true">下一页<ArrowRight size={17} aria-hidden="true" /></span>}
          </div>
          <p>第 {pagination.currentPage} / {pagination.totalPages} 页 · 共 {pagination.totalItems} 篇</p>
        </nav>
      ) : null}
    </main>
    <SiteFooter footer={home.footer} />
  </>;
}
