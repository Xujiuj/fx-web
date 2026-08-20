"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { App, Button, Card, Col, Descriptions, Image, Input, Menu, Modal, Row, Space, Spin, Tabs, Tag, Tooltip, Upload, type MenuProps, type UploadProps } from "antd";
import { DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import { ModalForm, PageContainer, ProFormDependency, ProFormDigit, ProFormItem, ProFormList, ProFormSelect, ProFormSwitch, ProFormText, ProFormTextArea, ProTable, type ProColumns } from "@ant-design/pro-components";
import { contentSlugPattern } from "@/lib/content-slug";
import type { HomeContent, NavItem, ProductItem, SiteContentBundle, Subpage } from "@/lib/cms-content";
import { toCurrentKnowledgeEntry, type KnowledgeEntry } from "@/lib/knowledge-content";
import { isHttpsContentUrl, isOptionalAllowedContentHref } from "@/lib/media-url";

export type AdminContentResourceName = "site" | "navigation" | "home" | "pages" | "knowledge";
type RowItem = { id: string };
type MenuRow = NavItem & RowItem;
type ProductRow = ProductItem & RowItem;
type HeroRow = HomeContent["heroSlides"][number] & RowItem;
type TimelineRow = HomeContent["timeline"][number] & RowItem;
type PageRow = Omit<Subpage, "media"> & RowItem & { mediaEntries: Array<{ key: string; path: string }> };
type KnowledgeRow = KnowledgeEntry & RowItem & { exists: boolean };
type UploadActivity = { active: number; begin: () => () => void };

const UploadActivityContext = createContext<UploadActivity>({ active: 0, begin: () => () => undefined });

function useUploadRequest() {
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);

  const createController = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller;
  }, []);

  const releaseController = useCallback((controller: AbortController) => {
    if (controllerRef.current === controller) controllerRef.current = null;
  }, []);

  return { createController, releaseController };
}

const copy: Record<AdminContentResourceName, { title: string; description: string }> = {
  site: { title: "全站设置", description: "维护当前官网使用的品牌、站点信息、联系信息与页脚。" },
  navigation: { title: "官网导航", description: "维护当前官网固定菜单的名称、链接和显示状态。" },
  home: { title: "官网首页", description: "维护当前首页横幅、内容栏目与能力路径。" },
  pages: { title: "业务页面", description: "按当前官网固定模板维护解决方案、产品、案例、服务和企业页面。" },
  knowledge: { title: "资源中心", description: "管理双碳专栏文章、视频课程、多级目录与详情页正文。" }
};

function optionalHrefRule(message: string, validate: (value: unknown) => boolean = isOptionalAllowedContentHref) {
  return {
    validator: (_: unknown, value: unknown) => validate(value) ? Promise.resolve() : Promise.reject(new Error(message)),
  };
}

function MediaPreview({ src, alt, width = 96, height = 64 }: { src?: string; alt: string; width?: number; height?: number }) {
  if (!src) return <div style={{ width, height, display: "grid", placeItems: "center", gap: 2, color: "#8c8c8c", border: "1px dashed #d9d9d9", borderRadius: 6, fontSize: 12 }}><PictureOutlined /><span>未上传</span></div>;
  return <Image src={src} alt={alt} width={width} height={height} style={{ objectFit: "cover", borderRadius: 6, border: "1px solid #f0f0f0" }} preview={{ mask: "预览" }} />;
}

function ImageUploadControl({ value, onChange, label }: { value?: string; onChange?: (path?: string) => void; label: string }) {
  const { begin } = useContext(UploadActivityContext);
  const { createController, releaseController } = useUploadRequest();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const upload: UploadProps["customRequest"] = (options) => {
    void (async () => {
      const release = begin();
      const controller = createController();
      setUploading(true);
      setUploadError("");
      try {
        const data = new FormData();
        data.append("file", options.file as File);
        const response = await fetch("/api/admin/media", { method: "POST", body: data, signal: controller.signal });
        const result = await response.json();
        if (!response.ok || typeof result.path !== "string") throw new Error(result.error || "图片上传失败");
        onChange?.(result.path);
        options.onSuccess?.(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "图片上传失败";
        setUploadError(message);
        options.onError?.(new Error(message));
      } finally {
        setUploading(false);
        releaseController(controller);
        release();
      }
    })();
  };
  return <Space direction="vertical" size={8} style={{ width: "100%" }}><Space align="start" size="middle" wrap><MediaPreview src={value} alt={label} width={128} height={84} /><Space direction="vertical" size={8}><Upload accept="image/jpeg,image/png,image/webp,image/gif" showUploadList={false} maxCount={1} customRequest={upload}><Button icon={<UploadOutlined />} loading={uploading}>{value ? "更换图片" : "上传图片"}</Button></Upload>{value ? <Button type="link" danger icon={<DeleteOutlined />} onClick={() => { setUploadError(""); onChange?.(undefined); }}>移除图片</Button> : null}</Space></Space>{uploadError ? <span role="alert" style={{ color: "#ff4d4f" }}>{uploadError}</span> : null}</Space>;
}

function ImageUploadField({ name, label, required = false, hint = "支持 JPG、PNG、WebP 或 GIF，文件不超过 5MB。" }: { name: string | string[]; label: string; required?: boolean; hint?: string }) {
  return <ProFormItem name={name} label={label} required={required} extra={hint} rules={required ? [{ required: true, message: `请上传${label}` }] : []}><ImageUploadControl label={label} /></ProFormItem>;
}

function DocumentUploadField({ value, onChange }: { value?: string; onChange?: (path: string | undefined) => void }) {
  const { begin } = useContext(UploadActivityContext);
  const { createController, releaseController } = useUploadRequest();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const upload: UploadProps["customRequest"] = (options) => {
    void (async () => {
      const release = begin();
      const controller = createController();
      setUploading(true);
      setUploadError("");
      try {
        const data = new FormData();
        data.append("file", options.file as File);
        const response = await fetch("/api/admin/media", { method: "POST", body: data, signal: controller.signal });
        const result = await response.json();
        if (!response.ok || typeof result.path !== "string") throw new Error(result.error || "资料上传失败");
        onChange?.(result.path);
        options.onSuccess?.(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "资料上传失败";
        setUploadError(message);
        options.onError?.(new Error(message));
      } finally {
        setUploading(false);
        releaseController(controller);
        release();
      }
    })();
  };
  return <Space direction="vertical" size={8}><Upload accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.7z,.rar" showUploadList={false} maxCount={1} customRequest={upload}><Button icon={<UploadOutlined />} loading={uploading}>{value ? "替换资料" : "上传资料"}</Button></Upload>{value ? <Space size={12}><a href={value} target="_blank" rel="noreferrer">检查已绑定资料</a><Button type="link" danger icon={<DeleteOutlined />} onClick={() => { setUploadError(""); onChange?.(undefined); }}>移除资料</Button></Space> : null}{uploadError ? <span role="alert" style={{ color: "#ff4d4f" }}>{uploadError}</span> : null}</Space>;
}

function VideoUploadControl({ value, onChange, addressLabel, addressHint }: { value?: string; onChange?: (path: string) => void; addressLabel: string; addressHint: string }) {
  const { begin } = useContext(UploadActivityContext);
  const { createController, releaseController } = useUploadRequest();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const upload: UploadProps["customRequest"] = (options) => {
    void (async () => {
      const release = begin();
      const controller = createController();
      setUploading(true);
      setUploadError("");
      try {
        const data = new FormData();
        data.append("file", options.file as File);
        const response = await fetch("/api/admin/media?kind=video", { method: "POST", body: data, signal: controller.signal });
        const result = await response.json();
        if (!response.ok || typeof result.path !== "string") throw new Error(result.error || "视频上传失败");
        onChange?.(result.path);
        options.onSuccess?.(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "视频上传失败";
        setUploadError(message);
        options.onError?.(new Error(message));
      } finally {
        setUploading(false);
        releaseController(controller);
        release();
      }
    })();
  };
  return <Space direction="vertical" size={10} style={{ width: "100%" }}><Upload accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.mov,.avi,.mkv" showUploadList={false} maxCount={1} customRequest={upload}><Button icon={<UploadOutlined />} loading={uploading}>{value ? "替换视频" : "上传视频"}</Button></Upload>{value ? <Space size={12} wrap><a href={value} target="_blank" rel="noreferrer">检查已绑定视频</a><Button type="link" danger icon={<DeleteOutlined />} onClick={() => { setUploadError(""); onChange?.(""); }}>移除视频</Button></Space> : null}<Space direction="vertical" size={4} style={{ width: "min(100%, 680px)" }}><span>{addressLabel}</span><Input aria-label={addressLabel} value={value ?? ""} placeholder="站内路径或完整的 https:// 媒体地址" onChange={(event) => { setUploadError(""); onChange?.(event.target.value); }} /><span style={{ color: "rgba(0, 0, 0, 0.45)", fontSize: 12 }}>{addressHint}</span></Space>{uploadError ? <span role="alert" style={{ color: "#ff4d4f" }}>{uploadError}</span> : null}</Space>;
}

function VideoUploadField({ name, label = "上传并绑定视频", addressLabel = "兼容视频地址（选填）", addressHint = "上传视频后系统会自动填写；也可保留已有站内视频路径或可直接播放的 https:// 媒体地址。" }: { name: string | string[]; label?: string; addressLabel?: string; addressHint?: string }) {
  return <ProFormItem name={name} label={label} extra="支持 MP4、WebM、MOV、AVI、MKV，最大 2GB。上传过程采用流式写盘，完成后自动压缩为网页播放格式；保存后前台会在站内播放器中播放。" rules={[optionalHrefRule("请输入站内路径或完整的 https:// 媒体地址")]}><VideoUploadControl addressLabel={addressLabel} addressHint={addressHint} /></ProFormItem>;
}

function CrudTable<T extends RowItem>({ title, rows, columns, createItem, onCreate, onUpdate, onDelete, children, busy, allowCreate = true, canDelete = () => true }: {
  title: string;
  rows: T[];
  columns: ProColumns<T>[];
  createItem: () => T;
  onCreate: (item: T) => Promise<boolean>;
  onUpdate: (item: T) => Promise<boolean>;
  onDelete: (item: T) => Promise<boolean>;
  children: React.ReactNode;
  busy: boolean;
  allowCreate?: boolean;
  canDelete?: (item: T) => boolean;
}) {
  const { active: activeUploads } = useContext(UploadActivityContext);
  const uploadLocked = activeUploads > 0;
  const [editing, setEditing] = useState<T | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const actionColumn: ProColumns<T> = { title: "操作", valueType: "option", width: 120, render: (_, record) => [<Button key="edit" type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditing(record); setIsNew(false); }}>编辑</Button>, canDelete(record) ? <Button key="delete" type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => setDeleteTarget(record)}>删除</Button> : null] };
  return <><ProTable<T> rowKey="id" headerTitle={title} dataSource={rows} loading={busy} search={false} columns={[...columns, actionColumn]} scroll={{ x: "max-content" }} options={{ density: true, fullScreen: true, reload: false, setting: true }} pagination={{ pageSize: 10, showSizeChanger: true }} toolBarRender={allowCreate ? () => [<Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(createItem()); setIsNew(true); }}>新增</Button>] : undefined} /><ModalForm<T> key={`${isNew}-${editing?.id ?? "closed"}`} title={isNew ? `新增${title}` : `编辑${title}`} open={Boolean(editing)} initialValues={editing ?? undefined} modalProps={{ className: "admin-editor-modal", destroyOnHidden: true, closable: !uploadLocked, keyboard: !uploadLocked, maskClosable: !uploadLocked, onCancel: () => { if (!uploadLocked) setEditing(null); } }} submitter={{ searchConfig: { submitText: uploadLocked ? "文件处理中" : "保存" }, submitButtonProps: { loading: busy || uploadLocked, disabled: uploadLocked }, resetButtonProps: { disabled: uploadLocked } }} onFinish={async (values) => { if (!editing || uploadLocked) return false; const next = { ...editing, ...values } as T; const saved = isNew ? await onCreate(next) : await onUpdate(next); if (!saved) return false; setEditing(null); return true; }}>{children}</ModalForm><Modal title="确认删除" open={Boolean(deleteTarget)} okText="删除" okButtonProps={{ danger: true, loading: busy }} cancelText="取消" onCancel={() => setDeleteTarget(null)} onOk={async () => { if (!deleteTarget) return; const deleted = await onDelete(deleteTarget); if (deleted) setDeleteTarget(null); }}>删除后会立即同步到前台，此操作不可撤销。</Modal></>;
}

export function AdminContentResource({ resource, initialContent, title, description }: { resource?: AdminContentResourceName; initialContent: SiteContentBundle; title?: string; description?: string }) {
  const [activeResource, setActiveResource] = useState<AdminContentResourceName>(resource ?? "site");
  const [home, setHome] = useState(initialContent.home);
  const [subpages, setSubpages] = useState(initialContent.subpages);
  const [knowledge, setKnowledge] = useState(initialContent.knowledge);
  const [versions, setVersions] = useState(initialContent.versions);
  const [busy, setBusy] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);
  const { message } = App.useApp();
  const beginUpload = useCallback(() => {
    let released = false;
    setActiveUploads((current) => current + 1);
    return () => {
      if (released) return;
      released = true;
      setActiveUploads((current) => Math.max(0, current - 1));
    };
  }, []);
  const uploadActivity = useMemo(() => ({ active: activeUploads, begin: beginUpload }), [activeUploads, beginUpload]);
  async function persist(nextHome: HomeContent, nextSubpages: Subpage[], nextKnowledge = knowledge) {
    if (activeUploads > 0) {
      message.warning("请等待文件上传和处理完成后再保存。");
      return false;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ home: nextHome, subpages: nextSubpages, knowledge: nextKnowledge, versions }) });
      const result = await response.json();
      if (response.status === 409 && result.current) {
        setHome(result.current.home);
        setSubpages(result.current.subpages);
        setKnowledge(result.current.knowledge);
        setVersions(result.current.versions);
        message.warning("内容已被其他管理员更新，已重新载入最新版本。");
        return false;
      }
      if (!response.ok) {
        message.error(result.error || "保存失败");
        return false;
      }
      setHome(nextHome);
      setSubpages(nextSubpages);
      setKnowledge(nextKnowledge);
      setVersions(result.versions);
      message.success("操作已保存。");
      return true;
    } catch {
      message.error("网络异常，未能保存内容。");
      return false;
    } finally {
      setBusy(false);
    }
  }
  const changeHome = (update: (current: HomeContent) => HomeContent) => persist(update(home), subpages);
  const changePages = (update: (current: Subpage[]) => Subpage[]) => persist(home, update(subpages));
  const changeKnowledge = (update: (current: KnowledgeEntry[]) => KnowledgeEntry[]) => persist(home, subpages, update(knowledge));
  const selectedResource = resource ?? activeResource;
  const isStudio = resource === undefined;
  const current = copy[selectedResource];
  const studioMenuItems: MenuProps["items"] = [
    { key: "site", label: "全站设置" },
    { key: "home", label: "官网首页" },
    { key: "navigation", label: "官网导航" },
    { key: "pages", label: "业务页面" },
    { key: "knowledge", label: "资源中心" },
  ];
  const resourceContent = <>
    {selectedResource === "site" ? <SiteSettingsManager home={home} onCommit={changeHome} busy={busy} /> : null}
    {selectedResource === "navigation" ? <NavigationManager home={home} onHomeCommit={changeHome} busy={busy} /> : null}
    {selectedResource === "home" ? <HomeManager home={home} onCommit={changeHome} busy={busy} /> : null}
    {selectedResource === "pages" ? <PagesManager pages={subpages} onCommit={changePages} busy={busy} /> : null}
    {selectedResource === "knowledge" ? <KnowledgeManager entries={knowledge} onCommit={changeKnowledge} busy={busy} /> : null}
  </>;
  return (
    <UploadActivityContext.Provider value={uploadActivity}>
    <PageContainer
      title={title ?? (isStudio ? "官网运营中心" : current.title)}
      content={description ?? (isStudio ? "只维护当前官网实际使用的内容、业务页面和资源；保存后立即同步前台。" : current.description)}
      extra={[<Button key="reload" icon={<ReloadOutlined />} onClick={() => window.location.reload()} disabled={busy || activeUploads > 0}>重新载入</Button>]}
    >
      <Spin spinning={busy || activeUploads > 0} tip={activeUploads > 0 ? "正在上传并处理文件" : "正在保存内容"}>
        {isStudio ? <Row gutter={[24, 24]}><Col xs={24} lg={5} xl={4}><Menu mode="inline" selectedKeys={[selectedResource]} items={studioMenuItems} onClick={({ key }) => setActiveResource(String(key) as AdminContentResourceName)} /></Col><Col xs={24} lg={19} xl={20}>{resourceContent}</Col></Row> : <Space direction="vertical" size="large" style={{ width: "100%" }}>{resourceContent}</Space>}
      </Spin>
    </PageContainer>
    </UploadActivityContext.Provider>
  );
}

function BrandManager({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<boolean>; busy: boolean }) {
  const { active: activeUploads } = useContext(UploadActivityContext);
  const uploadLocked = activeUploads > 0;
  const [open, setOpen] = useState(false);
  return <><Card title="当前品牌" extra={<Tooltip title="编辑品牌信息"><Button type="text" icon={<EditOutlined />} aria-label="编辑品牌信息" onClick={() => setOpen(true)} /></Tooltip>}><Descriptions column={1} items={[{ key: "name", label: "品牌名称", children: home.brand.name }, { key: "logo", label: "Logo", children: <MediaPreview src={home.brand.logo} alt="品牌 Logo" width={180} height={72} /> }, { key: "href", label: "主页链接", children: home.brand.href }]} /></Card><ModalForm open={open} title="编辑品牌信息" initialValues={home.brand} modalProps={{ destroyOnHidden: true, closable: !uploadLocked, keyboard: !uploadLocked, maskClosable: !uploadLocked, onCancel: () => { if (!uploadLocked) setOpen(false); } }} submitter={{ submitButtonProps: { loading: busy || uploadLocked, disabled: uploadLocked }, resetButtonProps: { disabled: uploadLocked } }} onFinish={async (values) => { if (uploadLocked) return false; const saved = await onCommit((current) => ({ ...current, brand: { ...current.brand, ...values } })); if (saved) setOpen(false); return saved; }}><ProFormText name="name" label="品牌名称" rules={[{ required: true }]} /><ImageUploadField name="logo" label="品牌 Logo" required hint="建议上传透明背景 PNG 或 SVG 以外的 JPG、PNG、WebP、GIF 图片。" /><ProFormText name="href" label="主页链接" rules={[{ required: true }]} /></ModalForm></>;
}

function MenuManager({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<boolean>; busy: boolean }) {
  const rows: MenuRow[] = home.navItems.map((item, index) => ({ ...item, id: String(index) }));
  return <CrudTable title="主导航" rows={rows} busy={busy} allowCreate={false} canDelete={() => false} columns={[{ title: "菜单名称", dataIndex: "label" }, { title: "链接", dataIndex: "href" }, { title: "显示状态", dataIndex: "hidden", render: (_, item) => <Tag color={item.hidden ? "default" : "green"}>{item.hidden ? "已隐藏" : "显示中"}</Tag> }, { title: "二级菜单", dataIndex: "children", renderText: (children) => children?.length ?? 0 }]} createItem={() => rows[0]} onCreate={async () => false} onUpdate={(item) => onCommit((current) => ({ ...current, navItems: current.navItems.map((entry, index) => String(index) === item.id ? omitId(item) : entry) }))} onDelete={async () => false}><ProFormText name="label" label="菜单名称" rules={[{ required: true }]} /><ProFormText name="href" label="链接" rules={[{ required: true }]} /><ProFormSwitch name="hidden" label="前台隐藏" fieldProps={{ checkedChildren: "隐藏", unCheckedChildren: "显示" }} /><ProFormList name="children" label="二级菜单" creatorButtonProps={false} actionRender={() => []}><Row gutter={12}><Col xs={24} md={6}><ProFormText name="label" label="名称" rules={[{ required: true }]} /></Col><Col xs={24} md={6}><ProFormText name="href" label="链接" rules={[{ required: true }]} /></Col><Col xs={24} md={6}><ProFormSwitch name="hidden" label="前台隐藏" /></Col><Col xs={24} md={6}><ProFormText name="group" label="下拉分组" /></Col></Row></ProFormList></CrudTable>;
}

function NavigationManager({ home, onHomeCommit, busy }: { home: HomeContent; onHomeCommit: (update: (content: HomeContent) => HomeContent) => Promise<boolean>; busy: boolean }) {
  return <MenuManager home={home} onCommit={onHomeCommit} busy={busy} />;
}

function SiteSettingsManager({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<boolean>; busy: boolean }) {
  return <Tabs items={[{ key: "brand", label: "品牌与主页", children: <BrandManager home={home} onCommit={onCommit} busy={busy} /> }, { key: "metadata", label: "站点标题与描述", children: <SiteMetadataManager home={home} onCommit={onCommit} busy={busy} /> }, { key: "site-copy", label: "全站文案", children: <HomeSettings home={home} onCommit={onCommit} busy={busy} /> }]} />;
}

function SiteMetadataManager({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<boolean>; busy: boolean }) {
  const [open, setOpen] = useState(false);
  return <Card title="站点标题与描述" extra={<Tooltip title="编辑站点信息"><Button type="text" icon={<EditOutlined />} aria-label="编辑站点信息" onClick={() => setOpen(true)} /></Tooltip>}><Descriptions column={1} items={[{ key: "title", label: "站点标题", children: home.site.title }, { key: "description", label: "站点描述", children: home.site.description }]} /><ModalForm open={open} initialValues={home.site} modalProps={{ destroyOnHidden: true, onCancel: () => setOpen(false) }} submitter={{ submitButtonProps: { loading: busy } }} onFinish={async (values) => { const saved = await onCommit((current) => ({ ...current, site: { ...current.site, ...values } })); if (saved) setOpen(false); return saved; }}><ProFormText name="title" label="站点标题" rules={[{ required: true }]} /><ProFormTextArea name="description" label="站点描述" rules={[{ required: true }]} /></ModalForm></Card>;
}

function HomeManager({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<boolean>; busy: boolean }) {
  return <Tabs items={[{ key: "hero", label: "首页横幅", children: <HeroTable home={home} onCommit={onCommit} busy={busy} /> }, { key: "products", label: "产品中心", children: <ProductTable home={home} onCommit={onCommit} busy={busy} /> }, { key: "editorial", label: "首页内容", children: <HomeEditorialManager home={home} onCommit={onCommit} busy={busy} /> }, { key: "timeline", label: "能力路径", children: <TimelineTable home={home} onCommit={onCommit} busy={busy} /> }]} />;
}

function ProductTable({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<boolean>; busy: boolean }) {
  const rows: ProductRow[] = home.products.map((item, index) => ({ ...item, id: String(index) }));
  return <><Card title="产品中心标题与说明" style={{ marginBottom: 16 }}><ModalForm trigger={<Button type="primary" icon={<EditOutlined />}>编辑产品中心标题</Button>} title="编辑产品中心标题" initialValues={home} onFinish={(values) => onCommit((current) => ({ ...current, productCenterTitle: values.productCenterTitle, productCenterDescription: values.productCenterDescription }))}><ProFormText name="productCenterTitle" label="主标题" rules={[{ required: true }]} /><ProFormTextArea name="productCenterDescription" label="副标题" rules={[{ required: true }]} /></ModalForm><Descriptions column={1} items={[{ key: "title", label: "主标题", children: home.productCenterTitle || "选择适合企业当前阶段的碳管理方案" }, { key: "description", label: "副标题", children: home.productCenterDescription || "从快速建立核算能力，到构建企业级碳数据治理体系，峰行智成提供不同发展阶段的数字化解决方案。" }]} /></Card><CrudTable title="产品中心卡片" rows={rows} busy={busy} allowCreate={false} canDelete={() => false}
    columns={[{ title: "产品名称", dataIndex: "name" }, { title: "产品说明", dataIndex: "summary" }, { title: "前台链接", dataIndex: "href" }]}
    createItem={() => rows[0]} onCreate={async () => false}
    onUpdate={(item) => onCommit((current) => ({ ...current, products: current.products.map((entry, index) => String(index) === item.id ? omitId(item) : entry) }))}
    onDelete={async () => false}>
    <ProFormText name="name" label="产品名称" rules={[{ required: true }]} />
    <ProFormTextArea name="summary" label="产品说明" rules={[{ required: true }]} />
    <ProFormText name="href" label="前台链接" rules={[{ required: true }, optionalHrefRule("请输入站内路径或完整的 https:// 链接")]} />
    <ProFormText name="stage" label="阶段标识" rules={[{ required: true }]} />
    <ProFormText name="icon" label="产品图标标识" disabled extra="图标由当前产品中心模板固定使用。" />
    <ProFormList name="audience" label="适用企业" creatorButtonProps={{ creatorButtonText: "新增适用企业" }}><ProFormText rules={[{ required: true }]} /></ProFormList>
    <ProFormList name="tags" label="能力标签" creatorButtonProps={{ creatorButtonText: "新增能力标签" }}><ProFormText rules={[{ required: true }]} /></ProFormList>
    <ProFormText name="action" label="按钮文字" rules={[{ required: true }]} />
  </CrudTable></>;
}

function HomeEditorialManager({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<boolean>; busy: boolean }) {
  const [open, setOpen] = useState(false);
  const iconOptions = ["chart", "building", "database", "layers", "line", "shield", "sparkles", "users", "workflow"].map((value) => ({ label: value, value }));
  const headingFields = (name: "drivers" | "challenges" | "managementPath" | "services" | "cases", label: string) => <Card size="small" title={`${label}标题`}><Row gutter={12}><Col xs={24} md={7}><ProFormText name={["headings", name, "eyebrow"]} label="英文标识" rules={[{ required: true }]} /></Col><Col xs={24} md={7}><ProFormText name={["headings", name, "title"]} label="中文标题" rules={[{ required: true }]} /></Col><Col xs={24} md={10}><ProFormText name={["headings", name, "description"]} label="说明（选填）" /></Col></Row>{name === "managementPath" ? <ProFormTextArea name={["headings", name, "summary"]} label="路径总结" /> : null}</Card>;
  const contentList = (name: "drivers" | "challenges" | "managementPath", label: string) => <ProFormList name={name} label={label} creatorButtonProps={{ creatorButtonText: `新增${label}` }}><Row gutter={12}><Col xs={24} md={9}><ProFormText name="title" label="标题" rules={[{ required: true }]} /></Col><Col xs={24} md={10}><ProFormText name="description" label="说明" rules={[{ required: true }]} /></Col><Col xs={24} md={5}><ProFormSelect name="icon" label="图标" rules={[{ required: true }]} options={iconOptions} /></Col></Row></ProFormList>;
  const linkedList = (name: "services" | "cases", label: string) => <ProFormList name={name} label={label} creatorButtonProps={{ creatorButtonText: `新增${label}` }}><Row gutter={12}><Col xs={24} md={6}><ProFormText name="title" label="标题" rules={[{ required: true }]} /></Col><Col xs={24} md={7}><ProFormText name="description" label="说明" rules={[{ required: true }]} /></Col><Col xs={24} md={6}><ProFormText name="href" label="链接" rules={[{ required: true }]} /></Col><Col xs={24} md={5}><ProFormSelect name="icon" label="图标" rules={[{ required: true }]} options={iconOptions} /></Col></Row></ProFormList>;

  return <><Card title="当前首页内容结构" extra={<Button icon={<EditOutlined />} onClick={() => setOpen(true)}>编辑首页内容</Button>}><Descriptions column={1} items={[{ key: "path", label: "能力路径", children: home.editorial.path.title }, { key: "drivers", label: "碳管理驱动", children: `${home.editorial.drivers.length} 项` }, { key: "challenges", label: "核心挑战", children: `${home.editorial.challenges.length} 项` }, { key: "services", label: "服务内容", children: `${home.editorial.services.length} 项` }, { key: "cases", label: "案例入口", children: `${home.editorial.cases.length} 项` }]} /></Card><ModalForm open={open} width={1000} title="编辑首页内容" initialValues={home.editorial} modalProps={{ className: "admin-editor-modal", destroyOnHidden: true, onCancel: () => setOpen(false) }} submitter={{ submitButtonProps: { loading: busy } }} onFinish={async (values) => { const saved = await onCommit((current) => ({ ...current, editorial: { ...current.editorial, ...values } })); if (saved) setOpen(false); return saved; }}><ProFormText name={["path", "eyebrow"]} label="能力路径英文标识" /><ProFormText name={["path", "title"]} label="能力路径标题" rules={[{ required: true }]} /><ProFormText name={["path", "description"]} label="能力路径副标题" rules={[{ required: true }]} /><ProFormTextArea name={["path", "summary"]} label="能力路径说明" rules={[{ required: true }]} />{headingFields("drivers", "碳管理驱动")}{contentList("drivers", "碳管理驱动")}{headingFields("challenges", "核心挑战")}{contentList("challenges", "核心挑战")}{headingFields("managementPath", "管理路径")}{contentList("managementPath", "管理路径")}{headingFields("services", "服务入口")}{linkedList("services", "服务入口")}{headingFields("cases", "案例入口")}{linkedList("cases", "案例入口")}</ModalForm></>;
}

function HomeSettings({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<boolean>; busy: boolean }) {
  const { active: activeUploads } = useContext(UploadActivityContext);
  const uploadLocked = activeUploads > 0;
  const [open, setOpen] = useState(false);
  return <Card title="首页与全站文案" extra={<Tooltip title="编辑首页与全站文案"><Button type="text" icon={<EditOutlined />} aria-label="编辑首页与全站文案" onClick={() => setOpen(true)} /></Tooltip>}><ModalForm open={open} width={920} initialValues={home} modalProps={{ destroyOnHidden: true, closable: !uploadLocked, keyboard: !uploadLocked, maskClosable: !uploadLocked, onCancel: () => { if (!uploadLocked) setOpen(false); } }} submitter={{ submitButtonProps: { loading: busy || uploadLocked, disabled: uploadLocked }, resetButtonProps: { disabled: uploadLocked } }} onFinish={async (values) => { if (uploadLocked) return false; const saved = await onCommit((current) => ({ ...current, sectionTitles: { ...current.sectionTitles, ...values.sectionTitles }, thinkingText: values.thinkingText, contact: { ...current.contact, ...values.contact }, footer: { ...current.footer, ...values.footer } })); if (saved) setOpen(false); return saved; }}><ProFormText name={["sectionTitles", "thinkingEyebrow"]} label="品牌定位英文标识" /><ProFormText name={["sectionTitles", "thinkingTitle"]} label="品牌定位标题" rules={[{ required: true }]} /><ProFormTextArea name="thinkingText" label="品牌定位正文" rules={[{ required: true }]} /><ProFormText name={["contact", "title"]} label="联系区标题" rules={[{ required: true }]} /><ProFormTextArea name={["contact", "description"]} label="联系区说明" rules={[{ required: true }]} /><ProFormText name={["contact", "namePlaceholder"]} label="联系人提示" rules={[{ required: true }]} /><ProFormText name={["contact", "companyPlaceholder"]} label="企业名称提示" rules={[{ required: true }]} /><ProFormText name={["contact", "contactPlaceholder"]} label="手机号/微信号提示" rules={[{ required: true }]} /><ProFormText name={["contact", "emailPlaceholder"]} label="联系邮箱提示" rules={[{ required: true }]} /><ProFormText name={["contact", "messagePlaceholder"]} label="需求说明提示" rules={[{ required: true }]} /><ProFormText name={["contact", "submitLabel"]} label="提交按钮文字" rules={[{ required: true }]} /><ProFormText name={["contact", "successLabel"]} label="提交成功提示" rules={[{ required: true }]} /><ProFormText name={["contact", "errorLabel"]} label="提交失败提示" rules={[{ required: true }]} /><ProFormText name={["footer", "copyright"]} label="页脚版权" rules={[{ required: true }]} /><ProFormText name={["footer", "icpText"]} label="备案文字" rules={[{ required: true }]} /><ProFormText name={["footer", "icpHref"]} label="备案链接" rules={[{ required: true }]} /><ProFormText name={["footer", "ipv6Text"]} label="页脚补充信息" rules={[{ required: true }]} /><ProFormText name={["footer", "wecomTitle"]} label="企业微信浮窗标题" rules={[{ required: true }]} /><ProFormText name={["footer", "wecomDescription"]} label="企业微信浮窗说明" rules={[{ required: true }]} /><ImageUploadField name={["footer", "wecomAvatar"]} label="企业顾问头像" required hint="建议上传清晰的正方形 JPG、PNG 或 WebP 图片。" /><ProFormText name={["footer", "customerServiceHref"]} label="微信客服链接（选填）" rules={[optionalHrefRule("请输入完整的 https:// 客服链接", (value) => value === undefined || value === "" || isHttpsContentUrl(value))]} /><ImageUploadField name={["footer", "customerServiceQr"]} label="微信客服二维码（上方）" hint="链接未配置时二维码仍展示，但不会产生跳转。" /><ImageUploadField name={["footer", "wecomQr"]} label="企业微信个人二维码（下方）" required hint="保留现有个人企业微信二维码，显示在客服二维码下方。" /><ProFormSwitch name={["footer", "wecomOpenByDefault"]} label="桌面端默认展开企业微信浮窗" /></ModalForm></Card>;
}

function HeroTable({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<boolean>; busy: boolean }) {
  const rows: HeroRow[] = home.heroSlides.map((item, index) => ({ ...item, id: String(index) }));
  return <CrudTable title="轮播图" rows={rows} busy={busy} allowCreate={false} canDelete={() => false} columns={[{ title: "标题", dataIndex: "title" }, { title: "按钮", dataIndex: "cta" }, { title: "配图", dataIndex: "image", render: (_, record) => <MediaPreview src={record.image} alt={record.title || "轮播图"} /> }]} createItem={() => rows[0]} onCreate={async () => false} onUpdate={(item) => onCommit((current) => ({ ...current, heroSlides: current.heroSlides.map((entry, index) => String(index) === item.id ? omitId(item) : entry) }))} onDelete={async () => false}><ProFormText name="eyebrow" label="副标题" /><ProFormText name="title" label="主标题" rules={[{ required: true }]} /><ProFormTextArea name="description" label="描述" rules={[{ required: true }]} /><ProFormText name="cta" label="主按钮文字" /><ProFormText name="href" label="主按钮链接" /><ProFormText name="secondaryCta" label="次按钮文字" /><ProFormText name="secondaryHref" label="次按钮链接" /><ImageUploadField name="image" label="轮播配图" required hint="建议使用横向企业场景图，推荐比例 16:9。" /></CrudTable>;
}

function TimelineTable({ home, onCommit, busy }: { home: HomeContent; onCommit: (update: (content: HomeContent) => HomeContent) => Promise<boolean>; busy: boolean }) {
  const rows: TimelineRow[] = home.timeline.map((item, index) => ({ ...item, id: String(index), itemsText: item.items.join("\n") } as TimelineRow & { itemsText: string }));
  return <CrudTable title="能力阶段" rows={rows} busy={busy} allowCreate={false} canDelete={() => false} columns={[{ title: "阶段", dataIndex: "year" }, { title: "内容", dataIndex: "items", renderText: (items) => items.join(" / ") }]} createItem={() => rows[0]} onCreate={async () => false} onUpdate={(item) => onCommit((current) => ({ ...current, timeline: current.timeline.map((entry, index) => String(index) === item.id ? { year: item.year, items: String((item as unknown as { itemsText: string }).itemsText).split("\n").filter(Boolean) } : entry) }))} onDelete={async () => false}><ProFormText name="year" label="阶段" rules={[{ required: true }]} /><ProFormTextArea name="itemsText" label="内容（每行一项）" rules={[{ required: true }]} /></CrudTable>;
}

function KnowledgeManager({ entries, onCommit, busy }: { entries: KnowledgeEntry[]; onCommit: (update: (current: KnowledgeEntry[]) => KnowledgeEntry[]) => Promise<boolean>; busy: boolean }) {
  const rows: KnowledgeRow[] = entries.map((entry) => ({ ...entry, id: entry.slug, exists: true }));
  const articleCategories = [...new Set(entries.filter((entry) => entry.type === "article").map((entry) => entry.category.trim()).filter(Boolean))];
  const toKnowledgeEntry = (item: KnowledgeRow, slug = item.slug) => {
    const entry = omitId(item) as KnowledgeEntry & { exists?: boolean };
    delete entry.exists;
    return toCurrentKnowledgeEntry({ ...entry, slug } as KnowledgeEntry);
  };
  return <CrudTable
    title="文章与课程"
    rows={rows}
    busy={busy}
    columns={[
      { title: "类型", dataIndex: "type", render: (_, record) => <Tag color={record.type === "article" ? "blue" : "green"}>{record.type === "article" ? "双碳文章" : "视频课程"}</Tag> },
      { title: "标题", dataIndex: "title" },
      { title: "栏目", dataIndex: "category" },
      { title: "发布时间", dataIndex: "publishedAt", renderText: (value) => value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "未设置" },
      { title: "详情地址", dataIndex: "slug", renderText: (slug) => `/knowledge-center/${slug}` }
    ]}
    createItem={() => ({ id: crypto.randomUUID(), exists: false, slug: "new-knowledge-entry", type: "article" as const, category: "双碳政策", title: "", summary: "", meta: "", publishedAt: new Date().toISOString(), sections: [] })}
    onCreate={(item) => onCommit((current) => [toKnowledgeEntry(item), ...current])}
    onUpdate={(item) => onCommit((current) => current.map((entry) => entry.slug === item.id ? toKnowledgeEntry(item, item.id) : entry))}
    onDelete={(item) => onCommit((current) => current.filter((entry) => entry.slug !== item.id))}
  >
    <ProFormDependency name={["exists"]}>
      {({ exists }) => <ProFormText name="slug" label="详情 URL 标识" disabled={Boolean(exists)} extra={exists ? "已发布内容的 URL 标识不可修改，以免已有链接失效。" : undefined} rules={[{ required: true, pattern: contentSlugPattern, message: "仅可使用小写字母、数字，并以单个连字符分隔" }]} />}
    </ProFormDependency>
    <ProFormSelect name="type" label="内容类型" rules={[{ required: true }]} options={[{ label: "双碳专栏文章", value: "article" }, { label: "视频课程", value: "course" }]} />
    <ProFormDependency name={["type"]}>
      {({ type }) => type === "course"
        ? <ProFormText name="category" label="课程目录" extra="使用 / 分隔多级目录，例如：核算课程/入门基础。前台可逐级点击展开。" rules={[{ required: true }]} />
        : <ProFormText name="category" label="文章分类" extra={articleCategories.length ? `已有分类：${articleCategories.join("、")}。输入已有名称可归入该分类，也可以直接创建新分类。` : "输入分类名称，例如：公司业务、碳政策、碳核算。"} rules={[{ required: true, whitespace: true, message: "请输入文章分类" }]} />}
    </ProFormDependency>
    <ProFormText name="title" label="标题" rules={[{ required: true }]} />
    <ProFormTextArea name="summary" label="摘要" rules={[{ required: true }]} />
    <ProFormText name="meta" label="阅读或课程信息" rules={[{ required: true }]} />
    <ProFormDependency name={["type"]}>
      {({ type }) => type === "article"
        ? <><ProFormText name="sourceName" label="政策原文名称（选填）" /><ProFormText name="sourceHref" label="政策原文链接（选填）" rules={[optionalHrefRule("请输入完整的 https:// 链接", (value) => value === undefined || value === "" || isHttpsContentUrl(value))]} /></>
        : <>
          <ImageUploadField name="coverImage" label="课程封面（选填）" hint="建议使用清晰的 16:10 或 16:9 横图。" />
          <VideoUploadField name="videoHref" label="课程视频（推荐）" addressHint="上传视频后系统会自动填写；也可保留已有站内视频路径或可直接播放的 https:// 媒体地址。课程入口始终先进入站内详情页。" />
          <ProFormText name="externalHref" label="外部课程链接（选填）" extra="适用于 B 站、千聊等课程网页。留空时前台不会生成跳转按钮。" rules={[optionalHrefRule("请输入站内路径或完整的 https:// 链接")]} />
          <ProFormText name="externalLabel" label="外部课程按钮文字（选填）" />
        </>}
    </ProFormDependency>
    <ProFormList name="sections" label="详情正文" creatorButtonProps={{ creatorButtonText: "新增正文段落" }}>
      <ProFormText name="heading" label="小节标题" rules={[{ required: true }]} />
      <ProFormList name="paragraphs" label="段落" creatorButtonProps={{ creatorButtonText: "新增段落" }}><ProFormText rules={[{ required: true }]} /></ProFormList>
      <ProFormList name="bullets" label="要点" creatorButtonProps={{ creatorButtonText: "新增要点" }}><ProFormText rules={[{ required: true }]} /></ProFormList>
    </ProFormList>
  </CrudTable>;
}

function PagesManager({ pages, onCommit, busy }: { pages: Subpage[]; onCommit: (update: (current: Subpage[]) => Subpage[]) => Promise<boolean>; busy: boolean }) {
  const rows: PageRow[] = pages.map((page) => ({ ...page, id: page.slug, mediaEntries: Object.entries(page.media ?? {}).map(([key, path]) => ({ key, path })) }));
  return <CrudTable
    title="业务子页面"
    rows={rows}
    busy={busy}
    allowCreate={false}
    canDelete={() => false}
    columns={[
      { title: "页面名称", dataIndex: "navLabel" },
      { title: "版式", dataIndex: "layout" },
      { title: "URL 标识", dataIndex: "slug" },
      { title: "页面标题", dataIndex: "title" },
      { title: "页面配图", dataIndex: "image", render: (_, record) => <MediaPreview src={record.image} alt={record.title || record.navLabel} /> }
    ]}
    createItem={() => rows[0]}
    onCreate={async () => false}
    onUpdate={(item) => onCommit((current) => current.map((entry) => entry.slug === item.id ? toSubpage({ ...item, slug: item.id }) : entry))}
    onDelete={async () => false}
  >
    <ProFormText name="slug" label="URL 标识" disabled extra="URL 由当前官网路由固定管理。" />
    <ProFormText name="layout" label="页面版式" disabled extra="版式由当前页面模板固定管理。" />
    <ProFormText name="navLabel" label="导航名称" rules={[{ required: true }]} />
    <ProFormText name="eyebrow" label="页面英文标识" />
    <ProFormText name="title" label="页面标题" rules={[{ required: true }]} />
    <ProFormTextArea name="summary" label="页面摘要" rules={[{ required: true }]} />
    <ProFormText name="icon" label="页面图标" disabled extra="图标与当前页面模板绑定。" />
    <ImageUploadField name="image" label="页面配图" required hint="建议上传与该页面业务内容相符的明亮企业场景图。" />
    <ProFormList name="metrics" label="页面指标" creatorButtonProps={{ creatorButtonText: "新增指标" }}><Row gutter={12}><Col xs={24} md={12}><ProFormText name="label" label="指标名称" rules={[{ required: true }]} /></Col><Col xs={24} md={12}><ProFormText name="value" label="指标值" rules={[{ required: true }]} /></Col></Row></ProFormList>
    <ProFormDependency name={["layout"]}>
      {({ layout }) => layout === "excel" || layout === "product-platform" ? <>
        <ProFormList name={["product", "screenshots"]} label="产品截图" creatorButtonProps={{ creatorButtonText: "新增截图" }}>
          <Row gutter={12}>
            <Col xs={24} md={8}><ImageUploadField name="src" label="截图" required hint="建议上传清晰的产品界面截图。" /></Col>
            <Col xs={24} md={8}><ProFormText name="label" label="截图名称" rules={[{ required: true }]} /><ProFormText name="alt" label="图片说明" rules={[{ required: true }]} /></Col>
            <Col xs={24} md={4}><ProFormDigit name="width" label="原始宽度" min={1} max={100000} fieldProps={{ precision: 0 }} /></Col>
            <Col xs={24} md={4}><ProFormDigit name="height" label="原始高度" min={1} max={100000} fieldProps={{ precision: 0 }} /></Col>
          </Row>
        </ProFormList>
        {layout === "product-platform" ? <>
          <ProFormText name={["product", "enterpriseUrl"]} label="企业端入口链接" rules={[{ required: true }, optionalHrefRule("请输入站内路径或完整的 https:// 链接")]} extra="默认 /sample/；可填写站内相对地址或完整 https:// 地址。" />
          <ProFormText name={["product", "trialUrl"]} label="试用申请链接" rules={[{ required: true }, optionalHrefRule("请输入站内路径或完整的 https:// 链接")]} />
          <ProFormText name={["product", "publicReportUrl"]} label="Power BI 公开报告链接" extra="填写 app.powerbi.com/view?r= 形式的公开链接，前台会以新窗口打开。" rules={[optionalHrefRule("请输入站内路径或完整的 https:// 链接")]} />
          <VideoUploadField name={["product", "videoUrl"]} label="平台介绍视频" addressLabel="平台介绍视频地址（选填）" />
          <ImageUploadField name={["product", "videoPoster"]} label="视频封面" hint="建议上传 16:9 的清晰界面截图。" />
        </> : null}
      </> : null}
    </ProFormDependency>
    <ProFormList name="mediaEntries" label="模板图片" creatorButtonProps={false} actionRender={() => []}>
      <Row gutter={12}>
        <Col xs={24} md={8}><ProFormText name="key" label="图片位名称" disabled /></Col>
        <Col xs={24} md={16}><ImageUploadField name="path" label="图片" required hint="模板图片位会在前台直接读取；保留已有名称以替换当前图片。" /></Col>
      </Row>
    </ProFormList>
    <ProFormList name="features" label="核心内容" creatorButtonProps={{ creatorButtonText: "新增内容" }}><ProFormText rules={[{ required: true }]} /></ProFormList>
    <ProFormList name="steps" label="实施或阅读路径" creatorButtonProps={{ creatorButtonText: "新增步骤" }}><ProFormText rules={[{ required: true }]} /></ProFormList>
    <ProFormList name="sections" label="页面专属模块" creatorButtonProps={false} actionRender={() => []}>
      <Row gutter={12}>
        <Col xs={24} md={8}><ProFormText name="id" label="模块标识" disabled /></Col>
        <Col xs={24} md={8}><ProFormText name="kind" label="模块类型" disabled /></Col>
        <Col xs={24} md={8}><ProFormText name="title" label="模块标题" rules={[{ required: true }]} /></Col>
      </Row>
      <ProFormTextArea name="description" label="模块说明" />
      <ProFormDependency name={["id"]}>
        {({ id }) => {
          const supportsDocumentUpload = id === "product-resources" || id === "downloads";
          return <ProFormList name="items" label="模块条目" creatorButtonProps={{ creatorButtonText: "新增条目" }}>
          <Row gutter={12}>
            <Col xs={24} md={8}><ProFormText name="title" label="条目标题" rules={[{ required: true }]} /></Col>
            <Col xs={24} md={8}><ProFormText name="description" label="条目说明" /></Col>
            <Col xs={24} md={8}><ProFormText name="value" label={supportsDocumentUpload ? "下载地址" : "链接或指标值"} rules={supportsDocumentUpload ? [optionalHrefRule("请输入站内文件路径或完整的 https:// 下载链接")] : undefined} /></Col>
          </Row>
          <ProFormTextArea name={["details", "项目背景"]} label="案例：项目背景" />
          <ProFormTextArea name={["details", "面临问题"]} label="案例：面临问题" />
          <ProFormTextArea name={["details", "建设内容"]} label="案例：建设内容" />
          <ProFormTextArea name={["details", "实施过程"]} label="案例：实施过程" />
          <ProFormTextArea name={["details", "建设成果"]} label="案例：建设成果" />
          <ProFormTextArea name={["details", "客户价值"]} label="案例：客户价值" />
          <ProFormTextArea name={["details", "要点"]} label="通用要点（每行一项）" />
          {supportsDocumentUpload ? <ProFormItem label="资料文件（上传后自动写入下载地址）" name="value"><DocumentUploadField /></ProFormItem> : null}
          <ImageUploadField name="image" label="条目图片或二维码" hint="荣誉页上传证书，伙伴页上传 Logo，联系页可上传二维码。" />
          {id === "platform-overview" ? <ProFormList name="gallery" label="按钮切换图片" creatorButtonProps={{ creatorButtonText: "新增切换图片" }}>
            <Row gutter={12}>
              <Col xs={24} md={10}><ImageUploadField name="src" label="图片" required hint="上传后会作为该优势项中的一张按钮切换图片。" /></Col>
              <Col xs={24} md={7}><ProFormText name="label" label="按钮文字" rules={[{ required: true }]} /></Col>
              <Col xs={24} md={7}><ProFormText name="alt" label="图片说明" rules={[{ required: true }]} /></Col>
              <Col xs={12} md={6}><ProFormDigit name="width" label="原始宽度" min={1} max={100000} fieldProps={{ precision: 0 }} /></Col>
              <Col xs={12} md={6}><ProFormDigit name="height" label="原始高度" min={1} max={100000} fieldProps={{ precision: 0 }} /></Col>
            </Row>
          </ProFormList> : null}
        </ProFormList>}}
      </ProFormDependency>
    </ProFormList>
  </CrudTable>;
}

function toSubpage({ id: _, mediaEntries, ...page }: PageRow): Subpage {
  return {
    ...page,
    media: Object.fromEntries(mediaEntries.filter((entry) => entry.key && entry.path).map((entry) => [entry.key, entry.path]))
  };
}

function omitId<T extends RowItem>(value: T): Omit<T, "id"> { const { id: _, ...rest } = value; return rest; }
