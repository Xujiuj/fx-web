import { readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { getManagedMediaPath } from "./media-url.ts";

const managedDirectories = ["uploads", "documents", "videos"] as const;
const defaultGracePeriodMs = 24 * 60 * 60 * 1000;

export type ManagedMediaCleanupResult = {
  deleted: number;
  failed: number;
  scanned: number;
};

export function collectManagedMediaPaths(value: unknown, paths = new Set<string>(), visited = new WeakSet<object>()) {
  if (typeof value === "string") {
    const mediaPath = getManagedMediaPath(value);
    if (mediaPath) paths.add(mediaPath);
    return paths;
  }
  if (!value || typeof value !== "object" || visited.has(value)) return paths;
  visited.add(value);
  const entries = Array.isArray(value) ? value : Object.values(value);
  for (const entry of entries) collectManagedMediaPaths(entry, paths, visited);
  return paths;
}

function filePathForManagedUrl(publicRoot: string, mediaUrl: string) {
  return path.join(publicRoot, ...mediaUrl.slice(1).split("/"));
}

function errorCode(error: unknown) {
  return error && typeof error === "object" && "code" in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

async function deleteManagedFile(filePath: string, result: ManagedMediaCleanupResult) {
  try {
    await rm(filePath, { force: true });
    result.deleted += 1;
  } catch {
    result.failed += 1;
  }
}

export async function cleanupManagedMedia(
  previousContent: unknown,
  nextContent: unknown,
  options: { publicRoot?: string; now?: number; gracePeriodMs?: number } = {},
): Promise<ManagedMediaCleanupResult> {
  const publicRoot = options.publicRoot ?? path.join(process.cwd(), "public");
  const now = options.now ?? Date.now();
  const gracePeriodMs = options.gracePeriodMs ?? defaultGracePeriodMs;
  const previousPaths = collectManagedMediaPaths(previousContent);
  const nextPaths = collectManagedMediaPaths(nextContent);
  const result: ManagedMediaCleanupResult = { deleted: 0, failed: 0, scanned: 0 };

  for (const mediaUrl of previousPaths) {
    if (!nextPaths.has(mediaUrl)) {
      await deleteManagedFile(filePathForManagedUrl(publicRoot, mediaUrl), result);
    }
  }

  for (const directory of managedDirectories) {
    const diskDirectory = path.join(publicRoot, "media", directory);
    let entries;
    try {
      entries = await readdir(diskDirectory, { withFileTypes: true });
    } catch (error) {
      if (errorCode(error) !== "ENOENT") result.failed += 1;
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const mediaUrl = `/media/${directory}/${entry.name}`;
      if (!getManagedMediaPath(mediaUrl) || nextPaths.has(mediaUrl)) continue;
      result.scanned += 1;
      const diskPath = path.join(diskDirectory, entry.name);
      try {
        const metadata = await stat(diskPath);
        if (now - metadata.mtimeMs < gracePeriodMs) continue;
      } catch (error) {
        if (errorCode(error) !== "ENOENT") result.failed += 1;
        continue;
      }
      await deleteManagedFile(diskPath, result);
    }
  }

  return result;
}
