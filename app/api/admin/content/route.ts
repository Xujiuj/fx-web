import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  ContentConflictError,
  defaultHomeContent,
  defaultSubpages,
  getSiteContentBundle,
  saveSiteContentBundle,
  type ContentVersions,
  type HomeContent,
  type Subpage
} from "@/lib/cms-content";
import { knowledgeEntries as defaultKnowledgeEntries, type KnowledgeEntry } from "@/lib/knowledge-content";
import { cleanupManagedMedia } from "@/lib/managed-media";
import { readJsonBody } from "@/lib/request-security";
import { validateCurrentSiteContent } from "@/lib/site-content-contract";

async function unauthorized() {
  return !(await isAdminAuthenticated());
}

export async function GET() {
  if (await unauthorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getSiteContentBundle());
}

export async function POST(request: Request) {
  if (await unauthorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await readJsonBody<{
      home?: unknown;
      subpages?: unknown;
      knowledge?: unknown;
      versions?: ContentVersions;
      reset?: boolean;
    }>(request, 512 * 1024);
    if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });
    const payload = body.value;

    if (!payload.versions) return NextResponse.json({ error: "Missing content versions" }, { status: 400 });

    const bundle = payload.reset
      ? { home: defaultHomeContent, subpages: defaultSubpages, knowledge: defaultKnowledgeEntries }
      : { home: payload.home as HomeContent, subpages: payload.subpages as Subpage[], knowledge: payload.knowledge as KnowledgeEntry[] };

    const validationError = validateCurrentSiteContent(bundle.home, bundle.subpages, bundle.knowledge, defaultSubpages);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const previousBundle = await getSiteContentBundle();
    const versions = await saveSiteContentBundle(bundle, payload.versions);
    try {
      const cleanup = await cleanupManagedMedia(previousBundle, bundle);
      if (cleanup.failed > 0) {
        console.error("[admin-content] managed media cleanup incomplete", {
          event: "MANAGED_MEDIA_CLEANUP_INCOMPLETE",
          deleted: cleanup.deleted,
          failed: cleanup.failed,
          scanned: cleanup.scanned,
        });
      }
    } catch {
      console.error("[admin-content] managed media cleanup failed", {
        event: "MANAGED_MEDIA_CLEANUP_FAILED",
      });
    }
    return NextResponse.json({ ok: true, versions });
  } catch (error) {
    if (error instanceof ContentConflictError) {
      return NextResponse.json(
        { error: "内容已被其他管理员修改，请刷新后重试。", current: await getSiteContentBundle() },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "保存内容失败，请检查内容后重试。" },
      { status: 400 }
    );
  }
}
