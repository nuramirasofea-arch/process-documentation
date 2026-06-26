import Link from "next/link";
import {
  getProcessCountForDepartment,
  getProcessTitlesForDepartment,
} from "@/lib/mock-data";
import type { DepartmentConfig } from "@/lib/types";

interface DepartmentCardProps {
  department: DepartmentConfig;
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  const count = getProcessCountForDepartment(department.slug);
  const titles = getProcessTitlesForDepartment(department.slug);
  const countLabel =
    department.slug === "parking"
      ? `${count} items · not yet mapped`
      : `${count} process${count > 1 ? "es" : ""}`;

  return (
    <Link
      href={`/${department.slug}`}
      className={`dept-box ${department.variant}`}
    >
      <span className="dcount">{countLabel}</span>
      <span className="dname">{department.name}</span>
      <span className="dlist">{titles.join(" · ")}</span>
      <span className="arrow">Open →</span>
    </Link>
  );
}
