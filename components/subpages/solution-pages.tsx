import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileCheck2,
  FileSpreadsheet,
  GraduationCap,
  Layers3,
  Network,
  RefreshCw,
  ShieldCheck,
  Waypoints
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Subpage } from "@/lib/cms-content";
import { ReferenceDiagram } from "@/components/reference-diagram";
import styles from "./solution-pages.module.css";

type SolutionPageProps = { page: Subpage };

const solutionHeroArt = {
  training: {
    src: "/media/solution-training-generated.png",
    alt: "企业碳核算方法的层叠抽象视觉"
  },
  practical: {
    src: "/media/solution-platform-generated.png",
    alt: "企业活动数据到核算成果的抽象流程视觉"
  },
  consulting: {
    src: "/media/solution-consulting-generated.png",
    alt: "集团多组织协同核算的抽象网络视觉"
  },
  platform: {
    src: "/media/solution-practical-generated.png",
    alt: "企业碳数据持续运营的抽象生态视觉"
  }
} as const;

function SolutionHeroArt({ variant }: { variant: keyof typeof solutionHeroArt }) {
  const art = solutionHeroArt[variant];

  return (
    <figure className={styles.solutionHeroVisual}>
      <Image src={art.src} alt={art.alt} fill priority sizes="100vw" />
    </figure>
  );
}

function ContactAction({ title }: { title: string }) {
  return (
    <section className={`${styles.contactAction} page-reveal`} aria-label="业务咨询">
      <div>
        <span>下一步</span>
        <h2>{title}</h2>
      </div>
      <Link href="/#contact">
        联系顾问
        <ArrowRight aria-hidden="true" size={17} />
      </Link>
    </section>
  );
}

export function TrainingPage({ page }: SolutionPageProps) {
  return (
    <>
      <section className={`${styles.standardHero} ${styles.solutionHero} ${styles.solutionHeroLight}`}>
        <SolutionHeroArt variant="training" />
        <div className={styles.standardHeroInner}>
          <div className={`${styles.standardHeroCopy} page-reveal`}>
            <span className={styles.kicker}>温室气体核算培训</span>
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
          </div>
          <aside className={`${styles.courseBrief} page-reveal`} aria-label="培训成果概览">
            <div className={styles.courseBriefTitle}>
              <GraduationCap aria-hidden="true" size={28} />
              <div>
              <span>培训收获</span>
              <strong>让核算方法进入企业日常工作</strong>
              </div>
            </div>
            <dl>
              {page.metrics.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section className={`${styles.standardPath} page-reveal`} aria-labelledby="standard-path-title">
        <header>
          <span>培训安排</span>
          <h2 id="standard-path-title">把培训内容落到实际工作</h2>
          <p>围绕企业组织边界、活动数据和核算口径开展讲解与演练，帮助参与人员明确后续工作的做法。</p>
        </header>
        <ol>
          {page.steps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{step}</strong>
                <p>{index === 0 ? "明确参与人员、现有基础和本次培训范围。" : index === 1 ? "结合适用标准梳理组织边界、排放源和数据来源。" : index === 2 ? "用企业实际场景完成数据维护、因子匹配和结果复核。" : "形成后续核算可直接使用的工作清单和台账要求。"}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <ReferenceDiagram
        eyebrow="核算方法"
        title="温室气体核算的数据建模流程"
        description="以活动数据、排放因子、计算规则和核算结果为主线，说明企业开展核算时需要建立的数据关系。"
        src="/media/reference-diagrams/data-modeling-flow.svg"
        alt="企业温室气体核算数据建模流程图"
      />

      <section className={styles.curriculum} aria-labelledby="curriculum-title">
        <div className={`${styles.curriculumIntro} page-reveal`}>
          <BookOpenCheck aria-hidden="true" size={34} />
          <span>课程目录</span>
          <h2 id="curriculum-title">围绕企业实际工作的课程安排</h2>
          <p>课程覆盖核算依据、数据准备和结果复核，并结合企业场景安排实操演练。</p>
        </div>
        <div className={styles.curriculumList}>
          {page.features.map((feature, index) => (
            <article className="page-reveal" key={feature}>
              <span>课程 {String(index + 1).padStart(2, "0")}</span>
              <h3>{feature}</h3>
              <Check aria-hidden="true" size={18} />
            </article>
          ))}
        </div>
      </section>

      <ContactAction title="为企业安排温室气体核算培训" />
    </>
  );
}

export function PracticalPage({ page }: SolutionPageProps) {
  return (
    <>
      <section className={`${styles.practicalHero} ${styles.solutionHero} ${styles.solutionHeroDark}`}>
        <SolutionHeroArt variant="practical" />
        <div className={styles.practicalHeroInner}>
          <div className={`${styles.practicalHeroCopy} page-reveal`}>
            <span className={styles.kicker}>首次核算实施</span>
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
          </div>
          <div className={`${styles.workbench} page-reveal`} aria-label="实战营工作流概览">
            <div className={styles.workbenchSheet}>
              <FileSpreadsheet aria-hidden="true" size={30} />
              <span>活动数据台账</span>
              <i />
              <i />
              <i />
            </div>
            <ArrowRight className={styles.workbenchArrow} aria-hidden="true" size={24} />
            <div className={styles.workbenchResult}>
              <ClipboardCheck aria-hidden="true" size={30} />
              <span>核算成果</span>
              <strong>结果可复核</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.inventoryFlow} page-reveal`} aria-labelledby="inventory-flow-title">
        <div className={styles.flowHeading}>
          <span>实施步骤</span>
          <h2 id="inventory-flow-title">完成首次核算的工作安排</h2>
        </div>
        <ol>
          {page.steps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
              <small>{index === 0 ? "确认组织范围和核算边界" : index === 1 ? "补齐数据来源与凭证信息" : index === 2 ? "核对排放因子与计算规则" : "交付可用于后续更新的核算结果"}</small>
            </li>
          ))}
        </ol>
      </section>

      <ReferenceDiagram
        eyebrow="实施流程"
        title="首次核算的实施步骤"
        description="从项目准备、数据建模到成果交付，明确各阶段的工作事项和交付结果。"
        src="/media/reference-diagrams/agile-implementation.svg"
        alt="企业温室气体核算实施流程图"
      />

      <section className={styles.deliverySection} aria-labelledby="delivery-title">
        <div className={`${styles.deliveryHeading} page-reveal`}>
          <span>交付内容</span>
          <h2 id="delivery-title">项目完成后可继续使用的核算基础</h2>
          <p>除核算结果外，项目还会整理数据结构、计算规则和复核要求，便于企业后续年度更新。</p>
        </div>
        <div className={styles.deliveryRows}>
          {page.features.map((feature, index) => (
            <article className="page-reveal" key={feature}>
              <div>
                {index === 0 ? <ClipboardCheck aria-hidden="true" /> : index === 1 ? <FileSpreadsheet aria-hidden="true" /> : index === 2 ? <RefreshCw aria-hidden="true" /> : <FileCheck2 aria-hidden="true" />}
                <h3>{feature}</h3>
              </div>
              <p>{index === 0 ? "明确数据责任、来源与维护频率。" : index === 1 ? "承载企业边界、因子与计算逻辑。" : index === 2 ? "支持后续年度沿用同一套数据结构。" : "覆盖范围一、范围二及适用的范围三排放。"}</p>
              <CheckCircle2 aria-label="已包含" size={20} />
            </article>
          ))}
        </div>
      </section>

      <ContactAction title="从企业现有数据开始首次核算" />
    </>
  );
}

export function ConsultingPage({ page }: SolutionPageProps) {
  const responsibilities = [
    { role: "集团管理中心", duty: "制定组织边界、核算口径与汇总规则" },
    { role: "分子公司", duty: "按统一模板维护活动数据并完成独立核算" },
    { role: "复核与披露", duty: "完成集团汇总、数据复核与对外信息支撑" }
  ];

  return (
    <>
      <section className={`${styles.consultingHero} ${styles.solutionHero} ${styles.solutionHeroLight}`}>
        <SolutionHeroArt variant="consulting" />
        <div className={`${styles.consultingHeroInner} page-reveal`}>
          <span className={styles.kicker}>集团核算建设</span>
          <h1>{page.title}</h1>
          <p>{page.summary}</p>
          <dl>
            {page.metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={`${styles.organization} page-reveal`} aria-labelledby="organization-title">
        <header>
          <span>组织分工</span>
          <h2 id="organization-title">集团与成员企业的核算分工</h2>
          <p>集团负责统一规则和汇总要求，成员企业负责数据维护与本单位核算，共同形成可追溯的集团数据。</p>
        </header>
        <div className={styles.organizationTree}>
          <div className={styles.organizationRoot}>
            <Building2 aria-hidden="true" size={26} />
            <span>集团管理中心</span>
          </div>
          <div className={styles.organizationTrunk} aria-hidden="true" />
          <div className={styles.organizationBranches}>
            {page.features.map((feature, index) => (
              <article key={feature}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{feature}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ReferenceDiagram
        eyebrow="集团协同"
        title="集团与成员企业的核算实施路径"
        description="呈现集团与成员企业在口径制定、数据报送、汇总复核中的协同关系。"
        src="/media/reference-diagrams/group-implementation.svg"
        alt="集团与成员企业温室气体核算实施路径图"
      />

      <section className={styles.responsibilitySection} aria-labelledby="responsibility-title">
        <div className={`${styles.responsibilityHeading} page-reveal`}>
          <Network aria-hidden="true" size={34} />
          <span>职责矩阵</span>
          <h2 id="responsibility-title">每一级组织都清楚数据由谁维护、结果由谁负责</h2>
        </div>
        <div className={styles.responsibilityMatrix}>
          {responsibilities.map((item, index) => (
            <article className="page-reveal" key={item.role}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.role}</h3>
              <p>{item.duty}</p>
              <small>{page.steps[index] ?? page.steps.at(-1)}</small>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.consultingStages} page-reveal`} aria-labelledby="consulting-stages-title">
        <h2 id="consulting-stages-title">体系落地阶段</h2>
        <ol>
          {page.steps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </section>

      <ContactAction title="建立适合集团组织方式的核算体系" />
    </>
  );
}

export function PlatformSolutionPage({ page }: SolutionPageProps) {
  return (
    <>
      <section className={`${styles.platformHero} ${styles.solutionHero} ${styles.solutionHeroLight}`}>
        <SolutionHeroArt variant="platform" />
        <div className={styles.platformHeroInner}>
          <div className={`${styles.platformHeroCopy} page-reveal`}>
            <span className={styles.kicker}>碳数据管理平台</span>
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
          </div>
          <div className={`${styles.operationsHub} page-reveal`} aria-label="企业碳数据持续运营闭环">
            <div className={styles.hubCore}>
              <Database aria-hidden="true" size={30} />
              <span>统一数据体系</span>
            </div>
            {page.features.map((feature, index) => (
              <div className={styles[`hubNode${index + 1}`]} key={feature}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{feature}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.platformLayers} aria-labelledby="platform-layers-title">
        <div className={`${styles.platformLayersIntro} page-reveal`}>
          <Layers3 aria-hidden="true" size={36} />
          <span>平台结构</span>
          <h2 id="platform-layers-title">从业务数据到管理分析的四层结构</h2>
          <p>企业统一维护基础数据，平台按照不同标准、组织和年度完成核算与分析。</p>
        </div>
        <div className={`${styles.layerStack} page-reveal`}>
          <div><span>04</span><strong>管理应用层</strong><small>趋势、强度、基准年与经营决策</small></div>
          <div><span>03</span><strong>核算分析层</strong><small>多标准核算与多维结果分析</small></div>
          <div><span>02</span><strong>数据治理层</strong><small>边界、排放源、因子与校核规则</small></div>
          <div><span>01</span><strong>业务数据层</strong><small>多组织、多年度活动数据持续沉淀</small></div>
        </div>
      </section>

      <ReferenceDiagram
        eyebrow="数据治理"
        title="企业碳数据治理框架"
        description="将数据标准、核算规则和管理应用纳入统一体系，为日常维护和管理分析提供清晰基础。"
        src="/media/reference-diagrams/carbon-data-governance.svg"
        alt="企业碳数据治理框架图"
      />

      <section className={`${styles.platformRoadmap} page-reveal`} aria-labelledby="platform-roadmap-title">
        <div>
          <Waypoints aria-hidden="true" size={32} />
          <h2 id="platform-roadmap-title">建设与运营阶段</h2>
        </div>
        <ol>
          {page.steps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
              {index === page.steps.length - 1 ? <ShieldCheck aria-hidden="true" size={20} /> : <ArrowRight aria-hidden="true" size={20} />}
            </li>
          ))}
        </ol>
      </section>

      <ContactAction title="为企业建设可持续使用的碳数据管理平台" />
    </>
  );
}
