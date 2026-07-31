import {
  ArrowRight,
  Check,
  FileCheck2,
  Target,
  UsersRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { ReferenceDiagram } from "@/components/reference-diagram";
import type { Subpage } from "@/lib/cms-content";
import styles from "./solution-pages.module.css";

type SolutionPageProps = { page: Subpage };

type SolutionFramework = {
  sequence: string;
  title: string;
  summary: string;
  suitableFor: string;
  problem: string;
  deliverable: string;
  deliverableDescription: string;
  services: string[];
};

type SolutionDiagram = {
  eyebrow: string;
  title: string;
  description: string;
  src: string;
  alt: string;
};

const solutionFrameworks: Record<string, SolutionFramework> = {
  "solution-standard": {
    sequence: "01",
    title: "标准版（培训赋能）",
    summary: "帮助企业快速掌握温室气体核算方法。",
    suitableFor: "初步启动温室气体核算工作，对核算方法及标准认知尚浅，希望快速建立核算认知并在内部形成方法论共识的企业。",
    problem: "核算方法不清晰、标准理解不统一、核算边界与口径容易混乱。",
    deliverable: "《企业温室气体核算实操课程》",
    deliverableDescription: "帮助企业建立核算认知，掌握国家标准与核算方法，形成可延续的内部工作基础。",
    services: ["温室气体核算方法培训", "GHG Protocol培训", "ISO14064培训", "国标培训", "Excel实战演练", "企业案例解析"],
  },
  "solution-practical": {
    sequence: "02",
    title: "实战营（Excel单公司版）",
    summary: "帮助企业完成首次核算闭环。",
    suitableFor: "已开展核算工作但数据采集与计算流程尚未打通，迫切需要产出可信核算成果并形成可交付物的企业。",
    problem: "活动数据组织缺乏标准化，计算逻辑高度复杂，核算结果难以复核和持续更新。",
    deliverable: "《企业温室气体核算报表（Excel单公司版）》",
    deliverableDescription: "基于企业实际数据完成一次核算，形成可复用的核算成果、数据台账与工作模板。",
    services: ["数据采集梳理", "Excel工具部署", "Excel实操辅导", "过程校核", "问题诊断与闭环", "成果交付"],
  },
  "solution-consulting": {
    sequence: "03",
    title: "咨询版（Excel集团版）",
    summary: "建立集团统一核算管理体系。",
    suitableFor: "涵盖多个子公司或业务单元的集团型企业，需要建立统一核算体系并支撑ESG披露、碳信息披露及合规要求。",
    problem: "子公司核算口径不一致，集团层面无法有效汇总、复核与对标。",
    deliverable: "《企业温室气体核算报表（Excel集团版）》",
    deliverableDescription: "形成子公司独立核算、集团自动汇总的完整体系架构，为年度更新与披露准备提供统一基础。",
    services: ["集团组织边界梳理", "统一核算口径与模板", "单体公司核算模型部署", "集团汇总模型设计", "核算口径规范", "实施方案制定"],
  },
  "solution-platform": {
    sequence: "04",
    title: "平台版（数字化升级）",
    summary: "建设企业长期碳管理能力。",
    suitableFor: "已建立基础核算体系且管理成熟度较高，寻求通过数字化转型提升管理效能并建立长期碳数据资产沉淀能力的企业。",
    problem: "数据分散存储、人工维护成本高，缺乏自动化核算、持续分析与管理决策支持能力。",
    deliverable: "《企业碳管理数字化平台》",
    deliverableDescription: "构建统一数字化平台，实现碳数据集中管理、自动化核算、分析洞察与持续运营。",
    services: ["数据模型架构搭建", "平台系统部署", "自动化数据采集", "自动化核算", "分析洞察与管理模块", "持续运营支持"],
  },
};

const solutionDiagrams: Record<string, SolutionDiagram> = {
  "solution-standard": {
    eyebrow: "核算方法",
    title: "温室气体核算数据建模流程",
    description: "以活动数据、排放因子、计算规则和核算结果为主线，明确企业首次开展核算时需要建立的数据关系。",
    src: "/media/reference-diagrams/data-modeling-flow.svg",
    alt: "企业温室气体核算数据建模流程图",
  },
  "solution-practical": {
    eyebrow: "实施流程",
    title: "企业温室气体核算敏捷实施技术路线",
    description: "从项目准备、数据建模到成果交付，明确首次核算闭环各阶段的工作事项与交付结果。",
    src: "/media/reference-diagrams/agile-implementation.svg",
    alt: "企业温室气体核算敏捷实施技术路线图",
  },
  "solution-consulting": {
    eyebrow: "集团协同",
    title: "集团和分子公司实施路径",
    description: "呈现集团与分子公司在口径制定、数据报送、汇总复核中的协同关系。",
    src: "/media/reference-diagrams/group-implementation.svg",
    alt: "集团和分子公司温室气体核算实施路径图",
  },
  "solution-platform": {
    eyebrow: "数据治理",
    title: "企业碳数据治理与标准体系",
    description: "将数据标准、核算规则和管理应用纳入统一体系，支撑长期维护和持续分析。",
    src: "/media/reference-diagrams/carbon-data-governance.svg",
    alt: "企业碳数据治理与标准体系图",
  },
};

function getFramework(page: Subpage): SolutionFramework {
  return solutionFrameworks[page.slug] ?? {
    sequence: page.eyebrow.replace(/\D/g, "") || "01",
    title: page.title,
    summary: page.summary,
    suitableFor: "根据企业当前的核算阶段、数据基础与管理目标匹配服务范围。",
    problem: "针对数据分散、核算复杂、结果难追溯与价值难释放等问题建立解决路径。",
    deliverable: "企业温室气体核算与管理成果",
    deliverableDescription: "形成可复核、可使用并可持续更新的工作成果。",
    services: page.features,
  };
}

function SolutionDetailPage({ page }: SolutionPageProps) {
  const framework = getFramework(page);
  const diagram = solutionDiagrams[page.slug];

  return (
    <>
      <section className={styles.solutionDetailHero}>
        <div className={styles.solutionDetailHeroInner}>
          <div className={`${styles.solutionDetailHeroCopy} page-reveal`}>
            <span>解决方案 {framework.sequence}</span>
            <h1>{framework.title}</h1>
            <p>{framework.summary}</p>
          </div>
          <strong aria-hidden="true">{framework.sequence}</strong>
        </div>
      </section>

      <section className={`${styles.solutionFramework} page-reveal`} aria-labelledby="solution-framework-title">
        <header>
          <span>能力建设方案</span>
          <h2 id="solution-framework-title">从企业当前阶段出发，形成可持续使用的碳管理能力</h2>
        </header>
        <div className={styles.frameworkGrid}>
          <article>
            <UsersRound aria-hidden="true" size={28} />
            <h3>适用企业</h3>
            <p>{framework.suitableFor}</p>
          </article>
          <article>
            <Target aria-hidden="true" size={28} />
            <h3>核心解决问题</h3>
            <p>{framework.problem}</p>
          </article>
          <article className={styles.deliverableCard}>
            <FileCheck2 aria-hidden="true" size={28} />
            <h3>核心交付成果</h3>
            <strong>{framework.deliverable}</strong>
            <p>{framework.deliverableDescription}</p>
          </article>
        </div>
      </section>

      <section className={styles.serviceContents} aria-labelledby="service-contents-title">
        <div className={`${styles.serviceContentsInner} page-reveal`}>
          <header>
            <Wrench aria-hidden="true" size={30} />
            <div>
              <span>服务内容</span>
              <h2 id="service-contents-title">围绕成果交付组织实施工作</h2>
            </div>
          </header>
          <ol>
            {framework.services.map((service, index) => (
              <li key={service}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{service}</strong>
                <Check aria-hidden="true" size={18} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {diagram ? (
        <ReferenceDiagram
          eyebrow={diagram.eyebrow}
          title={diagram.title}
          description={diagram.description}
          src={page.media?.diagram ?? diagram.src}
          alt={diagram.alt}
        />
      ) : null}

      <section className={`${styles.solutionCta} page-reveal`} aria-label="联系顾问">
        <div>
          <span>下一步</span>
          <h2>讨论适合企业当前阶段的建设路径</h2>
        </div>
        <Link href="/#contact">
          联系顾问
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
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
