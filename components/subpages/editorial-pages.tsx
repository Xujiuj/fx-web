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
import Link from "next/link";
import type { Subpage } from "@/lib/cms-content";
import { knowledgeEntries as defaultKnowledgeEntries, type KnowledgeEntry } from "@/lib/knowledge-content";
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

function ContactBand({ title }: { title: string }) {
  return (
    <section className={`${styles.contactBand} page-reveal`} aria-label="联系顾问" data-motion="cta">
      <div>
        <span>下一步</span>
        <strong>{title}</strong>
      </div>
      <Link href="/#contact">
        联系顾问
        <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </section>
  );
}

const caseIcons = [GraduationCap, FileSpreadsheet, Network, Library];
const caseIds = ["training-case", "excel-company-case", "excel-group-case", "platform-case"];
const caseStructure = ["项目背景", "面临问题", "建设内容", "实施过程", "建设成果", "客户价值"];
const caseDetails = [
  {
    background: "企业启动温室气体核算工作，需要先统一参与人员对标准、边界和方法的理解。",
    problem: "内部缺少专业人员，核算口径不一致，难以把标准要求落实到实际业务数据。",
    content: "开展核算方法、适用标准、Excel 实操和企业场景案例培训。",
    process: "需求访谈、课程设计、集中培训、实操演练、问题复盘。",
    result: "形成企业温室气体核算实操课程与后续工作清单。",
    value: "建立统一认知，培养内部人才，使团队具备独立开展核算的基础能力。",
  },
  {
    background: "单一法人企业准备完成首次温室气体核算，并形成可持续更新的数据台账。",
    problem: "数据来源分散，采集模板缺失，计算过程和成果复核依赖临时人工协作。",
    content: "梳理数据来源，部署 Excel 单公司版工具，配置边界、因子和计算规则。",
    process: "边界确认、数据采集、工具配置、实操辅导、过程校核、成果交付。",
    result: "形成企业温室气体核算报表、活动数据台账与工作底稿。",
    value: "完成首次核算闭环，并为核查、披露和后续年度更新建立标准基础。",
  },
  {
    background: "集团需要由成员企业独立维护数据，同时在集团层面统一汇总和复核。",
    problem: "各公司核算口径、数据模板和责任分工不同，集团汇总效率低且难以追溯。",
    content: "统一组织边界、数据模板和核算口径，部署单体核算与集团汇总模型。",
    process: "集团规则设计、成员企业部署、填报辅导、集中复核、集团成果汇总。",
    result: "形成企业温室气体核算报表（Excel 集团版）及统一工作规范。",
    value: "实现子公司独立核算、集团自动汇总，并持续支撑 ESG 披露。",
  },
  {
    background: "企业已有基础核算体系，希望将分散数据和年度核算工作转入统一平台。",
    problem: "数据分散存储、人工维护成本高，缺少自动化核算、多维分析和持续沉淀。",
    content: "搭建统一数据模型、核算引擎、分析体系与管理平台。",
    process: "业务蓝图、平台配置、数据初始化、试运行、用户培训、持续运营支持。",
    result: "交付企业碳管理数字化平台及配套数据、规则和运营机制。",
    value: "实现数据集中管理、自动化核算、多维分析决策和多场景价值释放。",
  },
];

export function CasesPage({ page }: EditorialPageProps) {
  const categories = page.sections.find((section) => section.id === "case-categories")?.items ?? [];
  return (
    <>
      <section className={styles.caseHero}>
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
        <h2 id="industry-intro-title" data-motion-role="heading">沿能力建设路径，查看不同阶段的项目实践</h2>
        <p data-motion-role="item">案例不使用未经确认的客户名称或量化成效。每类案例采用一致的信息结构，便于企业对照自身阶段判断建设重点。</p>
      </section>

      <section className={`${styles.wrap} ${styles.industryGrid}`} aria-label="行业场景" data-motion-group="case-grid">
        {categories.map((item, index) => {
          const Icon = caseIcons[index % caseIcons.length];
          const detail = caseDetails[index] ?? caseDetails[0];
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
                <div><dt>项目背景</dt><dd>{configuredDetail["项目背景"] ?? detail.background}</dd></div>
                <div><dt>面临问题</dt><dd>{configuredDetail["面临问题"] ?? detail.problem}</dd></div>
                <div><dt>建设内容</dt><dd>{configuredDetail["建设内容"] ?? detail.content}</dd></div>
                <div><dt>实施过程</dt><dd>{configuredDetail["实施过程"] ?? detail.process}</dd></div>
                <div><dt>建设成果</dt><dd>{configuredDetail["建设成果"] ?? detail.result}</dd></div>
                <div><dt>客户价值</dt><dd>{configuredDetail["客户价值"] ?? detail.value}</dd></div>
              </dl>
            </article>
          );
        })}
      </section>

      <section className={`${styles.caseScope} page-reveal`} aria-labelledby="case-scope-title" data-motion-group="case-path">
        <div className={styles.wrap}>
          <div className={styles.caseScopeHeading} data-motion-role="heading">
            <SectionLabel>统一结构</SectionLabel>
            <h2 id="case-scope-title">每个案例都回答六个关键问题</h2>
            <p>从项目为何启动，到如何实施、交付什么，以及最终为企业带来什么价值。</p>
          </div>
          <ol>
            {caseStructure.map((step, index) => (
              <li key={step} data-motion-role="item">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step}</strong>
                  <p>{index === 0 ? "说明企业所处阶段、业务背景与启动原因。" : index === 1 ? "识别数据、方法、组织协同或管理应用中的关键障碍。" : index === 2 ? "明确本次项目覆盖的服务范围与工作任务。" : index === 3 ? "呈现从准备、实施到交付的推进过程。" : index === 4 ? "说明形成的工具、体系、报告或平台成果。" : "归纳项目为企业能力建设带来的长期价值。"}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ContactBand title="从企业当前阶段出发，匹配相近的建设案例" />
    </>
  );
}

const knowledgeRoutes = [
  { href: "/#contact", action: "获取产品手册", icon: Library },
  { href: "/#contact", action: "获取解决方案", icon: GraduationCap },
  { href: "/#contact", action: "获取Excel核算工具", icon: FileSpreadsheet },
];

export function KnowledgePage({ page, knowledgeEntries = defaultKnowledgeEntries }: EditorialPageProps & { knowledgeEntries?: KnowledgeEntry[] }) {
  const downloads = page.sections.find((section) => section.id === "downloads")?.items ?? [];
  const policyArticles = knowledgeEntries.filter((entry) => entry.type === "article");
  const videoCourses = knowledgeEntries.filter((entry) => entry.type === "course");
  const featuredArticle = policyArticles[0];

  return (
    <>
      <section className={styles.knowledgeHero}>
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
            <h2 id="learning-path-title">循序进入企业碳管理</h2>
            <p>从入门方法到工具实战、集团体系与平台应用，逐步建立企业内部能力。</p>
          </div>
          <ol className={styles.learningPath}>
            {videoCourses.map((course, index) => {
              const contents = <><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{course.title}</strong><small>{course.summary}</small></div><i aria-hidden="true" /></>;
              return <li key={course.slug} data-motion-role="item">
                {course.videoHref ? <a href={course.videoHref} target="_blank" rel="noreferrer" aria-label={`播放${course.title}`}>{contents}</a> : <Link href={`/knowledge-center/${course.slug}`}>{contents}</Link>}
              </li>;
            })}
          </ol>
        </div>
      </section>

      <section id="downloads" className={`${styles.wrap} ${styles.resourceDesk} page-reveal`} aria-labelledby="resource-title" data-motion-group="resource-grid">
        <div className={styles.resourceIntro} data-motion-role="heading">
          <SectionLabel>资料下载</SectionLabel>
          <h2 id="resource-title">课程、工具与方案资料</h2>
          <p>获取产品手册、解决方案与Excel核算工具的当前有效版本。</p>
          <Link href="/#contact">
            <Download size={17} aria-hidden="true" />
            联系获取资料
          </Link>
        </div>
        <div className={styles.resourceLinks}>
          {knowledgeRoutes.map(({ href, action, icon: Icon }, index) => (
            <Link href={href} key={action} data-motion-role="item">
              <Icon size={22} aria-hidden="true" />
              <div>
                <span>{downloads[index]?.title ?? "学习资料"}</span>
                <strong>{action}</strong>
              </div>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <ContactBand title="为团队规划一条可执行的学习路径" />
    </>
  );
}

export function CompanyPage({ page }: EditorialPageProps) {
  const positioning = page.metrics[0];
  const mission = page.metrics[1];
  const vision = page.metrics[2];
  const introduction = page.sections.find((section) => section.id === "company-introduction")?.items[0];
  const capabilities = page.sections.find((section) => section.id === "core-capabilities")?.items ?? [];

  return (
    <>
      <section className={styles.companyHero}>
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
          <SectionLabel>COMPANY PROFILE</SectionLabel>
          <h2 id="company-belief-title">企业定位、使命与愿景</h2>
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
          <SectionLabel>ABOUT FENGXING</SectionLabel>
          <h2 id="company-introduction-title">{introduction?.title ?? "企业简介"}</h2>
        </div>
        <p className={styles.companyIntroduction} data-motion-role="item">{introduction?.description}</p>
      </section>

      <section className={`${styles.serviceBand} page-reveal`} aria-labelledby="service-capability-title" data-motion-group="company-grid">
        <div className={styles.wrap}>
          <div className={styles.serviceBandHeading} data-motion-role="heading">
            <SectionLabel>核心能力</SectionLabel>
            <h2 id="service-capability-title">从基础核算到长期运营</h2>
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

      <ContactBand title="与峰行智成讨论企业碳管理建设" />
    </>
  );
}
