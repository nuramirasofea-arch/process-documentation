import Link from "next/link";

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  subtitle?: string;
  backHref?: string;
}

const DEFAULT_TITLE = "WORQ — Process Documentation";
const DEFAULT_SUBTITLE =
  "Select a department to view and document its processes. Each process step opens a panel for detailed steps and team comments.";

export function Header({
  showBack = false,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  backHref = "/",
}: HeaderProps) {
  return (
    <header className="page">
      <div className="row">
        <Link
          href={backHref}
          className={`back-btn${showBack ? " show" : ""}`}
          aria-hidden={!showBack}
          tabIndex={showBack ? 0 : -1}
        >
          ← All departments
        </Link>
        <h1>{title}</h1>
      </div>
      <p>{subtitle}</p>
    </header>
  );
}
