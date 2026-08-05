import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Home,
  Library,
  Network,
  Target,
  Waypoints,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Subpage, SubpageSection } from "@/lib/cms-content";
import { knowledgeEntries as defaultKnowledgeEntries, type KnowledgeEntry } from "@/lib/knowledge-content";
import { isAllowedContentHref, isManagedDocumentPath, isRuntimeManagedImage } from "@/lib/media-url";
import styles from "./editorial-pages.module.css";

type EditorialPageProps = { page: Subpage };

function Breadcrumb({ page }: EditorialPageProps) {
  return (
    <nav className={styles.breadcrumb} aria-label="面包屑">
      <Link href="/">
        <Home size={14} aria-hidden="true" />
        首页
      </Link>
      <span aria-hidden="true">/</span>
      <span>{page.navLabel}</span>
    </nav>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <p className={styles.sectionLabel}>{children}</p>;
}

function ContactBand({ title, section }: { title: string; section?: SubpageSection }) {
  const action = section?.items[0];
  return (
    <section className={`${styles.contactBand} page-reveal`} aria-label="联系顾问" data-motion="cta">
      <div>
        <span>{section?.description || "下一步"}</span>
        <strong>{section?.title || title}</strong>
      </div>
      <Link href={action?.value || "/#contact"}>
        {action?.title || "联系顾问"}
        <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </section>
  );
}

const caseIcons = [GraduationCap, FileSpreadsheet, Network, Library];
const caseIds = ["training-case", "excel-company-case", "excel-group-case", "platform-case"];
const caseDetailKeys = ["项目背景", "面临问题", "建设内容", "实施过程", "建设成果", "客户价值"] as const;

export function CasesPage({ page }: EditorialPageProps) {
  const categorySection = page.sections.find((section) => section.id === "case-categories");
  const introductionSection = page.sections.find((section) => section.id === "case-introduction");
  const structureSection = page.sections.find((section) => section.id === "case-structure");
  const ctaSection = page.sections.find((section) => section.id === "case-cta");
  const categories = categorySection?.items ?? [];
  const structureItems: SubpageSection["items"] = structureSection?.items.length
    ? structureSection.items
    : page.steps.map((title) => ({ title }));
  return (
    <>
      <section className={styles.caseHero}>
        <Image className={styles.heroImage} src={page.image} alt="" fill priority sizes="100vw" unoptimized={isRuntimeManagedImage(page.image)} />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={`${styles.wrap} ${styles.caseHeroInner}`}>
          <div className={`${styles.caseHeroCopy} page-reveal`} data-motion="hero-copy">
            <SectionLabel>客户案例</SectionLabel>
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
          </div>
          <div className={`${styles.caseHeroIndex} page-reveal`} aria-label="覆盖行业" data-motion="hero-visual">
            {categories.map((item, index) => (
              <div key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.title}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.industryIntroduction} page-reveal`} aria-labelledby="industry-intro-title" data-motion-group="section-introduction">
        <SectionLabel>分类展示</SectionLabel>
        <h2 id="industry-intro-title" data-motion-role="heading">{introductionSection?.title || categorySection?.title || page.title}</h2>
        {introductionSection?.description || categorySection?.description ? <p data-motion-role="item">{introductionSection?.description || categorySection?.description}</p> : null}
      </section>

      <section className={`${styles.wrap} ${styles.industryGrid}`} aria-label="行业场景" data-motion-group="case-grid">
        {categories.map((item, index) => {
          const Icon = caseIcons[index % caseIcons.length];
          const configuredDetail = item.details ?? {};
          return (
            <article className="page-reveal" id={caseIds[index]} key={item.title} data-motion-role="item">
              <div className={styles.industryCardTop}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon size={27} aria-hidden="true" />
              </div>
              <h2>{item.title}</h2>
              <p className={styles.caseLead}>{item.description}</p>
              <dl className={styles.caseDetailGrid}>
                {caseDetailKeys.map((key) => <div key={key}><dt>{key}</dt><dd>{configuredDetail[key]}</dd></div>)}
              </dl>
            </article>
          );
        })}
      </section>

      <section className={`${styles.caseScope} page-reveal`} aria-labelledby="case-scope-title" data-motion-group="case-path">
        <div className={styles.wrap}>
          <div className={styles.caseScopeHeading} data-motion-role="heading">
            <SectionLabel>统一结构</SectionLabel>
            <h2 id="case-scope-title">{structureSection?.title || categorySection?.title || page.title}</h2>
            {structureSection?.description ? <p>{structureSection.description}</p> : null}
          </div>
          <ol>
            {structureItems.map((step, index) => (
              <li key={step.title} data-motion-role="item">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step.title}</strong>
                  {step.description ? <p>{step.description}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ContactBand title={`咨询${page.navLabel}`} section={ctaSection} />
    </>
  );
}

const fallbackKnowledgeResources: SubpageSection["items"] = [
  { title: "产品手册" },
  { title: "解决方案" },
  { title: "Excel核算工具" },
];
const knowledgeResourceIcons = [Library, GraduationCap, FileSpreadsheet];

export function KnowledgePage({ page, knowledgeEntries = defaultKnowledgeEntries }: EditorialPageProps & { knowledgeEntries?: KnowledgeEntry[] }) {
  const videoCourseSection = page.sections.find((section) => section.id === "video-courses");
  const downloadSection = page.sections.find((section) => section.id === "downloads");
  const downloads = downloadSection?.items.length ? downloadSection.items : fallbackKnowledgeResources;
  const ctaSection = page.sections.find((section) => section.id === "knowledge-cta");
  const policyArticles = knowledgeEntries.filter((entry) => entry.type === "article");
  const videoCourses = knowledgeEntries.filter((entry) => entry.type === "course");
  const featuredArticle = policyArticles[0];

  return (
    <>
      <section className={styles.knowledgeHero}>
        <Image className={styles.heroImage} src={page.image} alt="" fill priority sizes="100vw" unoptimized={isRuntimeManagedImage(page.image)} />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={`${styles.wrap} ${styles.knowledgeHeroInner}`}>
          <div className={`${styles.knowledgeHeroTitle} page-reveal`} data-motion="hero-copy">
            <Breadcrumb page={page} />
            <SectionLabel>{page.eyebrow}</SectionLabel>
            <h1>{page.title}</h1>
          </div>
          <div className={`${styles.knowledgeHeroSummary} page-reveal`} data-motion="hero-visual">
            <BookOpen size={31} aria-hidden="true" />
            <p>{page.summary}</p>
          </div>
        </div>
      </section>

      <section id="double-carbon" className={`${styles.wrap} ${styles.knowledgeLead} page-reveal`} aria-labelledby="knowledge-featured-title" data-motion-group="knowledge-index">
        <article className={styles.featuredTopic} data-motion-role="item">
          <div><span>双碳专栏</span><small>{String(policyArticles.length).padStart(2, "0")} ARTICLES</small></div>
          <h2 id="knowledge-featured-title">{featuredArticle?.title ?? "双碳政策与实践"}</h2>
          <p>{featuredArticle?.summary ?? "知识内容正在整理中。"}</p>
          {featuredArticle ? featuredArticle.sourceHref ? (
            <a href={featuredArticle.sourceHref} target="_blank" rel="noreferrer">阅读公众号原文 <ArrowRight size={17} aria-hidden="true" /></a>
          ) : <Link href={`/knowledge-center/${featuredArticle.slug}`}>阅读全文 <ArrowRight size={17} aria-hidden="true" /></Link> : null}
        </article>
        <div className={styles.topicIndex} data-motion-role="visual">
          <header data-motion-role="copy">
            <span>政策文章</span>
            <small>{String(policyArticles.length).padStart(2, "0")} ARTICLES</small>
          </header>
          {policyArticles.map((article, index) => {
            const contents = <><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{article.title}</h3><small>{article.meta}</small></div><ArrowRight size={18} aria-hidden="true" /></>;
            return article.sourceHref ? (
              <a href={article.sourceHref} target="_blank" rel="noreferrer" key={article.slug} data-motion-role="item">{contents}</a>
            ) : <Link href={`/knowledge-center/${article.slug}`} key={article.slug} data-motion-role="item">{contents}</Link>;
          })}
        </div>
      </section>

      <section id="video-courses" className={`${styles.learningSection} page-reveal`} aria-labelledby="learning-path-title" data-motion-group="knowledge-path">
        <div className={styles.wrap}>
          <div className={styles.learningHeading} data-motion-role="heading">
            <SectionLabel>视频课程</SectionLabel>
            <h2 id="learning-path-title">{videoCourseSection?.title || "循序进入企业碳管理"}</h2>
            <p>{videoCourseSection?.description || "从入门方法到工具实战、集团体系与平台应用，逐步建立企业内部能力。"}</p>
          </div>
          <ol className={styles.learningPath}>
            {videoCourses.map((course, index) => (
              <li key={course.slug} data-motion-role="item">
                <Link href={`/knowledge-center/${course.slug}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{course.title}</strong><small>{course.summary}</small></div>
                  <i aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="downloads" className={`${styles.wrap} ${styles.resourceDesk} page-reveal`} aria-labelledby="resource-title" data-motion-group="resource-grid">
        <div className={styles.resourceIntro} data-motion-role="heading">
          <SectionLabel>资料下载</SectionLabel>
          <h2 id="resource-title">{downloadSection?.title || "课程、工具与方案资料"}</h2>
          <p>{downloadSection?.description || "获取产品手册、解决方案与Excel核算工具的当前有效版本。"}</p>
        </div>
        <div className={styles.resourceLinks}>
          {downloads.map((resource, index) => {
            const Icon = knowledgeResourceIcons[index % knowledgeResourceIcons.length];
            const href = isAllowedContentHref(resource.value) ? resource.value : undefined;
            const contents = <>
              <Icon size={22} aria-hidden="true" />
              <div>
                <span>{resource.title}</span>
                <strong>{href ? "立即下载" : "资料待发布"}</strong>
              </div>
              <ArrowRight size={17} aria-hidden="true" />
            </>;
            return (
              href ? <a href={href} key={`${resource.title}-${index}`} data-motion-role="item" download={isManagedDocumentPath(href) ? "" : undefined}>{contents}</a>
                : <div key={`${resource.title}-${index}`} className={styles.resourceUnavailable} data-motion-role="item" aria-disabled="true">{contents}</div>
            );
          })}
        </div>
      </section>

      <ContactBand title={`咨询${page.navLabel}`} section={ctaSection} />
    </>
  );
}

export function CompanyPage({ page }: EditorialPageProps) {
  const positioning = page.metrics[0];
  const mission = page.metrics[1];
  const vision = page.metrics[2];
  const beliefSection = page.sections.find((section) => section.id === "company-beliefs");
  const introductionSection = page.sections.find((section) => section.id === "company-introduction");
  const introduction = introductionSection?.items[0];
  const capabilitySection = page.sections.find((section) => section.id === "core-capabilities");
  const capabilities = capabilitySection?.items ?? [];
  const ctaSection = page.sections.find((section) => section.id === "company-cta");

  return (
    <>
      <section className={styles.companyHero}>
        <Image className={styles.heroImage} src={page.image} alt="" fill priority sizes="100vw" unoptimized={isRuntimeManagedImage(page.image)} />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={`${styles.wrap} ${styles.companyHeroInner}`}>
          <div className={`${styles.companyHeroTop} page-reveal`} data-motion="hero-copy">
            <Breadcrumb page={page} />
            <SectionLabel>{page.eyebrow}</SectionLabel>
          </div>
          <div className={`${styles.companyHeroStatement} page-reveal`} data-motion="hero-copy">
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
          </div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.companyBelief} page-reveal`} aria-labelledby="company-belief-title" data-motion-group="company-beliefs">
        <div className={styles.companyBeliefTitle} data-motion-role="heading">
          <SectionLabel>{beliefSection?.description || page.eyebrow}</SectionLabel>
          <h2 id="company-belief-title">{beliefSection?.title || page.navLabel}</h2>
        </div>
        <div className={styles.companyBeliefGrid}>
          <article data-motion-role="item">
            <Target size={27} aria-hidden="true" />
            <span>{positioning?.label ?? "企业定位"}</span>
            <strong>{positioning?.value ?? "企业碳管理数字化服务商"}</strong>
          </article>
          <article data-motion-role="item">
            <Waypoints size={27} aria-hidden="true" />
            <span>{mission?.label ?? "企业使命"}</span>
            <strong>{mission?.value ?? "以智慧驱动业务增长"}</strong>
          </article>
          <article data-motion-role="item">
            <CheckCircle2 size={27} aria-hidden="true" />
            <span>{vision?.label ?? "企业愿景"}</span>
            <strong>{vision?.value ?? "成为企业绿色低碳转型可信赖的长期合作伙伴"}</strong>
          </article>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.companyTimeline} page-reveal`} aria-labelledby="company-introduction-title" data-motion-group="company-path">
        <div className={styles.companyTimelineHeading} data-motion-role="heading">
          <SectionLabel>{introductionSection?.description || page.eyebrow}</SectionLabel>
          <h2 id="company-introduction-title">{introductionSection?.title || introduction?.title || page.navLabel}</h2>
        </div>
        <p className={styles.companyIntroduction} data-motion-role="item">{introduction?.description}</p>
      </section>

      <section className={`${styles.serviceBand} page-reveal`} aria-labelledby="service-capability-title" data-motion-group="company-grid">
        <div className={styles.wrap}>
          <div className={styles.serviceBandHeading} data-motion-role="heading">
            <SectionLabel>{capabilitySection?.title || page.navLabel}</SectionLabel>
            <h2 id="service-capability-title">{capabilitySection?.description || page.summary}</h2>
          </div>
          <div className={styles.serviceList}>
            {capabilities.map((feature, index) => (
              <article key={feature.title} data-motion-role="item">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <i aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContactBand title={`咨询${page.navLabel}`} section={ctaSection} />
    </>
  );
}
