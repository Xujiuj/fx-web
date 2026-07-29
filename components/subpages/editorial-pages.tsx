import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Download,
  Factory,
  FileSpreadsheet,
  GraduationCap,
  Home,
  Landmark,
  Library,
  Network,
  ShieldCheck,
  Target,
  Waypoints,
  Warehouse,
} from "lucide-react";
import Image from "next/image";
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

const industryCaseDetails = [
  { label: "制造业", icon: Factory, focus: "生产环节、能源消耗与工厂边界", description: "围绕固定燃烧、外购电力和生产过程数据，梳理覆盖生产现场的核算基础。" },
  { label: "能源与公用事业", icon: Landmark, focus: "资产边界、供能数据与年度分析", description: "将设备、站点和供能环节纳入统一口径，为多年度管理和信息披露准备数据。" },
  { label: "园区与多组织管理", icon: Warehouse, focus: "组织分级、数据汇总与责任分工", description: "明确园区、成员企业及运营主体的职责边界，形成可持续维护的数据协同方式。" },
  { label: "供应链与品牌企业", icon: Network, focus: "采购数据、供应商协同与范围三准备", description: "从可获得的数据出发，逐步建立供应链排放信息的收集、校核与应用基础。" },
];

export function CasesPage({ page }: EditorialPageProps) {
  return (
    <>
      <section className={styles.caseHero}>
        <div className={`${styles.wrap} ${styles.caseHeroInner}`}>
          <div className={`${styles.caseHeroCopy} page-reveal`}>
            <SectionLabel>行业案例</SectionLabel>
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
          </div>
          <div className={`${styles.caseHeroIndex} page-reveal`} aria-label="覆盖行业">
            {industryCaseDetails.map((item, index) => (
              <div key={item.label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{page.features[index] ?? item.label}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.industryIntroduction} page-reveal`} aria-labelledby="industry-intro-title">
        <SectionLabel>业务场景</SectionLabel>
        <h2 id="industry-intro-title">行业不同，数据基础和工作重点也不同</h2>
        <p>以下案例按常见业务场景整理，不展示未经确认的客户名称或项目成效。企业可据此判断本单位的数据准备、组织协同与核算工作重点。</p>
      </section>

      <section className={`${styles.wrap} ${styles.industryGrid}`} aria-label="行业场景">
        {industryCaseDetails.map((item, index) => {
          const Icon = item.icon;
          return (
            <article className="page-reveal" key={item.label}>
              <div className={styles.industryCardTop}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon size={27} aria-hidden="true" />
              </div>
              <h2>{page.features[index] ?? item.label}</h2>
              <dl>
                <div>
                  <dt>关注重点</dt>
                  <dd>{item.focus}</dd>
                </div>
              </dl>
              <p>{item.description}</p>
            </article>
          );
        })}
      </section>

      <section className={`${styles.caseScope} page-reveal`} aria-labelledby="case-scope-title">
        <div className={styles.wrap}>
          <div className={styles.caseScopeHeading}>
            <SectionLabel>实施范围</SectionLabel>
            <h2 id="case-scope-title">从业务边界到管理应用，逐项明确工作范围</h2>
            <p>实施内容以企业实际数据条件和管理目标为基础确认，不用跳转链接替代范围说明。</p>
          </div>
          <ol>
            {page.steps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step}</strong>
                  <p>{index === 0 ? "结合组织结构、业务流程和管理目标，确定本次工作的边界。" : index === 1 ? "确认活动数据、能源数据及相关凭证的来源和责任人。" : index === 2 ? "统一数据口径、核算规则和内部复核方式。" : "形成可用于后续更新、分析和管理沟通的成果。"}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ContactBand title="从行业场景开始梳理企业碳管理工作" />
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
  const isVisionPage = page.slug.includes("vision") || page.title.includes("愿景");
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
          {isVisionPage ? (
            <figure className={`${styles.companyVisionVisual} page-reveal`}>
              <Image src={page.image} alt="企业愿景" width={1200} height={660} sizes="(max-width: 720px) 100vw, 1120px" />
            </figure>
          ) : null}
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
