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
  Home,
  Layers3,
  Network,
  RefreshCw,
  ShieldCheck,
  Waypoints
} from "lucide-react";
import Link from "next/link";
import type { Subpage } from "@/lib/cms-content";
import { ReferenceDiagram } from "@/components/reference-diagram";
import styles from "./solution-pages.module.css";

type SolutionPageProps = { page: Subpage };

function Breadcrumb({ label }: { label: string }) {
  return (
    <nav className={styles.breadcrumb} aria-label="面包屑">
      <Link href="/">
        <Home aria-hidden="true" size={14} />
        首页
      </Link>
      <span aria-hidden="true">/</span>
      <span>{label}</span>
    </nav>
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
      <section className={styles.standardHero}>
        <div className={styles.standardHeroInner}>
          <div className={`${styles.standardHeroCopy} page-reveal`}>
            <Breadcrumb label={page.navLabel} />
            <span className={styles.kicker}>CARBON ACCOUNTING PROGRAM</span>
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
          </div>
          <aside className={`${styles.courseBrief} page-reveal`} aria-label="培训成果概览">
            <div className={styles.courseBriefTitle}>
              <GraduationCap aria-hidden="true" size={28} />
              <div>
                <span>培训成果</span>
                <strong>把标准转化为企业可执行的方法</strong>
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
          <span>LEARNING PATH</span>
          <h2 id="standard-path-title">从统一认知到独立核算</h2>
          <p>围绕企业真实组织边界、活动数据与核算口径组织培训，让学习成果直接进入日常工作。</p>
        </header>
        <ol>
          {page.steps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{step}</strong>
                <p>{index === 0 ? "明确参与人员、现有基础与本次培训目标。" : index === 1 ? "结合适用标准理解组织边界、运营边界与核算原则。" : index === 2 ? "用企业场景完成数据维护、因子匹配和结果校核。" : "形成可复用的台账、方法与内部协作机制。"}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <ReferenceDiagram
        eyebrow="METHOD REFERENCE"
        title="标准化流程图：把方法落实到每一笔活动数据"
        description="以原始参考图呈现从活动数据、排放因子到核算成果的标准化关系，培训现场可直接结合该结构开展讲解。"
        src="/media/reference-diagrams/data-modeling-flow.svg"
        alt="企业温室气体核算数据建模流程图"
      />

      <section className={styles.curriculum} aria-labelledby="curriculum-title">
        <div className={`${styles.curriculumIntro} page-reveal`}>
          <BookOpenCheck aria-hidden="true" size={34} />
          <span>课程目录</span>
          <h2 id="curriculum-title">标准、工具与案例组成一套完整课程</h2>
          <p>课程内容既覆盖核算依据，也保留足够的实操时间，适合企业内部统一方法和培养执行人员。</p>
        </div>
        <div className={styles.curriculumList}>
          {page.features.map((feature, index) => (
            <article className="page-reveal" key={feature}>
              <span>MODULE {String(index + 1).padStart(2, "0")}</span>
              <h3>{feature}</h3>
              <Check aria-hidden="true" size={18} />
            </article>
          ))}
        </div>
      </section>

      <ContactAction title="为企业安排一套可落地的核算培训" />
    </>
  );
}

export function PracticalPage({ page }: SolutionPageProps) {
  return (
    <>
      <section className={styles.practicalHero}>
        <div className={styles.practicalHeroInner}>
          <div className={`${styles.practicalHeroCopy} page-reveal`}>
            <Breadcrumb label={page.navLabel} />
            <span className={styles.kicker}>FIRST INVENTORY WORKSHOP</span>
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
              <strong>可复核</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.inventoryFlow} page-reveal`} aria-labelledby="inventory-flow-title">
        <div className={styles.flowHeading}>
          <span>WORKFLOW</span>
          <h2 id="inventory-flow-title">首次核算的四道连续工序</h2>
        </div>
        <ol>
          {page.steps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
              <small>{index === 0 ? "确认组织与运营边界" : index === 1 ? "补齐来源与凭证信息" : index === 2 ? "统一计算规则" : "形成可持续更新的成果"}</small>
            </li>
          ))}
        </ol>
      </section>

      <ReferenceDiagram
        eyebrow="IMPLEMENTATION ROUTE"
        title="敏捷实施技术路线：每一步都有可校核的输出"
        description="参考图将项目中的准备、建模、核算与交付连接起来，和实战营的工作节奏一一对应。"
        src="/media/reference-diagrams/agile-implementation.svg"
        alt="企业温室气体核算敏捷实施技术路线图"
      />

      <section className={styles.deliverySection} aria-labelledby="delivery-title">
        <div className={`${styles.deliveryHeading} page-reveal`}>
          <span>DELIVERABLES</span>
          <h2 id="delivery-title">项目过程中同步校核，交付后可以继续使用</h2>
          <p>不是一次性的结果计算，而是将企业核算所需的数据结构、计算规则和复核方法一并留下。</p>
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

      <ContactAction title="从企业真实数据开始第一次完整核算" />
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
      <section className={styles.consultingHero}>
        <div className={`${styles.consultingHeroInner} page-reveal`}>
          <Breadcrumb label={page.navLabel} />
          <span className={styles.kicker}>GROUP ACCOUNTING SYSTEM</span>
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
          <span>ORGANIZATION</span>
          <h2 id="organization-title">集团统一核算架构</h2>
          <p>统一规则由集团沉淀，核算工作在各层级有序开展，最终形成可追溯的集团数据。</p>
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
        eyebrow="GROUP PATH"
        title="集团与分子公司的实施路径"
        description="保留参考图中的分层推进关系，帮助管理者快速确认集团与各组织单元的协作边界。"
        src="/media/reference-diagrams/group-implementation.svg"
        alt="集团和分子公司实施路径图"
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

      <ContactAction title="建立适合集团组织方式的统一核算体系" />
    </>
  );
}

export function PlatformSolutionPage({ page }: SolutionPageProps) {
  return (
    <>
      <section className={styles.platformHero}>
        <div className={styles.platformHeroInner}>
          <div className={`${styles.platformHeroCopy} page-reveal`}>
            <Breadcrumb label={page.navLabel} />
            <span className={styles.kicker}>CONTINUOUS CARBON OPERATIONS</span>
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
          <span>GOVERNANCE LAYERS</span>
          <h2 id="platform-layers-title">从底层数据到管理决策的四层体系</h2>
          <p>数据只维护一次，由统一核算引擎承接不同标准、组织和年度的计算与分析。</p>
        </div>
        <div className={`${styles.layerStack} page-reveal`}>
          <div><span>04</span><strong>管理应用层</strong><small>趋势、强度、基准年与经营决策</small></div>
          <div><span>03</span><strong>核算分析层</strong><small>多标准核算与多维结果分析</small></div>
          <div><span>02</span><strong>数据治理层</strong><small>边界、排放源、因子与校核规则</small></div>
          <div><span>01</span><strong>业务数据层</strong><small>多组织、多年度活动数据持续沉淀</small></div>
        </div>
      </section>

      <ReferenceDiagram
        eyebrow="GOVERNANCE REFERENCE"
        title="碳数据治理与标准体系"
        description="将数据标准、核算逻辑与管理应用放在同一张参考图中，明确持续运营的治理基础。"
        src="/media/reference-diagrams/carbon-data-governance.svg"
        alt="碳数据治理与标准体系图"
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

      <ContactAction title="把一次核算升级为可持续运营的管理能力" />
    </>
  );
}
