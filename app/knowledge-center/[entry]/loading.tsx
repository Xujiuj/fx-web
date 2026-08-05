import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { defaultHomeContent } from "@/lib/cms-content";
import styles from "./knowledge-entry.module.css";

export default function KnowledgeEntryLoading() {
  return (
    <>
      <SiteHeader content={defaultHomeContent} />
      <main className={styles.page} aria-busy="true" aria-label="正在加载课程内容">
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.loadingLine} />
            <div className={styles.loadingTitle} />
            <div className={styles.loadingCopy} />
          </div>
        </header>
        <div className={styles.contentLayout}>
          <article className={styles.article}>
            <div className={styles.loadingVideo} />
            <div className={styles.loadingParagraph} />
            <div className={styles.loadingParagraph} />
          </article>
        </div>
      </main>
      <SiteFooter footer={defaultHomeContent.footer} />
    </>
  );
}
