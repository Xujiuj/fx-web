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
const platformFeatureIcons: LucideIcon[] = [Database, Gauge, Network, BarChart3];

function PageCta({ title }: { title: string }) {
  return (
    <section className={`${styles.cta} page-reveal`} aria-labelledby="product-contact-title">
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
        <Image className={styles.heroBackdrop} src="/media/product-excel-hero.webp" alt="" fill priority sizes="100vw" />
        <div className={styles.container}>
          <div className={`${styles.excelHeroCopy} page-reveal`}>
            <p className={styles.eyebrow}>Excel 温室气体核算工具</p>
            <h1>{page.title}</h1>
            <p className={styles.heroSummary}>{page.summary}</p>
            <div className={styles.heroActions}>
              <Link href="/#contact">咨询适用版本</Link>
            </div>
            <dl className={styles.heroMetrics}>
              {page.metrics.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className={`${styles.versionSection} ${styles.container} page-reveal`} aria-labelledby="excel-version-title">
        <header className={styles.sectionHeading}>
          <span>ORGANIZATION EDITIONS</span>
          <h2 id="excel-version-title">匹配不同组织规模的核算方式</h2>
          <p>从单一法人独立核算，到多层级组织统一汇总，保持核算逻辑和数据口径一致。</p>
        </header>
        <div className={styles.versionCompare}>
          <article>
            <div className={styles.versionNumber}>01</div>
            <Building2 size={28} aria-hidden="true" />
            <h3>单公司版</h3>
            <p>面向单一法人或独立核算主体，完成边界配置、活动数据维护与核算结果输出。</p>
            <ul>
              <li><CheckCircle2 size={16} aria-hidden="true" />独立建立核算台账</li>
              <li><CheckCircle2 size={16} aria-hidden="true" />持续积累多年数据</li>
            </ul>
          </article>
          <div className={styles.compareAxis} aria-hidden="true">
            <span>统一口径</span>
            <i />
            <span>按需升级</span>
          </div>
          <article>
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

      <section className={styles.functionBand} aria-labelledby="excel-function-title">
        <div className={styles.container}>
          <header className={styles.sectionHeading}>
            <span>FUNCTION MAP</span>
            <h2 id="excel-function-title">把核算方法落实到可持续使用的工具中</h2>
          </header>
          <div className={styles.functionGrid}>
            {page.features.map((feature, index) => {
              const FeatureIcon = excelFeatureIcons[index % excelFeatureIcons.length];
              return (
                <article className="page-reveal" key={feature}>
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
        src="/media/reference-diagrams/excel-standard-flow.svg"
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
        <Image className={styles.heroBackdrop} src="/media/product-platform-hero.webp" alt="" fill priority sizes="100vw" />
        <div className={styles.container}>
          <div className={`${styles.platformHeroCopy} page-reveal`}>
            <p className={styles.eyebrow}>企业碳管理数字化平台</p>
            <h1>{page.title}</h1>
            <p className={styles.heroSummary}>{page.summary}</p>
            <Link className={styles.platformHeroLink} href="/#contact">
              预约平台演示 <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.capabilityStrip} page-reveal`} aria-label="平台核心能力">
        <div className={styles.container}>
          {page.features.map((feature, index) => {
            const FeatureIcon = platformFeatureIcons[index % platformFeatureIcons.length];
            return (
              <article key={feature}>
                <FeatureIcon size={25} strokeWidth={1.7} aria-hidden="true" />
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{feature}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <section className={`${styles.architecture} ${styles.container} page-reveal`} aria-labelledby="platform-architecture-title">
        <header className={styles.sectionHeading}>
          <span>PLATFORM ARCHITECTURE</span>
          <h2 id="platform-architecture-title">一套贯穿数据、核算、分析与管理的业务架构</h2>
          <p>以统一数据模型承接日常业务数据，通过集中核算引擎形成多口径结果，并持续服务管理决策。</p>
        </header>
        <div className={styles.architectureMap}>
          <div className={styles.architectureCore}>
            <Database size={32} strokeWidth={1.6} aria-hidden="true" />
            <strong>统一碳数据体系</strong>
            <span>一次维护 · 持续沉淀</span>
          </div>
          <div className={styles.architectureLayers}>
            <article>
              <span>01</span><Layers3 size={23} aria-hidden="true" /><strong>数据基础</strong>
              <p>统一管理排放边界、排放源、活动数据与排放因子。</p>
            </article>
            <article>
              <span>02</span><Workflow size={23} aria-hidden="true" /><strong>核算引擎</strong>
              <p>集中执行核算逻辑，支持组织、年度与口径灵活切换。</p>
            </article>
            <article>
              <span>03</span><LineChart size={23} aria-hidden="true" /><strong>分析体系</strong>
              <p>围绕总量、气体类型、排放强度与趋势开展多维分析。</p>
            </article>
            <article>
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
        src="/media/reference-diagrams/platform-architecture.svg"
        alt="企业碳管理平台功能架构图"
      />

      <section className={styles.dataFlow} aria-labelledby="platform-flow-title">
        <div className={styles.container}>
          <div className={`${styles.flowHeading} page-reveal`}>
            <span>DATA FLOW</span>
            <h2 id="platform-flow-title">让数据沿着统一链路持续流动</h2>
            <p>每一步都围绕企业已有管理基础展开，形成可复核、可追溯、可持续运营的数据闭环。</p>
          </div>
          <ol className="page-reveal">
            {page.steps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step}</strong>
                  <small>{index === 0 ? "边界 · 排放源 · 数据结构" : index === 1 ? "标准 · 口径 · 排放因子" : index === 2 ? "组织协同 · 数据维护" : "核算 · 分析 · 管理应用"}</small>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${styles.analysisSection} ${styles.container} page-reveal`} aria-labelledby="platform-analysis-title">
        <header>
          <span>MANAGEMENT INSIGHT</span>
          <h2 id="platform-analysis-title">从核算结果走向多维管理分析</h2>
        </header>
        <div className={styles.analysisGrid}>
          <article className={styles.analysisPrimary}>
            <BarChart3 size={30} aria-hidden="true" />
            <h3>排放总量与趋势</h3>
            <p>按组织与年度观察排放变化，为基准年管理和持续改善提供数据依据。</p>
            <div className={styles.miniBars} aria-hidden="true">
              {[38, 55, 47, 72, 64, 82].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
            </div>
          </article>
          <article><Gauge size={27} aria-hidden="true" /><h3>排放强度</h3><p>结合企业业务口径开展强度分析。</p></article>
          <article><Network size={27} aria-hidden="true" /><h3>组织对标</h3><p>在统一口径下比较不同组织与工厂。</p></article>
          <article><ShieldCheck size={27} aria-hidden="true" /><h3>结果追溯</h3><p>从分析结果回溯数据来源和核算过程。</p></article>
        </div>
      </section>

      <PageCta title={page.title} />
    </>
  );
}
