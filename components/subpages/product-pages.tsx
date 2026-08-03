import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Database,
  Download,
  ExternalLink,
  Gauge,
  Layers3,
  LineChart,
  Network,
  PlayCircle,
  BarChart3,
  RefreshCcw,
  ShieldCheck,
  Table2,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ReferenceDiagram } from "@/components/reference-diagram";
import {
  PlatformOverview,
  ProductMediaGallery,
  type PlatformOverviewItem,
  type ProductMediaItem,
} from "@/components/product-media-gallery";
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

const materialRoot = "/materials/20260803/资料20260803";
const powerBiPublicUrl = process.env.NEXT_PUBLIC_POWER_BI_PUBLIC_URL?.trim() || "/enterprise#power-bi";
const platformTrialUrl = process.env.NEXT_PUBLIC_PLATFORM_TRIAL_URL?.trim() || "/#contact";

const excelScreenshots: ProductMediaItem[] = [
  {
    src: `${materialRoot}/产品/单公司版产品截图-01.svg`,
    alt: "Excel温室气体核算工具单公司版完整界面",
    label: "单公司版",
    width: 981,
    height: 499,
  },
  {
    src: `${materialRoot}/产品/集团版版产品截图-01.svg`,
    alt: "Excel温室气体核算工具集团版完整界面",
    label: "集团版",
    width: 887,
    height: 703,
  },
];

const platformScreenshots: ProductMediaItem[] = Array.from({ length: 7 }, (_, index) => ({
  src: `${materialRoot}/产品/平台截图/${index + 1}.png`,
  alt: `企业碳管理数字化平台界面截图${index + 1}`,
  label: ["数据维护", "分析首页", "分析目录", "排放总览", "排放明细", "趋势分析", "强度分析"][index],
  width: 3840,
  height: 2040,
}));

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

const platformAdvantages: Array<PlatformOverviewItem & {
  number: string;
  title: string;
  shorthand: string;
  eyebrow: string;
  icon: LucideIcon;
}> = [
  {
    number: "01",
    title: "业务数据驱动，降低碳管理成本",
    label: "业务数据驱动",
    shorthand: "少维护 · 自动核算 · 降低成本",
    eyebrow: "BUSINESS DATA DRIVEN",
    icon: Database,
    summary: "企业无需反复填写核算报表，仅需维护业务明细数据，系统自动完成数据归集、因子匹配、排放计算与结果分析。",
    points: ["数据归集", "因子匹配", "排放计算", "结果分析"],
    src: "/media/platform-advantages/business-data-flow.png",
    alt: "业务数据驱动的自动核算流程",
    width: 6209,
    height: 2297,
  },
  {
    number: "02",
    title: "一次核算，多场景复用",
    label: "一次核算，多场景复用",
    shorthand: "一次治理 · 多标准 · 多场景",
    eyebrow: "ONE MODEL · MANY USES",
    icon: Workflow,
    summary: "平台基于统一碳数据模型，实现同源数据统一治理，让一次核算结果持续服务履约、披露、供应链和经营决策。",
    points: ["全国碳市场履约", "ESG信息披露", "供应链碳管理", "企业经营分析"],
    src: "/media/platform-advantages/reuse-standard-output.png",
    alt: "一套数据支持多标准核算结果输出",
    width: 5383,
    height: 3285,
  },
  {
    number: "03",
    title: "全流程可信可追溯",
    label: "全流程可信可追溯",
    shorthand: "全链路 · 可追溯 · 可核查",
    eyebrow: "TRACEABLE DATA LINEAGE",
    icon: LineChart,
    summary: "平台建立覆盖排放源、活动数据、排放因子与核算结果的全链路管理体系，支持监管报送、第三方核查、ESG披露与内部审计。",
    points: ["排放源到活动数据", "活动数据到排放因子", "排放因子到核算结果", "结果回溯业务数据与计算逻辑"],
    src: "/media/platform-advantages/traceability-module-map.png",
    alt: "排放源、活动数据、排放因子和核算结果的追溯关系",
    width: 2169,
    height: 1495,
  },
];

const platformOverviewItems: PlatformOverviewItem[] = platformAdvantages.map((item) => ({
  label: item.label,
  summary: item.summary,
  points: item.points,
  src: item.src,
  alt: item.alt,
  width: item.width,
  height: item.height,
}));

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

function ProductResources({ product }: { product: string }) {
  return (
    <section className={`${styles.productResources} ${styles.container}`} aria-labelledby={`${product}-resources-title`}>
      <header className={styles.sectionHeading}>
        <span>RESOURCE CENTER</span>
        <h2 id={`${product}-resources-title`}>产品资料下载</h2>
        <p>产品手册、功能清单与试用说明将在此持续更新；当前可联系顾问获取最新版本。</p>
      </header>
      <div className={styles.resourceRows}>
        {["产品手册", "功能与版本清单", "部署及试用说明"].map((name) => (
          <Link href="/#contact" key={name}>
            <Download size={19} aria-hidden="true" />
            <strong>{name}</strong>
            <span>联系获取</span>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        ))}
      </div>
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

      <ProductMediaGallery
        eyebrow="PRODUCT SCREENSHOTS"
        title="查看两个版本的完整产品界面"
        description="切换单公司版与集团版，点击大图可在新窗口查看原始分辨率。"
        items={excelScreenshots}
      />

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

      <ProductResources product="excel" />
      <PageCta title={page.title} />
    </>
  );
}

export function LegacyPlatformProductPage({ page }: ProductPageProps) {
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
          <p>从业务数据驱动核算，到一次治理、多场景复用，再到全流程可信追溯，平台让碳数据成为可持续运营的业务资产。</p>
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
              <span>{platformAdvantages[0].number} / {platformAdvantages[0].eyebrow}</span>
              <h3>{platformAdvantages[0].title}</h3>
              <p>{platformAdvantages[0].summary}</p>
            </div>
            <figure className={styles.automationFlow} data-motion-role="visual">
              <Image
                src="/media/platform-advantages/business-data-flow.png"
                alt="业务明细数据经过统一模型自动完成数据归集、因子匹配、排放计算与结果分析"
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
                <span>{platformAdvantages[1].number} / {platformAdvantages[1].eyebrow}</span>
                <h3>{platformAdvantages[1].title}</h3>
              </div>
              <p>{platformAdvantages[1].summary}</p>
              <ul className={styles.analysisUseCases}>
                {platformAdvantages[1].points.map((point) => <li key={point}>{point}</li>)}
              </ul>
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
                <figcaption><span>01</span>三大主流标准体系，一套数据多标准输出</figcaption>
              </figure>
              <div className={styles.analysisEvidenceMosaic}>
                <figure>
                  <Image src="/media/platform-advantages/reuse-activity-data.png" alt="排放总量、活动数据、温室气体构成与碳排放强度四类关键成果" width={5491} height={3367} sizes="(max-width: 780px) calc(100vw - 36px), 340px" />
                  <figcaption><span>02</span>沉淀四大类关键数据成果</figcaption>
                </figure>
                <figure>
                  <Image src="/media/platform-advantages/reuse-trend-analysis.png" alt="支持年度、月份、单位、因子与工厂切换的多维交互分析" width={5491} height={3379} sizes="(max-width: 780px) calc(100vw - 36px), 340px" />
                  <figcaption><span>03</span>多维度、交互式呈现分析结果</figcaption>
                </figure>
                <figure>
                  <Image src="/media/platform-advantages/reuse-baseline-analysis.png" alt="企业温室气体排放基准年管理与对比分析界面" width={5491} height={3369} sizes="(max-width: 780px) calc(100vw - 36px), 340px" />
                  <figcaption><span>04</span>内置基准年管理与对比分析</figcaption>
                </figure>
              </div>
            </div>
          </article>

          <article className={styles.advantageTraceability} data-motion-group="platform-advantage">
            <figure data-motion-role="visual">
              <Image
                src="/media/platform-advantages/traceability-module-map.png"
                alt="平台覆盖排放源、活动数据、排放因子和核算结果的全链路追溯体系"
                width={2169}
                height={1495}
                sizes="(max-width: 780px) calc(100vw - 72px), 620px"
              />
            </figure>
            <div data-motion-role="copy">
              <span>{platformAdvantages[2].number} / {platformAdvantages[2].eyebrow}</span>
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

export function PlatformProductPage({ page }: ProductPageProps) {
  return (
    <>
      <section className={styles.platformHero}>
        <div className={styles.container}>
          <div className={styles.platformHeroCopy}>
            <p className={styles.eyebrow}>企业碳管理数字化平台</p>
            <h1>{page.title}</h1>
            <p className={styles.heroSummary}>{page.summary}</p>
            <div className={styles.platformHeroActions}>
              <Link className={styles.platformHeroLink} href="/enterprise">
                进入公开体验页 <ExternalLink size={18} aria-hidden="true" />
              </Link>
              <Link className={styles.platformSecondaryLink} href={platformTrialUrl}>申请试用账号</Link>
            </div>
            <p className={styles.demoSafety}>公开体验页与企业生产数据完全隔离，不连接现有业务系统。</p>
          </div>
          <ProductVisual page={page} />
        </div>
      </section>

      <section className={styles.principleBand} aria-labelledby="platform-principles-title">
        <div className={styles.principleInner}>
          <header>
            <span>PLATFORM FOUNDATION</span>
            <h2 id="platform-principles-title">统一的碳管理底座</h2>
            <p>数据、核算、分析和管理应用共用同一套口径，减少重复维护。</p>
          </header>
          <ol className={styles.principleGrid}>
            {platformPrinciples.map((principle, index) => {
              const PrincipleIcon = principle.icon;
              return (
                <li key={principle.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <PrincipleIcon size={25} strokeWidth={1.6} aria-hidden="true" />
                  <strong>{principle.title}</strong>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <PlatformOverview items={platformOverviewItems} />

      <ProductMediaGallery
        eyebrow="PLATFORM SCREENSHOTS"
        title="从数据维护到多维分析的真实界面"
        description="7 张平台截图按实际使用顺序呈现；点击主图可查看原始 4K 分辨率。"
        items={platformScreenshots}
      />

      <section className={`${styles.platformVideo} ${styles.container}`} aria-labelledby="platform-video-title">
        <header className={styles.sectionHeading}>
          <span>VIDEO INTRODUCTION</span>
          <h2 id="platform-video-title">3 分钟了解平台工作方式</h2>
          <p>通过真实操作画面了解数据维护、核算分析与管理应用。</p>
        </header>
        <video
          controls
          preload="metadata"
          poster={`${materialRoot}/产品/平台截图/2.png`}
          src={`${materialRoot}/产品/企业碳管理数字化平台简介.mp4`}
        >
          您的浏览器暂不支持视频播放。
        </video>
      </section>

      <section className={`${styles.publicDemo} ${styles.container}`} id="power-bi" aria-labelledby="public-demo-title">
        <div>
          <span>PUBLIC DEMO</span>
          <h2 id="public-demo-title">先看平台，再申请试用</h2>
          <p>公开体验页展示平台首页和 Power BI 分析界面，不包含生产数据；需要完整功能时可申请独立试用账号。</p>
        </div>
        <div className={styles.publicDemoActions}>
          <Link href={powerBiPublicUrl}>查看 Power BI 公共报表 <ExternalLink size={17} aria-hidden="true" /></Link>
          <Link href="/enterprise"><PlayCircle size={17} aria-hidden="true" />进入平台体验页</Link>
          <Link href={platformTrialUrl}>申请试用账号 <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>

      <ProductResources product="platform" />
      <PageCta title={page.title} />
    </>
  );
}
