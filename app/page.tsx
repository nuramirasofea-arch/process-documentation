import { Header } from "@/app/components/header";
import { DepartmentCard } from "@/app/components/department-card";
import { getDepartmentList } from "@/lib/mock-data";

export default function Home() {
  const departments = getDepartmentList();

  return (
    <>
      <Header />
      <main>
        <p className="landing-intro">
          Choose a department to open its mapped processes.
        </p>
        <div className="dept-grid">
          {departments.map((department) => (
            <DepartmentCard key={department.slug} department={department} />
          ))}
        </div>
      </main>
    </>
  );
}
