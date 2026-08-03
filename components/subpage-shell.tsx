import type { Subpage, SubpageLayout } from "@/lib/cms-content";
import {
  CasesPage,
  CompanyPage,
  KnowledgePage,
} from "./subpages/editorial-pages";
import {
  ContactPage,
  HonorsPage,
  PartnersPage,
} from "./subpages/about-pages";
import {
  ExcelProductPage,
  PlatformProductPage,
} from "./subpages/product-pages";
import {
  ConsultingPage,
  PlatformSolutionPage,
  PracticalPage,
  TrainingPage,
} from "./subpages/solution-pages";
import { ServicePage } from "./subpages/service-page";

const pageComponents: Record<SubpageLayout, React.ComponentType<{ page: Subpage }>> = {
  training: TrainingPage,
  practical: PracticalPage,
  consulting: ConsultingPage,
  "solution-platform": PlatformSolutionPage,
  excel: ExcelProductPage,
  "product-platform": PlatformProductPage,
  cases: CasesPage,
  knowledge: KnowledgePage,
  company: CompanyPage,
  honors: HonorsPage,
  partners: PartnersPage,
  contact: ContactPage,
  service: ServicePage,
};

export function SubpageShell({ page }: { page: Subpage }) {
  const PageComponent = pageComponents[page.layout] ?? TrainingPage;

  return (
    <main
      className={`reference-page page-${page.layout}`}
      data-motion-family={page.layout}
      data-motion-ready="true"
    >
      <PageComponent page={page} />
    </main>
  );
}
