type MigrationItem = {
  title: string;
  details?: Record<string, string>;
};

type MigrationSection = {
  id: string;
  items: MigrationItem[];
};

type MigrationPage<TSection extends MigrationSection> = {
  slug: string;
  schemaVersion?: number;
  sections: TSection[];
  media?: Record<string, string>;
  product?: object;
};

export const v3SectionIdsBySlug: Readonly<Record<string, readonly string[]>> = {
  "customer-cases": ["case-introduction", "case-structure", "case-cta"],
  "knowledge-center": ["knowledge-cta"],
  "company-profile": ["company-beliefs", "core-capabilities", "company-cta"],
  "excel-accounting-tool": ["product-editions", "product-diagram", "product-screenshots", "product-features", "product-cta"],
  "carbon-management-platform": ["platform-foundation", "platform-overview", "product-screenshots", "product-video", "product-public-demo", "product-cta"],
  "solution-standard": ["solution-cta"],
  "solution-practical": ["solution-cta"],
  "solution-consulting": ["solution-cta"],
  "solution-platform": ["solution-cta"],
  "service-capability-path": ["service-cta"],
  "service-training-consulting": ["service-cta"],
  "service-platform-delivery": ["service-cta"],
};

export const v4SectionIdsBySlug: Readonly<Record<string, readonly string[]>> = {
  "knowledge-center": ["video-courses"],
};

export const v5SectionIdsBySlug: Readonly<Record<string, readonly string[]>> = {
  "knowledge-center": ["online-classroom"],
};

const sectionIdsBySchemaVersion = [
  { version: 3, idsBySlug: v3SectionIdsBySlug },
  { version: 4, idsBySlug: v4SectionIdsBySlug },
  { version: 5, idsBySlug: v5SectionIdsBySlug },
] as const;

function cloneSection<TSection extends MigrationSection>(section: TSection): TSection {
  return {
    ...section,
    items: section.items.map((item) => ({
      ...item,
      ...(item.details ? { details: { ...item.details } } : {}),
    })),
  } as TSection;
}

function mergeItemDetails<TItem extends MigrationItem>(item: TItem, fallbackItem?: MigrationItem): TItem {
  if (!fallbackItem?.details) return item;
  return {
    ...item,
    details: { ...fallbackItem.details, ...item.details },
  };
}

function mergeLegacyFallbackSections<TSection extends MigrationSection>(sections: TSection[], fallbackSections: TSection[]) {
  const merged = sections.map((section) => {
    const fallbackSection = fallbackSections.find((fallback) => fallback.id === section.id);
    if (!fallbackSection) return section;
    return {
      ...fallbackSection,
      ...section,
      items: section.items.map((item) => {
        const fallbackItem = fallbackSection.items.find((candidate) => candidate.title === item.title);
        if (!fallbackItem) return item;
        const details = fallbackItem.details || item.details
          ? { ...fallbackItem.details, ...item.details }
          : undefined;
        return { ...fallbackItem, ...item, ...(details ? { details } : {}) };
      }),
    } as TSection;
  });
  return [...merged, ...fallbackSections.filter((fallback) => !sections.some((section) => section.id === fallback.id)).map(cloneSection)];
}

function migrateManagedSections<TSection extends MigrationSection>(
  slug: string,
  storedSchemaVersion: number,
  currentSchemaVersion: number,
  sections: TSection[],
  fallbackSections: TSection[],
) {
  const enriched = sections.map((section) => {
    const fallbackSection = fallbackSections.find((fallback) => fallback.id === section.id);
    if (!fallbackSection) return section;
    return {
      ...section,
      items: section.items.map((item) => mergeItemDetails(
        item,
        fallbackSection.items.find((candidate) => candidate.title === item.title),
      )),
    } as TSection;
  });
  const presentIds = new Set(enriched.map((section) => section.id));
  const newIds = new Set(sectionIdsBySchemaVersion.flatMap(({ version, idsBySlug }) =>
    version > storedSchemaVersion && version <= currentSchemaVersion ? idsBySlug[slug] ?? [] : []
  ));
  const additions = fallbackSections
    .filter((section) => newIds.has(section.id) && !presentIds.has(section.id))
    .map(cloneSection);
  return [...enriched, ...additions];
}

export function migrateStoredSubpage<
  TSection extends MigrationSection,
  TPage extends MigrationPage<TSection>,
>(page: TPage, fallback: TPage | undefined, currentSchemaVersion: number): TPage {
  if (!fallback || (page.schemaVersion ?? 0) >= currentSchemaVersion) return page;

  if ((page.schemaVersion ?? 0) >= 2) {
    const migrated = {
      ...page,
      schemaVersion: currentSchemaVersion,
      sections: migrateManagedSections(
        page.slug,
        page.schemaVersion ?? 0,
        currentSchemaVersion,
        page.sections,
        fallback.sections,
      ),
    };
    return page.product === undefined && fallback.product !== undefined
      ? { ...migrated, product: { ...fallback.product } } as TPage
      : migrated as TPage;
  }

  const withFallbackSections = {
    ...page,
    schemaVersion: currentSchemaVersion,
    sections: mergeLegacyFallbackSections(page.sections, fallback.sections),
  };
  const withFallbackMedia = fallback.media
    ? { ...withFallbackSections, media: { ...fallback.media, ...withFallbackSections.media } }
    : withFallbackSections;
  return fallback.product
    ? { ...withFallbackMedia, product: { ...fallback.product, ...withFallbackMedia.product } } as TPage
    : withFallbackMedia as TPage;
}
