import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ProductMediaGallery, type ProductMediaItem } from "@/components/product-media-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHomeContent } from "@/lib/cms-content";
import styles from "./platform-demo.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "企业碳管理数字化平台公开体验",
  description: "查看企业碳管理数字化平台首页与Power BI公开分析界面。",
};

const materialRoot = "/materials/20260803/资料20260803/产品";
const powerBiPublicUrl = process.env.NEXT_PUBLIC_POWER_BI_PUBLIC_URL?.trim() || "#power-bi";
const platformTrialUrl = process.env.NEXT_PUBLIC_PLATFORM_TRIAL_URL?.trim() || "/#contact";

const powerBiScreens: ProductMediaItem[] = Array.from({ length: 6 }, (_, index) => ({
  src: `${materialRoot}/平台截图/${index + 2}.png`,
  alt: `Power BI企业碳排放分析公开界面${index + 1}`,
  label: ["分析首页", "分析目录", "排放总览", "排放明细", "趋势分析", "强度分析"][index],
  width: 3840,
  height: 2040,
}));

export default async function PlatformDemoPage() {
  const home = await getHomeContent();

  return (
    <>
      <SiteHeader content={home} />
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div>
              <span>PUBLIC EXPERIENCE</span>
              <h1>企业碳管理数字化平台</h1>
              <p>无需登录即可查看平台首页与 Power BI 分析界面。公开体验内容不连接生产数据，也不包含任何客户信息。</p>
              <div className={styles.actions}>
                <Link href={powerBiPublicUrl}>查看 Power BI 公共报表 <ExternalLink size={17} aria-hidden="true" /></Link>
                <Link href={platformTrialUrl}>申请试用账号 <ArrowRight size={17} aria-hidden="true" /></Link>
              </div>
            </div>
            <div className={styles.safety}>
              <ShieldCheck size={30} aria-hidden="true" />
              <strong>隔离体验环境</strong>
              <p>仅展示公开演示内容，与现有平台和企业生产环境完全隔离。</p>
            </div>
          </div>
        </section>

        <section className={styles.platformHome} aria-labelledby="platform-home-title">
          <header>
            <span>PLATFORM HOME</span>
            <h2 id="platform-home-title">平台数据管理首页</h2>
            <p>统一维护组织、排放源、活动数据、排放因子与核算任务。</p>
          </header>
          <a href={`${materialRoot}/平台截图/1.png`} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${materialRoot}/平台截图/1.png`} alt="企业碳管理数字化平台数据维护首页" width={3840} height={2040} />
            <span>点击查看 4K 原图</span>
          </a>
        </section>

        <div id="power-bi">
          <ProductMediaGallery
            eyebrow="POWER BI PUBLIC VIEW"
            title="Power BI 公共分析视图"
            description="切换查看排放总览、明细、趋势和强度分析；所有画面均为公开演示数据。"
            items={powerBiScreens}
          />
        </div>

        <section className={styles.trial}>
          <div>
            <span>NEXT STEP</span>
            <h2>申请独立试用账号</h2>
            <p>提交企业名称、联系人和希望体验的功能，我们将根据使用场景配置试用范围。</p>
          </div>
          <Link href={platformTrialUrl}>提交试用申请 <ArrowRight size={18} aria-hidden="true" /></Link>
        </section>
      </main>
      <SiteFooter footer={home.footer} />
    </>
  );
}
