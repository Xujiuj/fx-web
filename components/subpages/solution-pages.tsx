import { Fragment } from "react";
import {
  ArrowRight,
  Check,
  FileCheck2,
  Target,
  UsersRound,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReferenceDiagram } from "@/components/reference-diagram";
import type { Subpage, SubpageSection } from "@/lib/cms-content";
import { isAllowedContentHref, isRuntimeManagedImage } from "@/lib/media-url";
import styles from "./solution-pages.module.css";

type SolutionPageProps = { page: Subpage };

type SolutionFramework = {
  sequence: string;
  title: string;
  summary: string;
  suitableFor: string[];
  problems: string[];
  deliverable: string;
  deliverableDescription: string;
  services: string[];
  outcomes: string[];
  outcomeLabel: string;
};

type SolutionDiagram = {
  eyebrow: string;
  title: string;
  description: string;
  src: string;
  alt: string;
};

type SolutionPresentation = {
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{ title: string; description: string }>;
};

type SectionItem = SubpageSection["items"][number];

function getSection(page: Subpage, id: string) {
  return page.sections.find((section) => section.id === id);
}

function titleItems(items: string[]): SectionItem[] {
  return items.map((title) => ({ title }));
}

function detailPoints(item: SectionItem) {
  return (item.details?.["要点"] ?? "")
    .split(/\r?\n/)
    .map((point) => point.trim())
    .filter(Boolean);
}

function ItemDetails({ item }: { item: SectionItem }) {
  const points = detailPoints(item);
  if (!points.length) return null;

  return <ul>{points.map((point, index) => <li key={`${point}-${index}`}>{point}</li>)}</ul>;
}

const solutionFrameworks: Record<string, SolutionFramework> = {
  "solution-standard": {
    sequence: "01",
    title: "标准版（培训赋能）",
    summary: "帮助企业快速掌握温室气体核算方法。",
    suitableFor: ["初步启动核算工作", "缺少专业人员", "方法认知不足", "需要统一口径"],
    problems: ["核算方法不清晰", "标准理解不统一", "核算边界模糊", "缺乏实战经验"],
    deliverable: "《企业温室气体核算实操课程》",
    deliverableDescription: "帮助企业建立核算认知，掌握国家标准与核算方法，形成可延续的内部工作基础。",
    services: ["温室气体核算方法培训", "GHG Protocol培训", "ISO14064培训", "国标培训", "Excel实战演练", "企业案例解析"],
    outcomes: ["建立统一认知", "掌握核算方法", "培养内部人才", "具备独立核算能力"],
    outcomeLabel: "客户收益",
  },
  "solution-practical": {
    sequence: "02",
    title: "实战营（Excel单公司版）",
    summary: "帮助企业完成首次核算闭环。",
    suitableFor: ["准备开展首次核算", "需要建立数据台账", "希望形成标准成果", "需要支撑核查与披露"],
    problems: ["数据采集缺少统一模板", "核算流程尚未闭环", "过程校核依赖人工", "成果难以持续更新"],
    deliverable: "《企业温室气体核算报表（Excel单公司版）》",
    deliverableDescription: "基于企业实际数据完成一次核算，形成可复用的核算成果、数据台账与工作模板。",
    services: ["数据采集梳理", "Excel工具部署", "实操辅导", "过程校核", "成果交付"],
    outcomes: ["完成首次核算", "建立数据台账", "形成标准成果", "支撑核查与披露"],
    outcomeLabel: "客户收益",
  },
  "solution-consulting": {
    sequence: "03",
    title: "咨询版（Excel集团版）",
    summary: "建立集团统一核算管理体系。",
    suitableFor: ["多法人或多层级集团", "成员企业独立核算", "需要集团统一汇总", "需要支撑ESG披露"],
    problems: ["子公司核算口径不一致", "数据模板与责任分散", "集团汇总复核效率低", "年度更新难以协同"],
    deliverable: "《企业温室气体核算报表（Excel集团版）》",
    deliverableDescription: "形成子公司独立核算、集团自动汇总的完整体系架构，为年度更新与披露准备提供统一基础。",
    services: ["集团组织边界梳理", "统一核算口径与模板", "单体公司核算模型部署", "集团汇总模型设计", "核算口径规范", "实施方案制定"],
    outcomes: ["子公司独立核算", "集团自动汇总", "统一核算口径", "支撑ESG披露"],
    outcomeLabel: "客户收益",
  },
  "solution-platform": {
    sequence: "04",
    title: "平台版（数字化升级）",
    summary: "建设企业长期碳管理能力。",
    suitableFor: ["已建立基础核算体系", "多组织数据集中管理", "需要持续分析决策", "计划开展数字化升级"],
    problems: ["数据分散存储", "人工维护成本高", "缺少自动化核算", "数据难以持续沉淀"],
    deliverable: "《企业碳管理数字化平台》",
    deliverableDescription: "构建统一数字化平台，实现碳数据集中管理、自动化核算、分析洞察与持续运营。",
    services: ["数据模型架构搭建", "平台系统部署", "自动化数据采集", "自动化核算", "分析洞察与管理模块", "持续运营支持"],
    outcomes: ["数据集中管理", "自动化核算", "多维分析决策", "数据持续沉淀", "多场景价值释放"],
    outcomeLabel: "核心价值",
  },
};

const solutionDiagrams: Record<string, SolutionDiagram> = {
  "solution-standard": {
    eyebrow: "CAPABILITY ROADMAP",
    title: "企业碳管理能力建设路线图",
    description: "从启动准备、培训赋能到实际应用，明确企业建立温室气体核算能力的推进路径。",
    src: "/media/reference-diagrams/service-process.svg",
    alt: "企业碳管理能力建设路线图",
  },
  "solution-practical": {
    eyebrow: "数据治理",
    title: "企业碳数据治理与标准体系",
    description: "将数据标准、核算规则和管理应用纳入统一体系，支撑长期维护和持续分析。",
    src: "/media/reference-diagrams/carbon-data-governance.svg",
    alt: "企业碳数据治理与标准体系图",
  },
  "solution-consulting": {
    eyebrow: "集团协同",
    title: "集团和分子公司实施路径",
    description: "呈现集团与分子公司在口径制定、数据报送、汇总复核中的协同关系。",
    src: "/media/reference-diagrams/group-implementation.svg",
    alt: "集团和分子公司温室气体核算实施路径图",
  },
  "solution-platform": {
    eyebrow: "实施流程",
    title: "企业碳管理平台架构图",
    description: "以统一数据体系、核算引擎和分析应用为主线，展示企业碳管理平台的技术路线与功能协同关系。",
    src: "/media/reference-diagrams/platform-architecture.svg",
    alt: "企业碳管理平台架构图",
  },
};

const solutionPresentations: Record<string, SolutionPresentation> = {
  "solution-standard": {
    eyebrow: "TRAINING MODULES",
    title: "从标准理解到企业实战",
    description: "课程围绕核算方法、适用标准和Excel实战展开，让参与人员把知识转化为可执行的内部工作方法。",
    items: [
      { title: "方法认知", description: "温室气体核算基本逻辑与工作边界" },
      { title: "标准理解", description: "GHG Protocol、ISO14064与国标要求" },
      { title: "工具实战", description: "通过Excel演练掌握数据与计算关系" },
      { title: "案例复盘", description: "结合企业案例识别常见问题与处理方式" }
    ]
  },
  "solution-practical": {
    eyebrow: "ACCOUNTING WORKFLOW",
    title: "完成首次核算闭环",
    description: "以企业真实数据为主线，把数据采集、工具部署、实操辅导、过程校核和成果交付串成连续流程。",
    items: [
      { title: "数据采集梳理", description: "明确数据来源、责任人与填报口径" },
      { title: "Excel工具部署", description: "按企业边界配置核算表与数据台账" },
      { title: "实操与校核", description: "完成数据维护、排放计算与过程复核" },
      { title: "成果交付", description: "形成核算报表、台账与可复用工作模板" }
    ]
  },
  "solution-consulting": {
    eyebrow: "GROUP COLLABORATION",
    title: "集团统筹，成员企业协同",
    description: "由集团统一组织边界、核算口径和汇总规则，成员企业独立维护数据并完成核算，最终形成集团级统一成果。",
    items: [
      { title: "集团规则层", description: "统一组织边界、数据模板与核算口径" },
      { title: "成员执行层", description: "子公司独立采集数据并完成单体核算" },
      { title: "集中复核层", description: "集团汇总、异常校核与口径复核" },
      { title: "披露应用层", description: "支撑集团ESG披露与年度持续更新" }
    ]
  },
  "solution-platform": {
    eyebrow: "DIGITAL OPERATIONS",
    title: "让碳管理进入持续运营",
    description: "以统一数据体系和核算引擎为基础，将日常数据维护、自动核算、分析决策与长期运营纳入同一平台。",
    items: [
      { title: "统一数据层", description: "集中管理组织、边界、活动数据与排放因子" },
      { title: "自动核算层", description: "通过规则引擎执行多组织、多年度核算" },
      { title: "分析决策层", description: "开展总量、强度、趋势与组织维度分析" },
      { title: "持续运营层", description: "沉淀数据资产并服务多场景价值释放" }
    ]
  }
};

function getFramework(page: Subpage): SolutionFramework {
  const fallback = solutionFrameworks[page.slug];
  if (fallback) return { ...fallback, title: page.title, summary: page.summary };

  return {
    sequence: page.eyebrow.replace(/\D/g, "") || "01",
    title: page.title,
    summary: page.summary,
    suitableFor: ["根据企业当前核算阶段匹配服务范围"],
    problems: ["围绕数据、核算、追溯与价值应用建立解决路径"],
    deliverable: "企业温室气体核算与管理成果",
    deliverableDescription: "形成可复核、可使用并可持续更新的工作成果。",
    services: page.features,
    outcomes: [],
    outcomeLabel: "客户收益",
  };
}

function SolutionHeroTitle({ title }: { title: string }) {
  const match = title.match(/^(.+?)(（.+）)$/);
  if (!match) return <h1>{title}</h1>;

  return <h1><span>{match[1]}</span><small>{match[2]}</small></h1>;
}

function SolutionDetailPage({ page }: SolutionPageProps) {
  const framework = getFramework(page);
  const diagram = solutionDiagrams[page.slug];
  const presentation = solutionPresentations[page.slug];
  const presentationClass = styles[`presentation${framework.sequence}`] ?? "";
  const fitSection = getSection(page, "solution-fit");
  const problemsSection = getSection(page, "solution-problems");
  const deliverableSection = getSection(page, "solution-deliverable");
  const presentationSection = getSection(page, "solution-presentation");
  const servicesSection = getSection(page, "solution-services");
  const outcomesSection = getSection(page, "solution-outcomes");
  const diagramSection = getSection(page, "solution-diagram");
  const ctaSection = getSection(page, "solution-cta");
  const ctaAction = ctaSection?.items[0];
  const ctaHref = isAllowedContentHref(ctaAction?.value) ? ctaAction?.value : undefined;
  const fitItems = fitSection?.items ?? titleItems(framework.suitableFor);
  const problemItems = problemsSection?.items ?? titleItems(framework.problems);
  const deliverableItems = deliverableSection?.items ?? [{ title: framework.deliverable, description: framework.deliverableDescription }];
  const presentationContent = presentationSection
    ? {
        eyebrow: presentation?.eyebrow ?? page.eyebrow,
        title: presentationSection.title,
        description: presentationSection.description ?? "",
        items: presentationSection.items,
      }
    : presentation;
  const serviceItems = servicesSection?.items ?? titleItems(framework.services);
  const outcomeItems = outcomesSection?.items ?? titleItems(framework.outcomes);
  const diagramItems: SectionItem[] = diagramSection
    ? diagramSection.items
    : diagram
      ? [{ title: diagram.title, description: diagram.description, image: page.media?.diagram ?? diagram.src }]
      : [];
  const diagramImage = diagramItems.find((item) => item.image)?.image ?? page.media?.diagram ?? diagram?.src;
  const heroImage = diagramImage || page.image;
  const heroImageAlt = `${page.title}方案主图`;
  const diagramBlocks = diagramItems.map((item, index) => {
    const src = item.image ?? (index === 0 ? page.media?.diagram ?? diagram?.src : undefined);
    if (!src) return null;
    const eyebrow = diagramSection && diagramSection.title !== item.title
      ? diagramSection.title
      : diagram?.eyebrow ?? page.eyebrow;
    return <Fragment key={`${item.title}-${src}-${index}`}>
      <ReferenceDiagram eyebrow={eyebrow} title={item.title} description={item.description ?? diagramSection?.description ?? diagram?.description ?? ""} src={src} alt={diagram?.alt ?? item.title} />
      {detailPoints(item).length ? <section aria-label={`${item.title}要点`}><ItemDetails item={item} /></section> : null}
    </Fragment>;
  });

  return (
    <>
      <section className={`${styles.solutionDetailHero} ${styles[`solutionHero${framework.sequence}`] ?? ""}`}>
        <div className={styles.solutionDetailHeroInner}>
          <div className={`${styles.solutionDetailHeroCopy} page-reveal`} data-motion="hero-copy">
            <span>{page.eyebrow}</span>
            <SolutionHeroTitle title={page.title} />
            <p>{page.summary}</p>
          </div>
          <div className={styles.solutionHeroSignal} data-motion="hero-support">
            <strong>{framework.sequence}</strong>
            <Image src={heroImage} alt={heroImageAlt} width={1200} height={800} priority sizes="(max-width: 760px) calc(100vw - 36px), 1140px" unoptimized={isRuntimeManagedImage(heroImage)} />
          </div>
        </div>
      </section>

      <section className={styles.solutionStageNav} aria-label="企业碳管理能力建设路径" data-motion-group="solution-stage-nav">
        <p data-motion-role="copy">我们提供从Excel工具到数字化平台的全阶段解决方案，企业可依据自身发展阶段与管理成熟度，选择最适配的能力建设路径，实现渐进式、可持续的碳管理能力提升。</p>
      </section>

      {framework.sequence === "01" ? diagramBlocks : null}

      <section className={`${styles.solutionFramework} page-reveal`} aria-labelledby="solution-framework-title" data-motion-group="solution-framework">
        <header data-motion-role="heading">
          <span>能力建设方案</span>
          <h2 id="solution-framework-title">从企业当前阶段出发，形成可持续使用的碳管理能力</h2>
        </header>
        <div className={styles.frameworkGrid}>
          <article data-motion-role="item">
            <UsersRound aria-hidden="true" size={28} />
            <h3>{fitSection?.title ?? "适用企业"}</h3>
            {fitSection?.description ? <p>{fitSection.description}</p> : null}
            <ul>{fitItems.map((item, index) => <li key={`${item.title}-${index}`}><strong>{item.title}</strong>{item.description ? <p>{item.description}</p> : null}<ItemDetails item={item} /></li>)}</ul>
          </article>
          <article data-motion-role="item">
            <Target aria-hidden="true" size={28} />
            <h3>{problemsSection?.title ?? "核心解决问题"}</h3>
            {problemsSection?.description ? <p>{problemsSection.description}</p> : null}
            <ul>{problemItems.map((item, index) => <li key={`${item.title}-${index}`}><strong>{item.title}</strong>{item.description ? <p>{item.description}</p> : null}<ItemDetails item={item} /></li>)}</ul>
          </article>
          <article className={styles.deliverableCard} data-motion-role="item">
            <FileCheck2 aria-hidden="true" size={28} />
            <h3>{deliverableSection?.title ?? "核心交付成果"}</h3>
            {deliverableItems.map((item, index) => <Fragment key={`${item.title}-${index}`}>
              <strong style={{ gridColumn: 3 }}>{item.title}</strong>
              <div style={{ gridColumn: 4 }}>
                {item.description ? <p>{item.description}</p> : null}
                <ItemDetails item={item} />
              </div>
            </Fragment>)}
          </article>
        </div>
      </section>

      {presentationContent ? <section className={`${styles.solutionPresentation} ${presentationClass}`} aria-labelledby="solution-presentation-title" data-motion-group={`solution-presentation-${framework.sequence}`}>
        <header data-motion-role="heading"><span>{presentationContent.eyebrow}</span><h2 id="solution-presentation-title">{presentationContent.title}</h2>{presentationContent.description ? <p>{presentationContent.description}</p> : null}</header>
        <ol>{presentationContent.items.map((item, index) => <li key={`${item.title}-${index}`} data-motion-role="item"><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3>{item.description ? <p>{item.description}</p> : null}<ItemDetails item={item} /></li>)}</ol>
      </section> : null}

      <section className={styles.serviceContents} aria-labelledby="service-contents-title">
        <div className={`${styles.serviceContentsInner} page-reveal`} data-motion-group="solution-services">
          <header data-motion-role="heading">
            <Wrench aria-hidden="true" size={30} />
            <div>
              <span>{servicesSection?.title ?? "服务内容"}</span>
              <h2 id="service-contents-title">{servicesSection?.description ?? "围绕成果交付组织实施工作"}</h2>
            </div>
          </header>
          <ol>
            {serviceItems.map((service, index) => (
              <li key={`${service.title}-${index}`} data-motion-role="item">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{service.title}</strong>{service.description ? <p>{service.description}</p> : null}<ItemDetails item={service} /></div>
                <Check aria-hidden="true" size={18} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {framework.sequence !== "01" ? diagramBlocks : null}

      <section className={`${styles.solutionOutcomes} ${styles[`outcomes${framework.sequence}`] ?? ""}`} aria-labelledby="solution-outcomes-title" data-motion-group={`solution-outcomes-${framework.sequence}`}>
        <div data-motion-role="heading"><span>OUTCOMES</span><h2 id="solution-outcomes-title">{outcomesSection?.title ?? framework.outcomeLabel}</h2>{outcomesSection?.description ? <p>{outcomesSection.description}</p> : null}</div>
        <ol>{outcomeItems.map((outcome, index) => <li key={`${outcome.title}-${index}`} data-motion-role="item"><span>{String(index + 1).padStart(2, "0")}</span><Check size={20} aria-hidden="true" /><div><strong>{outcome.title}</strong>{outcome.description ? <p>{outcome.description}</p> : null}<ItemDetails item={outcome} /></div></li>)}</ol>
      </section>

      <section className={`${styles.solutionCta} page-reveal`} aria-label="联系顾问" data-motion="cta">
        <div>
          <span>{ctaSection?.description || "下一步"}</span>
          <h2>{ctaSection?.title || `咨询${page.title}`}</h2>
        </div>
        {ctaHref ? <Link href={ctaHref}>{ctaAction?.title || "联系顾问"}<ArrowRight aria-hidden="true" size={18} /></Link> : <span className={styles.ctaUnavailable} aria-disabled="true">{ctaAction?.title || "联系顾问"}</span>}
      </section>
    </>
  );
}

export function TrainingPage({ page }: SolutionPageProps) {
  return <SolutionDetailPage page={page} />;
}

export function PracticalPage({ page }: SolutionPageProps) {
  return <SolutionDetailPage page={page} />;
}

export function ConsultingPage({ page }: SolutionPageProps) {
  return <SolutionDetailPage page={page} />;
}

export function PlatformSolutionPage({ page }: SolutionPageProps) {
  return <SolutionDetailPage page={page} />;
}
