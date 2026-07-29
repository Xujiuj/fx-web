"use client";

import { useState } from "react";
import { Alert, Button, Card, Col, Descriptions, Form, Image, Input, Modal, Row, Space, Tabs, Typography, Upload, type UploadProps } from "antd";
import { DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import { ModalForm, ProFormList, ProFormSelect, ProFormText, ProFormTextArea, ProTable, type ProColumns } from "@ant-design/pro-components";
import type { HomeContent, IconKey, NavItem, NewsItem, PartnerItem, SiteContentBundle, Subpage } from "@/lib/cms-content";

type Resource = "brand" | "menu" | "home" | "solutions" | "products" | "proof" | "pages";
type RowItem = { id: string };
type MenuRow = NavItem & RowItem;
type NewsRow = NewsItem & RowItem;
type HeroRow = HomeContent["heroSlides"][number] & RowItem;
type AboutRow = HomeContent["aboutTabs"][number] & RowItem;
type TimelineRow = HomeContent["timeline"][number] & RowItem;
type ProductRow = HomeContent["products"][number] & RowItem;
type CertificateRow = { id: string; image: string };
type PartnerRow = PartnerItem & RowItem;
type PageRow = Subpage & RowItem;

const copy: Record<Resource, { title: string; description: string }> = {
  brand: { title: "品牌信息", description: "维护站点名称、Logo 与品牌主页链接。" },
  menu: { title: "菜单管理", description: "通过数据表管理前台主导航和二级菜单。" },
  home: { title: "首页内容", description: "各首页区块分别以数据表方式维护。" },
  solutions: { title: "解决方案与动态", description: "解决方案和资讯内容分表管理。" },
  products: { title: "产品中心", description: "管理产品卡片及其前台跳转链接。" },
  proof: { title: "资质与伙伴", description: "管理资质证书和合作伙伴，未配置时前台保留空白。" },
  pages: { title: "页面管理", description: "以独立记录维护业务子页面内容。" }
};

function MediaPreview({ src, alt, width = 96, height = 64 }: { src?: string; alt: string; width?: number; height?: number }) {
  if (!src) return <div style={{ width, height, display: "grid", placeItems: "center", gap: 2, color: "#8c8c8c", border: "1px dashed #d9d9d9", borderRadius: 6, fontSize: 12 }}><PictureOutlined /><span>未上传</span></div>;
  return <Image src={src} alt={alt} width={width} height={height} style={{ objectFit: "cover", borderRadius: 6, border: "1px solid #f0f0f0" }} preview={{ mask: "预览" }} />;
}

function ImageUploadField({ name, label, required = false, hint = "支持 JPG、PNG、WebP 或 GIF，文件不超过 5MB。" }: { name: string; label: string; required?: boolean; hint?: string }) {
  const form = Form.useFormInstance();
  const imagePath = Form.useWatch(name, form) as string | undefined;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const upload: UploadProps["customRequest"] = (options) => {
    void (async () => {
      setUploading(true);
      setUploadError("");
      try {
        const data = new FormData();
        data.append("file", options.file as File);
        const response = await fetch("/api/admin/media", { method: "POST", body: data });
        const result = await response.json();
        if (!response.ok || typeof result.path !== "string") throw new Error(result.error || "图片上传失败");
        form.setFieldValue(name, result.path);
        options.onSuccess?.(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "图片上传失败";
        setUploadError(message);
        options.onError?.(new Error(message));
      } finally {
        setUploading(false);
      }
    })();
  };
  return <><Form.Item name={name} hidden rules={required ? [{ required: true, message: `请上传${label}` }] : []}><Input /></Form.Item><Form.Item label={label} required={required} extra={hint} validateStatus={uploadError ? "error" : undefined} help={uploadError || undefined}><Space align="start" size="middle"><MediaPreview src={imagePath} alt={label} width={128} height={84} /><Space direction="vertical" size={8}><Upload accept="image/jpeg,image/png,image/webp,image/gif" showUploadList={false} maxCount={1} customRequest={upload}><Button icon={<UploadOutlined />} loading={uploading}>{imagePath ? "更换图片" : "上传图片"}</Button></Upload>{imagePath ? <Button type="link" danger icon={<DeleteOutlined />} onClick={() => form.setFieldValue(name, "")}>移除图片</Button> : null}</Space></Space></Form.Item></>;
}

function CrudTable<T extends RowItem>({ title, rows, columns, createItem, onCreate, onUpdate, onDelete, children, busy }: {
  title: string;
  rows: T[];
  columns: ProColumns<T>[];
  createItem: () => T;
  onCreate: (item: T) => Promise<void>;
  onUpdate: (item: T) => Promise<void>;
  onDelete: (item: T) => Promise<void>;
  children: React.ReactNode;
  busy: boolean;
}) {
  const [editing, setEditing] = useState<T | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const actionColumn: ProColumns<T> = { title: "操作", valueType: "option", width: 120, render: (_, record) => [<Button key="edit" type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditing(record); setIsNew(false); }}>编辑</Button>, <Button key="delete" type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => setDeleteTarget(record)}>删除</Button>] };
  return <><ProTable<T> rowKey="id" headerTitle={title} dataSource={rows} loading={busy} search={false} columns={[...columns, actionColumn]} options={{ density: true, fullScreen: true, reload: false, setting: true }} pagination={{ pageSize: 10, showSizeChanger: true }} toolBarRender={() => [<Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(createItem()); setIsNew(true); }}>新增</Button>]} /><ModalForm<T> key={`${isNew}-${editing?.id ?? "closed"}`} title={isNew ? `新增${title}` : `编辑${title}`} open={Boolean(editing)} initialValues={editing ?? undefined} modalProps={{ destroyOnHidden: true, onCancel: () => setEditing(null) }} submitter={{ searchConfig: { submitText: "保存" }, submitButtonProps: { loading: busy } }} onFinish={async (values) => { if (!editing) return false; const next = { ...editing, ...values } as T; if (isNew) await onCreate(next); else await onUpdate(next); setEditing(null); return true; }}>{children}</ModalForm><Modal title="确认删除" open={Boolean(deleteTarget)} okText="删除" okButtonProps={{ danger: true, loading: busy }} cancelText="取消" onCancel={() => setDeleteTarget(null)} onOk={async () => { if (!deleteTarget) return; await onDelete(deleteTarget); setDeleteTarget(null); }}>删除后会立即同步到前台，此操作不可撤销。</Modal></>;
}

export function AdminContentResource({ resource, initialContent }: { resource: Resource; initialContent: SiteContentBundle }) {
  const [home, setHome] = useState(initialContent.home);
  const [subpages, setSubpages] = useState(initialContent.subpages);
  const [versions, setVersions] = useState(initialContent.versions);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function persist(nextHome: HomeContent, nextSubpages: Subpage[]) {
    setBusy(true); setMessage(""); setError("");
    const response = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ home: nextHome, subpages: nextSubpages, versions }) });
    const result = await response.json();
    if (response.status === 409 && result.current) { setHome(result.current.home); setSubpages(result.current.subpages); setVersions(result.current.versions); setError("内容已被其他管理员更新，已重新载入最新版本。"); setBusy(false); return; }
    if (!response.ok) { setError(result.error || "保存失败"); setBusy(false); return; }
    setHome(nextHome); setSubpages(nextSubpages); setVersions(result.versions); setMessage("操作已保存。"); setBusy(false);
  }
  const changeHome = (update: (current: HomeContent) => HomeContent) => persist(update(home), subpages);
  const changePages = (update: (current: Subpage[]) => Subpage[]) => persist(home, update(subpages));
  const current = copy[resource];
  return <Space direction="vertical" size="large" style={{ width: "100%", padding: "24px 24px 56px" }}><Space direction="vertical" size={0}><Typography.Title level={2} style={{ margin: 0 }}>{current.title}</Typography.Title><Typography.Text type="secondary">{current.description}</Typography.Text></Space><Button icon={<ReloadOutlined />} onClick={() => window.location.reload()} disabled={busy}>重新载入</Button>{message ? <Alert type="success" message={message} showIcon /> : null}{error ? <Alert type="error" message={error} showIcon /> : null}{resource === "brand" ? <BrandManager home={home} onCommit={changeHome} busy={busy} /> : null}{resource === "menu" ? <MenuManager home={home} onCommit={changeHome} busy={busy} /> : null}{resource === "home" ? <HomeManager home={home} onCommit={changeHome} busy={busy} /> : null}{resource === "solutions" ? <SolutionsManager home={home} onCommit={changeHome} busy={busy} /> : null}{resource === "products" ? <ProductsManager home={home} onCommit={changeHome} busy={busy} /> : null}{resource === "proof" ? <ProofManager home={home} onCommit={changeHome} busy={busy} /> : null}{resource === "pages" ? <PagesManager pages={subpages} onCommit={changePages} busy={busy} /> : null}</Space>;
}

function BrandManager({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<void>; busy: boolean }) {
  const [open, setOpen] = useState(false);
  return <><Card title="当前品牌"><Descriptions column={1} items={[{ key: "name", label: "品牌名称", children: home.brand.name }, { key: "logo", label: "Logo", children: <MediaPreview src={home.brand.logo} alt="品牌 Logo" width={180} height={72} /> }, { key: "href", label: "主页链接", children: home.brand.href }]} /><Button type="primary" icon={<EditOutlined />} onClick={() => setOpen(true)}>编辑</Button></Card><ModalForm open={open} title="编辑品牌信息" initialValues={home.brand} modalProps={{ destroyOnHidden: true, onCancel: () => setOpen(false) }} submitter={{ submitButtonProps: { loading: busy } }} onFinish={async (values) => { await onCommit((current) => ({ ...current, brand: { ...current.brand, ...values } })); setOpen(false); return true; }}><ProFormText name="name" label="品牌名称" rules={[{ required: true }]} /><ImageUploadField name="logo" label="品牌 Logo" required hint="建议上传透明背景 PNG 或 SVG 以外的 JPG、PNG、WebP、GIF 图片。" /><ProFormText name="href" label="主页链接" rules={[{ required: true }]} /></ModalForm></>;
}

function MenuManager({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<void>; busy: boolean }) {
  const rows: MenuRow[] = home.navItems.map((item, index) => ({ ...item, id: String(index) }));
  return <CrudTable title="主导航" rows={rows} busy={busy} columns={[{ title: "菜单名称", dataIndex: "label" }, { title: "链接", dataIndex: "href" }, { title: "二级菜单", dataIndex: "children", renderText: (children) => children?.length ?? 0 }]} createItem={() => ({ id: crypto.randomUUID(), label: "", href: "/", children: [] })} onCreate={(item) => onCommit((current) => ({ ...current, navItems: [...current.navItems, omitId(item)] }))} onUpdate={(item) => onCommit((current) => ({ ...current, navItems: current.navItems.map((entry, index) => String(index) === item.id ? omitId(item) : entry) }))} onDelete={(item) => onCommit((current) => ({ ...current, navItems: current.navItems.filter((_, index) => String(index) !== item.id) }))}><ProFormText name="label" label="菜单名称" rules={[{ required: true }]} /><ProFormText name="href" label="链接" rules={[{ required: true }]} /><ProFormList name="children" label="二级菜单" creatorButtonProps={{ creatorButtonText: "新增二级菜单" }}><Row gutter={12}><Col span={8}><ProFormText name="label" label="名称" rules={[{ required: true }]} /></Col><Col span={8}><ProFormText name="href" label="链接" rules={[{ required: true }]} /></Col><Col span={8}><ProFormText name="group" label="下拉分组" /></Col></Row></ProFormList></CrudTable>;
}

function HomeManager({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<void>; busy: boolean }) {
  return <Tabs items={[{ key: "hero", label: "首页横幅", children: <HeroTable home={home} onCommit={onCommit} busy={busy} /> }, { key: "about", label: "公司介绍", children: <AboutTable home={home} onCommit={onCommit} busy={busy} /> }, { key: "timeline", label: "能力路径", children: <TimelineTable home={home} onCommit={onCommit} busy={busy} /> }]} />;
}

function HeroTable({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<void>; busy: boolean }) {
  const rows: HeroRow[] = home.heroSlides.map((item, index) => ({ ...item, id: String(index) }));
  return <CrudTable title="轮播图" rows={rows} busy={busy} columns={[{ title: "标题", dataIndex: "title" }, { title: "按钮", dataIndex: "cta" }, { title: "配图", dataIndex: "image", render: (_, record) => <MediaPreview src={record.image} alt={record.title || "轮播图"} /> }]} createItem={() => ({ id: crypto.randomUUID(), eyebrow: "", title: "", description: "", image: "/media/fengxing-hero-accounting.png", cta: "了解更多" })} onCreate={(item) => onCommit((current) => ({ ...current, heroSlides: [...current.heroSlides, omitId(item)] }))} onUpdate={(item) => onCommit((current) => ({ ...current, heroSlides: current.heroSlides.map((entry, index) => String(index) === item.id ? omitId(item) : entry) }))} onDelete={(item) => onCommit((current) => ({ ...current, heroSlides: current.heroSlides.filter((_, index) => String(index) !== item.id) }))}><ProFormText name="eyebrow" label="副标题" /><ProFormText name="title" label="主标题" rules={[{ required: true }]} /><ProFormTextArea name="description" label="描述" rules={[{ required: true }]} /><ProFormText name="cta" label="按钮文字" /><ImageUploadField name="image" label="轮播配图" required hint="建议使用横向企业场景图，推荐比例 16:9。" /></CrudTable>;
}

function AboutTable({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<void>; busy: boolean }) {
  const rows: AboutRow[] = home.aboutTabs.map((item, index) => ({ ...item, id: String(index) }));
  return <CrudTable title="介绍页签" rows={rows} busy={busy} columns={[{ title: "页签", dataIndex: "label" }, { title: "标题", dataIndex: "title" }, { title: "标识", dataIndex: "kicker" }]} createItem={() => ({ id: crypto.randomUUID(), value: `tab-${Date.now()}`, label: "", title: "", kicker: "", body: "" })} onCreate={(item) => onCommit((current) => ({ ...current, aboutTabs: [...current.aboutTabs, omitId(item)] }))} onUpdate={(item) => onCommit((current) => ({ ...current, aboutTabs: current.aboutTabs.map((entry, index) => String(index) === item.id ? omitId(item) : entry) }))} onDelete={(item) => onCommit((current) => ({ ...current, aboutTabs: current.aboutTabs.filter((_, index) => String(index) !== item.id) }))}><ProFormText name="value" label="页签标识" rules={[{ required: true }]} /><ProFormText name="label" label="页签名称" rules={[{ required: true }]} /><ProFormText name="title" label="标题" rules={[{ required: true }]} /><ProFormText name="kicker" label="英文标识" /><ProFormTextArea name="body" label="正文" rules={[{ required: true }]} /></CrudTable>;
}

function TimelineTable({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<void>; busy: boolean }) {
  const rows: TimelineRow[] = home.timeline.map((item, index) => ({ ...item, id: String(index), itemsText: item.items.join("\n") } as TimelineRow & { itemsText: string }));
  return <CrudTable title="能力阶段" rows={rows} busy={busy} columns={[{ title: "阶段", dataIndex: "year" }, { title: "内容", dataIndex: "items", renderText: (items) => items.join(" / ") }]} createItem={() => ({ id: crypto.randomUUID(), year: "", items: [], itemsText: "" } as TimelineRow & { itemsText: string })} onCreate={(item) => onCommit((current) => ({ ...current, timeline: [...current.timeline, { year: item.year, items: String((item as unknown as { itemsText: string }).itemsText).split("\n").filter(Boolean) }] }))} onUpdate={(item) => onCommit((current) => ({ ...current, timeline: current.timeline.map((entry, index) => String(index) === item.id ? { year: item.year, items: String((item as unknown as { itemsText: string }).itemsText).split("\n").filter(Boolean) } : entry) }))} onDelete={(item) => onCommit((current) => ({ ...current, timeline: current.timeline.filter((_, index) => String(index) !== item.id) }))}><ProFormText name="year" label="阶段" rules={[{ required: true }]} /><ProFormTextArea name="itemsText" label="内容（每行一项）" rules={[{ required: true }]} /></CrudTable>;
}

function SolutionsManager({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<void>; busy: boolean }) {
  return <Tabs items={[{ key: "solutions", label: "解决方案", children: <NewsTable title="解决方案" items={home.solutionItems} image="/media/fengxing-hero-management.png" busy={busy} onCommit={(items) => onCommit((current) => ({ ...current, solutionItems: items }))} /> }, { key: "news", label: "最新动态", children: <NewsTable title="最新动态" items={home.newsItems} image="/media/fengxing-hero-management.png" busy={busy} onCommit={(items) => onCommit((current) => ({ ...current, newsItems: items }))} /> }]} />;
}

function NewsTable({ title, items, image, onCommit, busy }: { title: string; items: NewsItem[]; image: string; onCommit: (items: NewsItem[]) => Promise<void>; busy: boolean }) {
  const rows: NewsRow[] = items.map((item, index) => ({ ...item, id: String(index) }));
  return <CrudTable title={title} rows={rows} busy={busy} columns={[{ title: "标题", dataIndex: "title" }, { title: "副标题", dataIndex: "subtitle", renderText: (_, record) => record.subtitle ?? record.summary ?? record.action }, { title: "配图", dataIndex: "image", render: (_, record) => <MediaPreview src={record.image} alt={record.title || title} /> }, { title: "链接", dataIndex: "href" }]} createItem={() => ({ id: crypto.randomUUID(), title: "", action: "", subtitle: "", image, href: "/", summary: "" })} onCreate={(item) => onCommit([...items, omitId(item)])} onUpdate={(item) => onCommit(items.map((entry, index) => String(index) === item.id ? omitId(item) : entry))} onDelete={(item) => onCommit(items.filter((_, index) => String(index) !== item.id))}><ProFormText name="title" label="标题" rules={[{ required: true }]} /><ProFormText name="subtitle" label="副标题" /><ProFormText name="action" label="分类（选填）" /><ProFormText name="href" label="链接" rules={[{ required: true }]} /><ProFormTextArea name="summary" label="摘要（兼容旧内容）" /><ImageUploadField name="image" label="内容配图" required hint="建议使用清晰的横向或竖向活动照片。" /></CrudTable>;
}

function ProductsManager({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<void>; busy: boolean }) {
  const rows: ProductRow[] = home.products.map((item, index) => ({ ...item, id: String(index) }));
  return <CrudTable title="产品" rows={rows} busy={busy} columns={[{ title: "产品名称", dataIndex: "name" }, { title: "产品介绍", dataIndex: "summary" }, { title: "链接", dataIndex: "href" }]} createItem={() => ({ id: crypto.randomUUID(), name: "", summary: "", icon: "chart" as IconKey, href: "/" })} onCreate={(item) => onCommit((current) => ({ ...current, products: [...current.products, omitId(item)] }))} onUpdate={(item) => onCommit((current) => ({ ...current, products: current.products.map((entry, index) => String(index) === item.id ? omitId(item) : entry) }))} onDelete={(item) => onCommit((current) => ({ ...current, products: current.products.filter((_, index) => String(index) !== item.id) }))}><ProFormText name="name" label="产品名称" rules={[{ required: true }]} /><ProFormTextArea name="summary" label="产品介绍" rules={[{ required: true }]} /><ProFormText name="href" label="链接" rules={[{ required: true }]} /></CrudTable>;
}

function ProofManager({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<void>; busy: boolean }) {
  const certificates: CertificateRow[] = home.certificateImages.map((image, index) => ({ id: String(index), image })); const partners: PartnerRow[] = home.partners.map((partner, index) => ({ ...partner, id: String(index) }));
  return <Tabs items={[{ key: "certificates", label: "资质证书", children: <CrudTable title="证书" rows={certificates} busy={busy} columns={[{ title: "证书预览", dataIndex: "image", render: (_, record) => <MediaPreview src={record.image} alt="资质证书" width={72} height={96} /> }]} createItem={() => ({ id: crypto.randomUUID(), image: "" })} onCreate={(item) => onCommit((current) => ({ ...current, certificateImages: [...current.certificateImages, item.image] }))} onUpdate={(item) => onCommit((current) => ({ ...current, certificateImages: current.certificateImages.map((image, index) => String(index) === item.id ? item.image : image) }))} onDelete={(item) => onCommit((current) => ({ ...current, certificateImages: current.certificateImages.filter((_, index) => String(index) !== item.id) }))}><ImageUploadField name="image" label="证书图片" required hint="建议使用竖版证书扫描件或清晰电子证书。" /></CrudTable> }, { key: "partners", label: "合作伙伴", children: <CrudTable title="合作伙伴" rows={partners} busy={busy} columns={[{ title: "伙伴名称", dataIndex: "name" }, { title: "Logo 预览", dataIndex: "logo", render: (_, record) => <MediaPreview src={record.logo} alt={record.name || "伙伴 Logo"} width={144} height={58} /> }]} createItem={() => ({ id: crypto.randomUUID(), name: "", logo: "" })} onCreate={(item) => onCommit((current) => ({ ...current, partners: [...current.partners, omitId(item)] }))} onUpdate={(item) => onCommit((current) => ({ ...current, partners: current.partners.map((entry, index) => String(index) === item.id ? omitId(item) : entry) }))} onDelete={(item) => onCommit((current) => ({ ...current, partners: current.partners.filter((_, index) => String(index) !== item.id) }))}><ProFormText name="name" label="伙伴名称" rules={[{ required: true }]} /><ImageUploadField name="logo" label="伙伴 Logo" hint="未上传 Logo 时，前台会显示伙伴名称。" /></CrudTable> }]} />;
}

function PagesManager({ pages, onCommit, busy }: { pages: Subpage[]; onCommit: (update: (current: Subpage[]) => Subpage[]) => Promise<void>; busy: boolean }) {
  const rows: PageRow[] = pages.map((page, index) => ({ ...page, id: String(index) }));
  return <CrudTable
    title="业务子页面"
    rows={rows}
    busy={busy}
    columns={[
      { title: "页面名称", dataIndex: "navLabel" },
      { title: "版式", dataIndex: "layout" },
      { title: "URL 标识", dataIndex: "slug" },
      { title: "页面标题", dataIndex: "title" },
      { title: "页面配图", dataIndex: "image", render: (_, record) => <MediaPreview src={record.image} alt={record.title || record.navLabel} /> }
    ]}
    createItem={() => ({ id: crypto.randomUUID(), slug: "new-page", layout: "training" as const, navLabel: "新页面", eyebrow: "", title: "", summary: "", image: "/media/fengxing-hero-management.png", icon: "chart" as IconKey, metrics: [], features: [], steps: [], sections: [] })}
    onCreate={(item) => onCommit((current) => [...current, omitId(item)])}
    onUpdate={(item) => onCommit((current) => current.map((entry, index) => String(index) === item.id ? omitId(item) : entry))}
    onDelete={(item) => onCommit((current) => current.filter((_, index) => String(index) !== item.id))}
  >
    <ProFormText name="slug" label="URL 标识" rules={[{ required: true, pattern: /^[a-z0-9-]+$/, message: "仅可使用小写字母、数字和连字符" }]} />
    <ProFormSelect name="layout" label="页面版式" rules={[{ required: true }]} options={[
      { label: "培训课程", value: "training" }, { label: "核算实战", value: "practical" },
      { label: "集团咨询", value: "consulting" }, { label: "数字化方案", value: "solution-platform" },
      { label: "Excel 产品", value: "excel" }, { label: "平台产品", value: "product-platform" },
      { label: "客户案例", value: "cases" }, { label: "知识课堂", value: "knowledge" },
      { label: "企业介绍", value: "company" }, { label: "企业荣誉", value: "honors" },
      { label: "合作伙伴", value: "partners" }, { label: "联系我们", value: "contact" },
      { label: "实施服务", value: "service" }
    ]} />
    <ProFormText name="navLabel" label="导航名称" rules={[{ required: true }]} />
    <ProFormText name="title" label="页面标题" rules={[{ required: true }]} />
    <ProFormTextArea name="summary" label="页面摘要" rules={[{ required: true }]} />
    <ImageUploadField name="image" label="页面配图" required hint="建议上传与该页面业务内容相符的明亮企业场景图。" />
    <ProFormList name="features" label="核心内容" creatorButtonProps={{ creatorButtonText: "新增内容" }}><ProFormText rules={[{ required: true }]} /></ProFormList>
    <ProFormList name="steps" label="实施或阅读路径" creatorButtonProps={{ creatorButtonText: "新增步骤" }}><ProFormText rules={[{ required: true }]} /></ProFormList>
    <ProFormList name="sections" label="页面专属模块" creatorButtonProps={{ creatorButtonText: "新增模块" }}>
      <Row gutter={12}>
        <Col span={8}><ProFormText name="id" label="模块标识" rules={[{ required: true }]} /></Col>
        <Col span={8}><ProFormSelect name="kind" label="模块类型" rules={[{ required: true }]} options={["metrics", "capabilities", "process", "resources", "timeline", "gallery", "contacts"].map((value) => ({ label: value, value }))} /></Col>
        <Col span={8}><ProFormText name="title" label="模块标题" rules={[{ required: true }]} /></Col>
      </Row>
      <ProFormTextArea name="description" label="模块说明" />
      <ProFormList name="items" label="模块条目" creatorButtonProps={{ creatorButtonText: "新增条目" }}>
        <Row gutter={12}>
          <Col span={8}><ProFormText name="title" label="条目标题" rules={[{ required: true }]} /></Col>
          <Col span={8}><ProFormText name="description" label="条目说明" /></Col>
          <Col span={8}><ProFormText name="value" label="指标值" /></Col>
        </Row>
        <ImageUploadField name="image" label="条目图片或二维码" hint="荣誉页上传证书，伙伴页上传 Logo，联系页可上传二维码。" />
      </ProFormList>
    </ProFormList>
  </CrudTable>;
}

function omitId<T extends RowItem>(value: T): Omit<T, "id"> { const { id: _, ...rest } = value; return rest; }
