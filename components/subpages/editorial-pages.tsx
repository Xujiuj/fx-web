import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Compass,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Home,
  Library,
  Network,
  ShieldCheck,
  Target,
  Waypoints,
} from "lucide-react";
import Link from "next/link";
import type { Subpage } from "@/lib/cms-content";
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
    <section className={`${styles.contactBand} page-reveal`} aria-label="联系顾问">
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

const caseNotes = [
  "先统一核算方法与组织认知，再进入数据实践。",
  "以首次核算为主线，让数据采集、校核与结果输出形成闭环。",
  "面向多法人组织统一数据结构、核算口径与汇总方式。",
  "把一次核算沉淀为可持续运行、可追溯的数据体系。",
];

export function CasesPage({ page }: EditorialPageProps) {
  return (
    <>
      <section className={styles.caseHero}>
        <div className={`${styles.wrap} ${styles.caseHeroInner}`}>
          <div className={`${styles.caseHeroCopy} page-reveal`}>
            <Breadcrumb page={page} />
            <SectionLabel>{page.eyebrow}</SectionLabel>
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
          </div>
          <div className={`${styles.caseCompass} page-reveal`} aria-hidden="true">
            <div className={styles.compassAxis} />
            <span className={styles.compassStart}>识别阶段</span>
            <span className={styles.compassBuild}>建设能力</span>
            <span className={styles.compassRun}>持续运营</span>
            <Compass size={48} />
          </div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.caseIntroduction} page-reveal`} aria-labelledby="case-intro-title">
        <SectionLabel>DELIVERY ARCHIVE</SectionLabel>
        <h2 id="case-intro-title">四类交付路径，对应企业不同能力阶段</h2>
        <p>以下内容按建设方式组织，不使用未经确认的客户名称或成效数字。企业可从当前问题出发，找到更接近自身现状的实践路径。</p>
      </section>

      <section className={`${styles.wrap} ${styles.caseArchive}`} aria-label="交付案例分类">
        {page.features.map((feature, index) => (
          <article className={`${styles.caseRecord} page-reveal`} key={feature}>
            <div className={styles.caseRecordIndex} aria-hidden="true">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <i />
            </div>
            <div className={styles.caseRecordHeading}>
              <small>交付类型</small>
              <h2>{feature}</h2>
            </div>
            <div className={styles.caseRecordBody}>
              <div>
                <span>实施主线</span>
                <strong>{page.steps[index] ?? "围绕实际业务问题形成建设路径"}</strong>
              </div>
              <p>{caseNotes[index] ?? "从实际问题出发，形成企业可持续使用的管理能力。"}</p>
              <Link href={index === 0 ? "/solution-standard" : index === 1 ? "/solution-practical" : index === 2 ? "/solution-consulting" : "/solution-platform"}>
                查看对应方案
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className={`${styles.caseDecision} page-reveal`} aria-labelledby="case-decision-title">
        <div className={styles.wrap}>
          <div className={styles.caseDecisionTitle}>
            <SectionLabel>HOW TO READ</SectionLabel>
            <h2 id="case-decision-title">从问题到价值，按同一套维度判断</h2>
          </div>
          <div className={styles.caseDecisionSteps}>
            {page.steps.map((step, index) => (
              <div key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactBand title="从企业当前阶段开始匹配建设路径" />
    </>
  );
}

const knowledgeRoutes = [
  { href: "/solution-standard", action: "查看培训方案", icon: GraduationCap },
  { href: "/excel-accounting-tool", action: "查看核算工具", icon: FileSpreadsheet },
  { href: "/carbon-management-platform", action: "查看数字化平台", icon: Library },
];

export function KnowledgePage({ page }: EditorialPageProps) {
  const [featured, ...topics] = page.features;

  return (
    <>
      <section className={styles.knowledgeHero}>
        <div className={`${styles.wrap} ${styles.knowledgeHeroInner}`}>
          <div className={`${styles.knowledgeHeroTitle} page-reveal`}>
            <Breadcrumb page={page} />
            <SectionLabel>{page.eyebrow}</SectionLabel>
            <h1>{page.title}</h1>
          </div>
          <div className={`${styles.knowledgeHeroSummary} page-reveal`}>
            <BookOpen size={31} aria-hidden="true" />
            <p>{page.summary}</p>
          </div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.knowledgeLead} page-reveal`} aria-labelledby="knowledge-featured-title">
        <article className={styles.featuredTopic}>
          <div>
            <span>本期重点</span>
            <small>FEATURED 01</small>
          </div>
          <h2 id="knowledge-featured-title">{featured ?? "企业碳管理知识"}</h2>
          <p>从政策背景进入企业实际工作，理解核算边界、数据口径与管理要求之间的关系。</p>
          <Link href="/solution-standard">
            从基础课程开始
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </article>
        <div className={styles.topicIndex}>
          <header>
            <span>内容索引</span>
            <small>{String(topics.length).padStart(2, "0")} TOPICS</small>
          </header>
          {topics.map((topic, index) => (
            <article key={topic}>
              <span>{String(index + 2).padStart(2, "0")}</span>
              <h3>{topic}</h3>
              <BookOpen size={18} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.learningSection} page-reveal`} aria-labelledby="learning-path-title">
        <div className={styles.wrap}>
          <div className={styles.learningHeading}>
            <SectionLabel>LEARNING PATH</SectionLabel>
            <h2 id="learning-path-title">循序进入企业碳管理</h2>
            <p>按照阅读、学习、查阅和使用的顺序，逐步把知识转化为企业内部能力。</p>
          </div>
          <ol className={styles.learningPath}>
            {page.steps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
                <i aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.resourceDesk} page-reveal`} aria-labelledby="resource-title">
        <div className={styles.resourceIntro}>
          <SectionLabel>RESOURCE DESK</SectionLabel>
          <h2 id="resource-title">课程、工具与方案资料</h2>
          <p>根据工作任务进入对应内容；需正式资料时，可联系顾问获取当前有效版本。</p>
          <Link href="/#contact">
            <Download size={17} aria-hidden="true" />
            联系获取资料
          </Link>
        </div>
        <div className={styles.resourceLinks}>
          {knowledgeRoutes.map(({ href, action, icon: Icon }, index) => (
            <Link href={href} key={href}>
              <Icon size={22} aria-hidden="true" />
              <div>
                <span>{page.steps[index + 1] ?? page.steps[index] ?? "学习资料"}</span>
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
  const mission = page.metrics[0];
  const positioning = page.metrics[1];
  const serviceMode = page.metrics[2];

  return (
    <>
      <section className={styles.companyHero}>
        <div className={`${styles.wrap} ${styles.companyHeroInner}`}>
          <div className={`${styles.companyHeroTop} page-reveal`}>
            <Breadcrumb page={page} />
            <SectionLabel>{page.eyebrow}</SectionLabel>
          </div>
          <div className={`${styles.companyHeroStatement} page-reveal`}>
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
          </div>
          <div className={`${styles.companyPrinciples} page-reveal`}>
            {page.metrics.map((metric) => (
              <div key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.companyBelief} page-reveal`} aria-labelledby="company-belief-title">
        <div className={styles.companyBeliefTitle}>
          <SectionLabel>OUR DIRECTION</SectionLabel>
          <h2 id="company-belief-title">让碳管理成为企业可持续使用的业务能力</h2>
        </div>
        <div className={styles.companyBeliefGrid}>
          <article>
            <Target size={27} aria-hidden="true" />
            <span>{mission?.label ?? "企业使命"}</span>
            <strong>{mission?.value ?? "智慧驱动"}</strong>
            <p>以清晰的方法、可靠的数据与适用的工具，支持企业建立长期能力。</p>
          </article>
          <article>
            <Waypoints size={27} aria-hidden="true" />
            <span>{positioning?.label ?? "能力定位"}</span>
            <strong>{positioning?.value ?? "碳管理"}</strong>
            <p>连接核算、咨询、数字化建设与持续运营，让工作成果能够复用和追溯。</p>
          </article>
          <article>
            <CheckCircle2 size={27} aria-hidden="true" />
            <span>{serviceMode?.label ?? "服务方式"}</span>
            <strong>{serviceMode?.value ?? "全周期"}</strong>
            <p>根据企业所处阶段匹配服务方式，不以单一产品替代真实业务需求。</p>
          </article>
        </div>
      </section>

      <section className={`${styles.serviceBand} page-reveal`} aria-labelledby="service-capability-title">
        <div className={styles.wrap}>
          <div className={styles.serviceBandHeading}>
            <SectionLabel>SERVICE CAPABILITY</SectionLabel>
            <h2 id="service-capability-title">从基础核算到长期运营</h2>
          </div>
          <div className={styles.serviceList}>
            {page.features.map((feature, index) => (
              <article key={feature}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{feature}</h3>
                <i aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.companyTimeline} page-reveal`} aria-labelledby="company-timeline-title">
        <div className={styles.companyTimelineHeading}>
          <SectionLabel>WORKING METHOD</SectionLabel>
          <h2 id="company-timeline-title">一条贯穿建设与运营的服务路径</h2>
          <p>不虚构企业发展年份；这里呈现峰行智成已明确的项目工作路径。</p>
        </div>
        <ol>
          {page.steps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <small>{index === 0 ? "识别" : index === page.steps.length - 1 ? "运营" : "建设"}</small>
                <strong>{step}</strong>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${styles.wrap} ${styles.trustSection} page-reveal`} aria-labelledby="trust-title">
        <div className={styles.trustHeading}>
          <SectionLabel>TRUST &amp; COOPERATION</SectionLabel>
          <h2 id="trust-title">资质与合作信息，坚持可核验</h2>
        </div>
        <div className={styles.trustCards}>
          <article>
            <ShieldCheck size={31} aria-hidden="true" />
            <h3>资质信息</h3>
            <p>相关资质以官网公示及正式合作时提供的有效文件为准。</p>
          </article>
          <article>
            <Network size={31} aria-hidden="true" />
            <h3>合作伙伴</h3>
            <p>合作信息经相关方确认后发布，未确认的名称与标识不作展示。</p>
          </article>
          <article className={styles.trustContact}>
            <Building2 size={31} aria-hidden="true" />
            <h3>合作咨询</h3>
            <p>围绕核算、咨询、数字化平台与持续运营开展业务沟通。</p>
            <Link href="/#contact">
              获取可核验资料
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>

      <ContactBand title="与峰行智成讨论企业碳管理建设" />
    </>
  );
}
