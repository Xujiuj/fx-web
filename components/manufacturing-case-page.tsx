import { BarChart3, Boxes, ChartNoAxesCombined, UsersRound } from "lucide-react";
import Image from "next/image";
import styles from "./manufacturing-case-page.module.css";

const caseModules = [
  {
    title: "温室气体核算",
    description: "围绕固定燃烧、外购电力和生产过程数据，明确组织与运营边界，形成可复核的温室气体核算基础。",
    icon: ChartNoAxesCombined,
    image: "/media/manufacturing-carbon-accounting.png"
  },
  {
    title: "活动数据治理",
    description: "梳理能源、原辅料、生产与运输等活动数据的来源、责任人和维护频率，建立统一的数据口径。",
    icon: UsersRound,
    image: "/media/manufacturing-carbon-governance.png"
  },
  {
    title: "碳数据分析",
    description: "通过总量、强度、基准年和趋势分析，帮助企业识别重点排放环节，为减排管理和披露准备提供依据。",
    icon: Boxes,
    image: "/media/manufacturing-carbon-analytics.png"
  },
  {
    title: "持续运营管理",
    description: "以 Excel 核算工具或数字化平台支持多年度更新、集团汇总和过程追溯，让碳管理成为持续可用的业务能力。",
    icon: BarChart3,
    image: "/media/manufacturing-carbon-operations.png"
  }
];

function HeroArtwork() {
  return (
    <div className={styles.heroArtwork} aria-hidden="true">
      <Image
        src="/media/manufacturing-carbon-case-hero-warm.png"
        alt=""
        fill
        priority
        sizes="(max-width: 760px) calc(100vw - 32px), 1120px"
      />
    </div>
  );
}

function CaseArtwork({ image, title }: Pick<(typeof caseModules)[number], "image" | "title">) {
  return (
    <div className={styles.caseArtwork}>
      <Image src={image} alt={title} fill sizes="(max-width: 760px) calc(100vw - 32px), 650px" />
    </div>
  );
}

export function ManufacturingCasePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="manufacturing-case-title">
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <p>INDUSTRY CASE</p>
            <h1 id="manufacturing-case-title">制造行业</h1>
            <span>企业碳管理数字化</span>
          </div>
          <HeroArtwork />
        </div>
      </section>

      <section className={styles.introduction} aria-labelledby="manufacturing-introduction-title">
        <h2 id="manufacturing-introduction-title" className="sr-only">制造企业碳管理服务</h2>
        <p>我们面向制造企业提供温室气体核算、碳管理体系建设与数字化平台服务，围绕生产环节、能源消耗和工厂边界建立清晰的数据基础，支持企业开展核算、分析与持续管理。</p>
        <p>方案以统一的数据模型、核算规则和分析体系为基础，整合活动数据与排放因子，实现一次维护、多口径核算和多维度分析；同时保留数据来源与计算过程，确保结果可追溯、可复核。</p>
      </section>

      <section className={styles.applications} aria-labelledby="manufacturing-applications-title">
        <div className={styles.sectionHeading}>
          <p>应用场景</p>
          <h2 id="manufacturing-applications-title">围绕碳管理，连接关键业务数据</h2>
        </div>
        <div className={styles.caseList}>
          {caseModules.map(({ title, description, icon: Icon, image }, index) => (
            <article className={styles.caseItem} key={title}>
              <CaseArtwork image={image} title={title} />
              <div className={styles.caseCopy}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon size={22} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
