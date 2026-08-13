import {
  ArrowRight,
  BarChart3,
  Check,
  Database,
  FileCheck2,
  Layers3,
  Network,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReferenceDiagram } from "@/components/reference-diagram";
import type { Subpage, SubpageSection } from "@/lib/cms-content";
import { isAllowedContentHref, isRuntimeManagedImage } from "@/lib/media-url";
import styles from "./service-page.module.css";

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

type ServiceProfile = {
  marker: string;
  lead: string;
  suitableFor: string[];
  tasks: Array<{ title: string; description: string }>;
  steps: Array<{ title: string; description: string }>;
  deliverables: string[];
};

const serviceProfiles: Record<string, ServiceProfile> = {
  "service-capability-path": {
    marker: "CAPABILITY ROADMAP",
    lead: "先识别企业当前能力阶段，再配置适合的工具、方法与运营机制。",
    suitableFor: ["首次启动碳核算", "已有核算但口径不统一", "需要集团协同管理", "准备进行数字化升级"],
    tasks: [
      { title: "核算基础", description: "明确组织边界、排放源、活动数据和适用标准。" },
      { title: "数据治理", description: "统一数据来源、责任分工、填报口径与校核规则。" },
      { title: "管理应用", description: "把核算成果用于披露、分析、履约和低碳决策。" },
      { title: "持续运营", description: "建立年度更新、过程复核和数据持续沉淀机制。" },
    ],
    steps: [
      { title: "阶段诊断", description: "判断企业处于认知、实操、体系建设或平台运营阶段。" },
      { title: "路径设计", description: "确定培训、Excel 工具、咨询实施与平台建设的组合。" },
      { title: "能力落地", description: "围绕真实业务数据完成方法、工具与组织协同建设。" },
      { title: "持续升级", description: "从一次性核算逐步走向可复核、可分析、可运营。" },
    ],
    deliverables: ["企业碳管理能力诊断", "分阶段建设路线图", "核算与数据工作机制", "持续运营建议"],
  },
  "service-training-consulting": {
    marker: "TRAINING & CONSULTING",
    lead: "以企业真实核算任务为载体，让方法培训、数据梳理与过程复核形成一个闭环。",
    suitableFor: ["缺少内部核算人员", "首次开展温室气体核算", "集团需要统一核算口径", "核算成果需要支撑披露"],
    tasks: [
      { title: "标准培训", description: "讲解 GHG Protocol、ISO14064 与国标要求。" },
      { title: "边界梳理", description: "结合组织结构和业务活动识别核算范围。" },
      { title: "数据辅导", description: "明确数据来源、填报责任与过程校核方法。" },
      { title: "成果复核", description: "检查计算逻辑、因子应用与成果完整性。" },
    ],
    steps: [
      { title: "需求确认", description: "确定核算场景、参与团队、成果用途和实施范围。" },
      { title: "培训赋能", description: "统一方法认知，并结合企业案例开展实操演练。" },
      { title: "咨询实施", description: "协同完成数据采集、模型配置、核算与过程校核。" },
      { title: "成果移交", description: "交付核算成果、工作底稿和后续更新清单。" },
    ],
    deliverables: ["核算方法培训课程", "企业数据采集清单", "核算报表与工作底稿", "内部核算工作指引"],
  },
  "service-platform-delivery": {
    marker: "PLATFORM DELIVERY",
    lead: "围绕企业组织、数据和核算规则实施平台，让系统真正进入日常管理流程。",
    suitableFor: ["多组织数据集中管理", "人工核算维护成本较高", "需要多维分析与追溯", "希望形成长期数字化能力"],
    tasks: [
      { title: "数据模型", description: "统一组织、排放源、活动数据与排放因子结构。" },
      { title: "核算引擎", description: "配置标准、计算规则、口径和多年度核算逻辑。" },
      { title: "业务协同", description: "建立填报、审核、汇总与异常处理流程。" },
      { title: "分析应用", description: "配置总量、强度、趋势和组织对标等管理视图。" },
    ],
    steps: [
      { title: "业务蓝图", description: "梳理组织范围、业务流程、角色权限与管理目标。" },
      { title: "平台配置", description: "搭建数据模型、因子库、核算规则与分析口径。" },
      { title: "数据上线", description: "完成初始化、业务验证、用户培训与试运行。" },
      { title: "运营支持", description: "支持年度更新、规则维护、问题处理与持续优化。" },
    ],
    deliverables: ["企业碳数据模型", "平台配置与部署成果", "用户操作与管理规范", "持续运营支持机制"],
  },
};

const taskIcons = [Layers3, ShieldCheck, Network, BarChart3];

export function ServicePage({ page }: { page: Subpage }) {
  const visuals = page.sections.flatMap((section) => section.items.filter((item) => item.image).map((item) => ({ ...item, eyebrow: section.title || page.eyebrow })));
  const profile = serviceProfiles[page.slug] ?? serviceProfiles["service-capability-path"];
  const overviewSection = getSection(page, "service-overview");
  const tasksSection = getSection(page, "service-tasks");
  const stepsSection = getSection(page, "service-steps");
  const deliverablesSection = getSection(page, "service-deliverables");
  const ctaSection = getSection(page, "service-cta");
  const ctaAction = ctaSection?.items[0];
  const ctaHref = isAllowedContentHref(ctaAction?.value) ? ctaAction?.value : undefined;
  const overviewItems = overviewSection?.items ?? titleItems(profile.suitableFor);
  const taskItems = tasksSection?.items ?? profile.tasks;
  const stepItems = stepsSection?.items ?? profile.steps;
  const deliverableItems = deliverablesSection?.items ?? titleItems(profile.deliverables);

  return (
    <>
      <section className={`${styles.hero} ${styles[`hero-${page.slug}`] ?? ""} page-reveal`}>
        <Image className={styles.heroImage} src={page.image} alt="" fill priority sizes="100vw" unoptimized={isRuntimeManagedImage(page.image)} data-motion="hero-visual" />
        <div className={styles.heroShade} />
        <div className={styles.heroTitle} data-motion="hero-copy">
          <p>{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className={styles.heroSummary}>{page.summary}</p>
        </div>
      </section>

      <section className={`${styles.serviceOverview} page-reveal`} aria-labelledby="service-overview-title" data-motion-group="service-overview">
        <header data-motion-role="heading">
          <span>服务定位</span>
          <h2 id="service-overview-title">{overviewSection?.title ?? profile.lead}</h2>
          {overviewSection?.description ? <p>{overviewSection.description}</p> : null}
        </header>
        <div className={styles.suitablePanel} data-motion-role="item">
          <div><UsersRound size={25} aria-hidden="true" /><strong>适用企业</strong></div>
          <ul>{overviewItems.map((item, index) => <li key={`${item.title}-${index}`}><Check size={15} aria-hidden="true" /><div><strong>{item.title}</strong>{item.description ? <p>{item.description}</p> : null}<ItemDetails item={item} /></div></li>)}</ul>
        </div>
      </section>

      <section className={styles.taskBand} aria-labelledby="service-tasks-title" data-motion-group="service-grid">
        <div className={styles.taskBandInner}>
          <header data-motion-role="heading">
            <span>核心服务</span>
            <h2 id="service-tasks-title">{tasksSection?.title ?? "围绕企业实际工作组织实施"}</h2>
            {tasksSection?.description ? <p>{tasksSection.description}</p> : null}
          </header>
          <div className={styles.taskGrid}>
            {taskItems.map((task, index) => {
              const Icon = taskIcons[index % taskIcons.length];
              return <article key={`${task.title}-${index}`} data-motion-role="item"><span>{String(index + 1).padStart(2, "0")}</span><Icon size={25} aria-hidden="true" /><h3>{task.title}</h3>{task.description ? <p>{task.description}</p> : null}<ItemDetails item={task} /></article>;
            })}
          </div>
        </div>
      </section>

      <section className={`${styles.deliveryFlow} page-reveal`} aria-labelledby="delivery-flow-title" data-motion-group="service-path">
        <header data-motion-role="heading">
          <span>实施路径</span>
          <h2 id="delivery-flow-title">{stepsSection?.title ?? "从需求确认到持续运行"}</h2>
          {stepsSection?.description ? <p>{stepsSection.description}</p> : null}
        </header>
        <ol>{stepItems.map((step, index) => <li key={`${step.title}-${index}`} data-motion-role="item"><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3>{step.description ? <p>{step.description}</p> : null}<ItemDetails item={step} /></div>{index < stepItems.length - 1 ? <ArrowRight size={18} aria-hidden="true" /> : null}</li>)}</ol>
      </section>

      {visuals.map((visual) => <ReferenceDiagram key={visual.title} eyebrow={visual.eyebrow} title={visual.title} description={visual.description ?? ""} src={visual.image!} alt={visual.title} />)}

      <section className={`${styles.deliverables} page-reveal`} aria-labelledby="service-deliverables-title" data-motion-group="service-deliverables">
        <div className={styles.deliverableHeading} data-motion-role="heading"><FileCheck2 size={30} aria-hidden="true" /><span>核心交付成果</span><h2 id="service-deliverables-title">{deliverablesSection?.title ?? "让实施成果能够继续使用和更新"}</h2>{deliverablesSection?.description ? <p>{deliverablesSection.description}</p> : null}</div>
        <ol>{deliverableItems.map((item, index) => <li key={`${item.title}-${index}`} data-motion-role="item"><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong>{item.description ? <p>{item.description}</p> : null}<ItemDetails item={item} /></div><Check size={18} aria-hidden="true" /></li>)}</ol>
      </section>

      <section className={`${styles.cta} page-reveal`} aria-label="联系顾问" data-motion="cta">
        <div><Database size={24} aria-hidden="true" /><span>{ctaSection?.description || "下一步"}</span><h2>{ctaSection?.title || `咨询${page.title}`}</h2></div>
        {ctaHref ? <Link href={ctaHref}>{ctaAction?.title || "联系顾问"}<ArrowRight size={18} aria-hidden="true" /></Link> : <span className={styles.ctaUnavailable} aria-disabled="true">{ctaAction?.title || "联系顾问"}</span>}
      </section>
    </>
  );
}
