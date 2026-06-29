import { notFound } from "next/navigation";
import { DepartmentView } from "@/app/components/department-view";
import { Header } from "@/app/components/header";
import { getDocumentationByDepartment } from "@/lib/documentation";
import { getDepartmentConfig, isValidDepartment } from "@/lib/mock-data";

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  const { department } = await params;

  if (!isValidDepartment(department)) {
    notFound();
  }

  const config = getDepartmentConfig(department);
  // Server-fetched docs hydrate the client; comments load client-side on mount.
  const { data: initialDocumentation, error } =
    await getDocumentationByDepartment(department);

  if (error) {
    console.error("Failed to load documentation:", error.message);
  }

  return (
    <>
      <Header
        showBack
        title={`WORQ — ${config.name}`}
        subtitle={config.blurb}
        backHref="/"
      />
      <main className="wide">
        <DepartmentView
          departmentSlug={config.slug}
          departmentName={config.name}
          departmentBlurb={config.blurb}
          isParkingLot={config.isParkingLot}
          initialDocumentation={initialDocumentation}
        />
      </main>
    </>
  );
}
