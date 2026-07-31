import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Database,
  Gauge,
  Layers3,
  LineChart,
  Network,
  RefreshCcw,
  ShieldCheck,
  Table2,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ReferenceDiagram } from "@/components/reference-diagram";
import type { Subpage } from "@/lib/cms-content";
import styles from "./product-pages.module.css";

type ProductPageProps = { page: Subpage };

const excelFeatureIcons: LucideIcon[] = [Table2, LineChart, ShieldCheck, RefreshCcw];

const platformPrinciples = [
  { title: "统一数据体系", icon: Database },
  { title: "统一核算引擎", icon: Workflow },
  { title: "统一分析体系", icon: LineChart },
  { title: "统一管理平台", icon: Gauge },
];

function ProductVisual({ page }: ProductPageProps) {
  const screenshot = page.media?.screenshot;

  if (!screenshot) return null;

  return (
    <figure className={styles.productVisual} data-motion="product-visual" data-motion-role="visual">
      <Image
        src={screenshot}
        alt={`${page.title}产品界面`}
        width={1720}
        height={980}
        priority
        sizes="(max-width: 860px) calc(100vw - 36px), 52vw"
      />
    </figure>
  );
}

const platformAdvantages: Array<{
  number: string;
  title: string;
  summary: string;
  shorthand: string;
  points: string[];
  icon: LucideIcon;
}> = [
  {
    number: "01",
    title: "业务数据少维护，核算自动完成",
    summary: "企业只需持续维护真实业务明细，平台自动完成数据归集、规则匹配、因子调用、排放计算与结果更新。",
    shorthand: "少维护 · 自动核算 · 快速迭代",
    points: ["仅维护业务明细数据", "自动归集与因子匹配", "模型和报表灵活配置"],
    icon: Database,
  },
  {
    number: "02",
    title: "一套数据，多标准输出与多维分析",
    summary: "同源数据可按 GHG Protocol、ISO 14064-1 与 GB/T 32150-2025 输出结果，并沉淀排放总量、活动数据、气体构成和排放强度等关键成果。",
    shorthand: "多标准 · 多成果 · 多维分析",
    points: ["三大主流标准体系", "四类关键数据成果", "交互式分析视图", "基准年对比管理"],
    icon: Workflow,
  },
  {
    number: "03",
    title: "模块层级清晰，核算结果逐级可查",
    summary: "从集团驾驶舱、核算组织与边界，到活动数据、因子库和核算结果，平台按业务链路组织功能；结果模块继续细分为标准视图、气体构成和基准年对比。",
    shorthand: "十个业务模块 · 七类结果视图",
    points: ["业务模块按核算链路组织", "结果视图按应用场景细分", "数据来源与结果关系清晰"],
    icon: LineChart,
  }
];

function PageCta({ title }: { title: string }) {
  return (
    <section className={`${styles.cta} page-reveal`} aria-labelledby="product-contact-title" data-motion="cta">
      <div>
        <span>PRODUCT CONSULTATION</span>
        <h2 id="product-contact-title">了解{title}如何适配企业真实的核算与管理流程</h2>
        <p>从组织边界、数据口径到核算应用，获得与当前能力阶段匹配的产品建议。</p>
      </div>
      <Link href="/#contact">
        预约产品演示
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}

export function ExcelProductPage({ page }: ProductPageProps) {
  return (
    <>
      <section className={styles.excelHero}>
        <div className={styles.container}>
          <div className={`${styles.excelHeroCopy} page-reveal`} data-motion="hero-copy">
            <p className={styles.eyebrow}>Excel 温室气体核算工具</p>
            <h1>{page.title}</h1>
            <p className={styles.heroSummary}>{page.summary}</p>
            <div className={styles.heroActions}>
              <Link href="/#contact">咨询适用版本</Link>
            </div>
            <dl className={styles.heroMetrics} data-motion="hero-support">
              {page.metrics.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div data-motion="hero-visual">
            <ProductVisual page={page} />
          </div>
        </div>
      </section>

      <section className={`${styles.versionSection} ${styles.container} page-reveal`} aria-labelledby="excel-version-title" data-motion-group="product-compare">
        <header className={styles.sectionHeading} data-motion-role="heading">
          <span>ORGANIZATION EDITIONS</span>
          <h2 id="excel-version-title">匹配不同组织规模的核算方式</h2>
          <p>从单一法人独立核算，到多层级组织统一汇总，保持核算逻辑和数据口径一致。</p>
        </header>
        <div className={styles.versionCompare}>
          <article data-motion-role="item">
            <div className={styles.versionNumber}>01</div>
            <Building2 size={28} aria-hidden="true" />
            <h3>单公司版</h3>
            <p>面向单一法人或独立核算主体，完成边界配置、活动数据维护与核算结果输出。</p>
            <ul>
              <li><CheckCircle2 size={16} aria-hidden="true" />独立建立核算台账</li>
              <li><CheckCircle2 size={16} aria-hidden="true" />持续积累多年数据</li>
            </ul>
          </article>
          <div className={styles.compareAxis} aria-hidden="true" data-motion-role="item">
            <span>统一口径</span>
            <i />
            <span>按需升级</span>
          </div>
          <article data-motion-role="item">
            <div className={styles.versionNumber}>02</div>
            <Network size={28} aria-hidden="true" />
            <h3>集团版</h3>
            <p>面向多法人、多层级组织，支持分子公司独立维护、集团自动汇总与统一复核。</p>
            <ul>
              <li><CheckCircle2 size={16} aria-hidden="true" />组织数据分级维护</li>
              <li><CheckCircle2 size={16} aria-hidden="true" />集团结果自动汇总</li>
            </ul>
          </article>
        </div>
      </section>

      <section className={styles.functionBand} aria-labelledby="excel-function-title" data-motion-group="product-grid">
        <div className={styles.container}>
          <header className={styles.sectionHeading} data-motion-role="heading">
            <span>PRODUCT FEATURES</span>
            <h2 id="excel-function-title">产品特点</h2>
            <p>把核算方法落实到可持续使用的工具中，兼顾单体核算、集团汇总与多年数据积累。</p>
          </header>
          <div className={styles.functionGrid}>
            {page.features.map((feature, index) => {
              const FeatureIcon = excelFeatureIcons[index % excelFeatureIcons.length];
              return (
                <article className="page-reveal" key={feature} data-motion-role="item">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <FeatureIcon size={26} strokeWidth={1.7} aria-hidden="true" />
                  <h3>{feature}</h3>
                  <i aria-hidden="true" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ReferenceDiagram
        eyebrow="核算方法"
        title="Excel 工具的数据维护与核算关系"
        description="说明活动数据、排放因子、计算规则和核算结果在工具中的对应关系。"
        src={page.media?.diagram ?? "/media/reference-diagrams/excel-standard-flow.svg"}
        alt="Excel 温室气体核算工具的数据维护与核算关系图"
      />

      <PageCta title={page.title} />
    </>
  );
}

export function PlatformProductPage({ page }: ProductPageProps) {
  return (
    <>
      <section className={styles.platformHero}>
        <div className={styles.container}>
          <div className={`${styles.platformHeroCopy} page-reveal`} data-motion="hero-copy">
            <p className={styles.eyebrow}>企业碳管理数字化平台</p>
            <h1>{page.title}</h1>
            <p className={styles.heroSummary}>{page.summary}</p>
            <Link className={styles.platformHeroLink} href="/#contact">
              预约平台演示 <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div data-motion="hero-visual">
            <ProductVisual page={page} />
          </div>
        </div>
      </section>

      <section className={styles.principleBand} aria-labelledby="platform-principles-title" data-motion-group="product-grid">
        <div className={styles.principleInner}>
          <header data-motion-role="heading">
            <span>PLATFORM PHILOSOPHY</span>
            <h2 id="platform-principles-title">平台理念</h2>
            <p>以一套贯通的数据与管理底座，承接企业从核算执行到持续运营的全过程。</p>
          </header>
          <ol className={styles.principleGrid}>
            {platformPrinciples.map((principle, index) => {
              const PrincipleIcon = principle.icon;
              return (
                <li key={principle.title} data-motion-role="item">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <PrincipleIcon size={25} strokeWidth={1.6} aria-hidden="true" />
                  <strong>{principle.title}</strong>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className={`${styles.platformAdvantages} ${styles.container} page-reveal`} aria-labelledby="platform-advantages-title">
        <header className={styles.advantageIntro} data-motion-group="section-heading" data-motion-role="heading">
          <div>
            <span>CORE ADVANTAGES</span>
            <h2 id="platform-advantages-title">三大核心优势</h2>
          </div>
          <p>从日常数据维护出发，让核算自动发生、结果多维复用，并通过清晰的功能层级把每一项结果落实到可查看、可管理的业务场景。</p>
        </header>
        <ol className={styles.advantageIndex} data-motion-group="product-grid">
          {platformAdvantages.map((advantage, index) => {
            const AdvantageIcon = advantage.icon;
            return (
              <li key={advantage.title} data-motion-role="item">
                <span>{advantage.number}</span>
                <AdvantageIcon size={24} strokeWidth={1.6} aria-hidden="true" />
                <strong>{advantage.title}</strong>
                <small>{advantage.shorthand}</small>
                <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
              </li>
            );
          })}
        </ol>

        <div className={styles.advantageStories}>
          <article className={styles.advantageAutomation} data-motion-group="platform-advantage">
            <div className={styles.advantageStoryCopy} data-motion-role="copy">
              <span>{platformAdvantages[0].number} / AUTOMATED ACCOUNTING</span>
              <h3>{platformAdvantages[0].title}</h3>
              <p>{platformAdvantages[0].summary}</p>
            </div>
            <figure className={styles.automationFlow} data-motion-role="visual">
              <Image
                src="/media/platform-advantages/business-data-flow.png"
                alt="业务输入层、统一模型层与核算分析层自动衔接的数据流程"
                width={6209}
                height={2297}
                sizes="(max-width: 780px) calc(100vw - 36px), 760px"
              />
            </figure>
            <ol className={styles.automationPoints} data-motion-group="product-grid">
              {platformAdvantages[0].points.map((point, index) => (
                <li key={point} data-motion-role="item">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{point}</strong>
                </li>
              ))}
            </ol>
          </article>

          <article className={styles.advantageAnalysis} data-motion-group="platform-advantage">
            <header data-motion-role="copy">
              <div>
                <span>{platformAdvantages[1].number} / MULTI-STANDARD OUTPUT</span>
                <h3>一套数据，<br />多标准输出与多维分析</h3>
              </div>
              <p>{platformAdvantages[1].summary}</p>
            </header>
            <div className={styles.analysisEvidence} data-motion-role="visual">
              <figure className={styles.analysisEvidencePrimary}>
                <Image
                  src="/media/platform-advantages/reuse-standard-output.png"
                  alt="同一套碳数据按 GHG Protocol、ISO 14064-1 与 GB/T 32150-2025 输出核算结果"
                  width={5383}
                  height={3285}
                  sizes="(max-width: 780px) calc(100vw - 36px), 720px"
                />
                <figcaption><span>01</span>一套数据，三大标准输出</figcaption>
              </figure>
              <div className={styles.analysisEvidenceMosaic}>
                <figure>
                  <Image src="/media/platform-advantages/reuse-activity-data.png" alt="排放总量、活动数据、温室气体构成与碳排放强度四类关键成果" width={5491} height={3367} sizes="(max-width: 780px) calc(100vw - 36px), 340px" />
                  <figcaption><span>02</span>四类关键成果沉淀</figcaption>
                </figure>
                <figure>
                  <Image src="/media/platform-advantages/reuse-trend-analysis.png" alt="支持年度、月份、单位、因子与工厂切换的多维交互分析" width={5491} height={3379} sizes="(max-width: 780px) calc(100vw - 36px), 340px" />
                  <figcaption><span>03</span>多维交互分析</figcaption>
                </figure>
                <figure>
                  <Image src="/media/platform-advantages/reuse-baseline-analysis.png" alt="企业温室气体排放基准年管理与对比分析界面" width={5491} height={3369} sizes="(max-width: 780px) calc(100vw - 36px), 340px" />
                  <figcaption><span>04</span>基准年对比管理</figcaption>
                </figure>
              </div>
            </div>
          </article>

          <article className={styles.advantageTraceability} data-motion-group="platform-advantage">
            <figure data-motion-role="visual">
              <Image
                src="/media/platform-advantages/traceability-module-map.png"
                alt="平台十个业务模块与排放量核算结果七类子视图的功能层级"
                width={2169}
                height={1495}
                sizes="(max-width: 780px) calc(100vw - 72px), 620px"
              />
            </figure>
            <div data-motion-role="copy">
              <span>{platformAdvantages[2].number} / CLEAR DATA LINEAGE</span>
              <h3>{platformAdvantages[2].title}</h3>
              <p>{platformAdvantages[2].summary}</p>
              <ul>
                {platformAdvantages[2].points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <strong>{platformAdvantages[2].shorthand}</strong>
            </div>
          </article>
        </div>
      </section>

      <section className={`${styles.architecture} ${styles.container} page-reveal`} aria-labelledby="platform-architecture-title" data-motion-group="product-architecture">
        <header className={styles.sectionHeading} data-motion-role="heading">
          <span>PLATFORM ARCHITECTURE</span>
          <h2 id="platform-architecture-title">一套贯穿数据、核算、分析与管理的业务架构</h2>
          <p>以统一数据模型承接日常业务数据，通过集中核算引擎形成多口径结果，并持续服务管理决策。</p>
        </header>
        <div className={styles.architectureMap}>
          <div className={styles.architectureCore} data-motion-role="item">
            <Database size={32} strokeWidth={1.6} aria-hidden="true" />
            <strong>统一碳数据体系</strong>
            <span>一次维护 · 持续沉淀</span>
          </div>
          <div className={styles.architectureLayers}>
            <article data-motion-role="item">
              <span>01</span><Layers3 size={23} aria-hidden="true" /><strong>数据基础</strong>
              <p>统一管理排放边界、排放源、活动数据与排放因子。</p>
            </article>
            <article data-motion-role="item">
              <span>02</span><Workflow size={23} aria-hidden="true" /><strong>核算引擎</strong>
              <p>集中执行核算逻辑，支持组织、年度与口径灵活切换。</p>
            </article>
            <article data-motion-role="item">
              <span>03</span><LineChart size={23} aria-hidden="true" /><strong>分析体系</strong>
              <p>围绕总量、气体类型、排放强度与趋势开展多维分析。</p>
            </article>
            <article data-motion-role="item">
              <span>04</span><Gauge size={23} aria-hidden="true" /><strong>管理应用</strong>
              <p>支撑基准年管理、工厂对标与长期碳管理决策。</p>
            </article>
          </div>
        </div>
      </section>

      <ReferenceDiagram
        eyebrow="平台架构"
        title="企业碳管理平台功能架构"
        description="展示数据基础、核算分析和管理应用之间的功能层级与数据关系。"
        src={page.media?.diagram ?? "/media/reference-diagrams/platform-architecture.svg"}
        alt="企业碳管理平台功能架构图"
      />

      <section className={`${styles.analysisSection} ${styles.container} page-reveal`} aria-labelledby="platform-analysis-title" data-motion-group="product-grid">
        <header data-motion-role="heading">
          <span>MANAGEMENT INSIGHT</span>
          <h2 id="platform-analysis-title">从核算结果走向多维管理分析</h2>
        </header>
        <div className={styles.analysisGrid}>
          <article className={styles.analysisPrimary} data-motion-role="item">
            <BarChart3 size={30} aria-hidden="true" />
            <h3>排放总量与趋势</h3>
            <p>按组织与年度观察排放变化，为基准年管理和持续改善提供数据依据。</p>
            <div className={styles.miniBars} aria-hidden="true">
              {[38, 55, 47, 72, 64, 82].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
            </div>
          </article>
          <article data-motion-role="item"><Gauge size={27} aria-hidden="true" /><h3>排放强度</h3><p>结合企业业务口径开展强度分析。</p></article>
          <article data-motion-role="item"><Network size={27} aria-hidden="true" /><h3>组织对标</h3><p>在统一口径下比较不同组织与工厂。</p></article>
          <article data-motion-role="item"><ShieldCheck size={27} aria-hidden="true" /><h3>结果追溯</h3><p>从分析结果回溯数据来源和核算过程。</p></article>
        </div>
      </section>

      <PageCta title={page.title} />
    </>
  );
}
