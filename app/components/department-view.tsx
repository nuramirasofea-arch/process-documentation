"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProcessCard } from "@/app/components/process-card";
import { ProcessDrawer } from "@/app/components/process-drawer";
import {
  getCommentsByDepartment,
  getCommentsForStep,
  groupCommentsByProcessKey,
  postComment,
} from "@/lib/comments";
import {
  documentationToDetails,
  saveDocumentation,
  type DocumentationRecord,
} from "@/lib/documentation";
import { getProcessesForDepartment, PARKING_LOT } from "@/lib/mock-data";
import { hasDetailContent } from "@/lib/sanitize-html";
import type { Comment, DrawerContext, Process, ProcessStep } from "@/lib/types";

interface DepartmentViewProps {
  departmentSlug: string;
  departmentName: string;
  departmentBlurb: string;
  isParkingLot?: boolean;
  initialDocumentation?: DocumentationRecord[];
}

interface FlowSectionProps {
  details: Record<string, string>;
  comments: Record<string, Comment[]>;
  activeStepKey: string | null;
  onStepClick: (context: DrawerContext) => void;
}

function Legend() {
  const items = [
    { swatch: "var(--ink)", label: "Black — high-level process" },
    { swatch: "var(--handoff)", label: "Blue — hand-off" },
    { swatch: "var(--pain)", label: "Red — delay / pain point" },
    { swatch: "var(--opp)", label: "Green — opportunity" },
  ] as const;

  const dots = [
    { color: "var(--dot-yellow)", label: "Pain / back & forth" },
    { color: "var(--dot-green)", label: "Quick-win" },
    { color: "var(--dot-orange)", label: "Work waits here" },
  ] as const;

  return (
    <div className="legend">
      <h2>Legend</h2>
      <div className="legend-grid">
        {items.map(({ swatch, label }) => (
          <div key={label} className="leg">
            <span className="swatch" style={{ background: swatch }} />
            {label}
          </div>
        ))}
        {dots.map(({ color, label }) => (
          <div key={label} className="leg">
            <span className="dot" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessSection({
  proc,
  details,
  comments,
  activeStepKey,
  onStepClick,
}: FlowSectionProps & { proc: Process }) {
  return (
    <section className="proc">
      <div className="proc-head">
        <span className="seq">{proc.seq}</span>
        <h3>{proc.title}</h3>
        <span className="tag">{proc.tag}</span>
      </div>
      <div className="flow-list">
        {proc.steps.map((step, index) => {
          const stepKey = `${proc.id}.${index}`;
          return (
            <ProcessCard
              key={stepKey}
              step={step}
              stepIndex={index}
              isActive={activeStepKey === stepKey}
              hasNote={hasDetailContent(details[stepKey])}
              commentCount={comments[stepKey]?.length ?? 0}
              onClick={() =>
                onStepClick({
                  stepKey,
                  proc: { seq: proc.seq, title: proc.title },
                  step,
                  stepIndex: index,
                })
              }
            />
          );
        })}
      </div>
      {proc.pains && (
        <p className="branch-note">Process-level pain points: {proc.pains}</p>
      )}
    </section>
  );
}

function ParkingLotSection({
  details,
  comments,
  activeStepKey,
  onStepClick,
}: FlowSectionProps) {
  const pseudoProc = { seq: "PL", title: "Parking Lot" };

  return (
    <section className="proc">
      <div className="proc-head">
        <span className="seq">PL</span>
        <h3>Not yet mapped</h3>
        <span className="tag">Documentation</span>
      </div>
      <div className="flow-list">
        {PARKING_LOT.items.map((item, index) => {
          const stepKey = `${item.id}.0`;
          const step: ProcessStep = { k: "process", t: item.t };
          return (
            <ProcessCard
              key={stepKey}
              step={step}
              stepIndex={index}
              isActive={activeStepKey === stepKey}
              hasNote={hasDetailContent(details[stepKey])}
              commentCount={comments[stepKey]?.length ?? 0}
              onClick={() =>
                onStepClick({
                  stepKey,
                  proc: pseudoProc,
                  step,
                  stepIndex: index,
                })
              }
            />
          );
        })}
      </div>
      <p className="branch-note">{PARKING_LOT.questions}</p>
    </section>
  );
}

export function DepartmentView({
  departmentSlug,
  departmentName,
  departmentBlurb,
  isParkingLot = false,
  initialDocumentation = [],
}: DepartmentViewProps) {
  const router = useRouter();

  const serverDetails = useMemo(
    () => documentationToDetails(initialDocumentation),
    [initialDocumentation],
  );

  const [pendingDetails, setPendingDetails] = useState<Record<string, string>>(
    {},
  );
  const details = useMemo(
    () => ({ ...serverDetails, ...pendingDetails }),
    [serverDetails, pendingDetails],
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContext, setDrawerContext] = useState<DrawerContext | null>(
    null,
  );
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPosting, setCommentsPosting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCommentCounts() {
      const { data, error } = await getCommentsByDepartment(departmentSlug);
      if (cancelled || error) {
        if (error) console.error("Failed to load comment counts:", error.message);
        return;
      }

      setComments(groupCommentsByProcessKey(data));
    }

    void loadCommentCounts();
    return () => {
      cancelled = true;
    };
  }, [departmentSlug]);

  useEffect(() => {
    if (!drawerOpen || !drawerContext) return;

    const processKey = drawerContext.stepKey;
    let cancelled = false;

    async function loadStepComments() {
      setCommentsLoading(true);
      try {
        const { data, error } = await getCommentsForStep(
          departmentSlug,
          processKey,
        );
        if (cancelled || error) {
          if (error) console.error("Failed to load comments:", error.message);
          return;
        }

        setComments((prev) => ({ ...prev, [processKey]: data }));
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    }

    void loadStepComments();
    return () => {
      cancelled = true;
    };
  }, [departmentSlug, drawerContext, drawerOpen]);

  const processes = useMemo(
    () => (isParkingLot ? [] : getProcessesForDepartment(departmentSlug)),
    [departmentSlug, isParkingLot],
  );

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 1800);
  }, []);

  const openDrawer = useCallback((context: DrawerContext) => {
    setDrawerContext(context);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDrawerContext(null);
  }, []);

  const handleSaveDetail = useCallback(
    async (html: string) => {
      if (!drawerContext) return;

      const processKey = drawerContext.stepKey;
      const { data, error } = await saveDocumentation(
        departmentSlug,
        processKey,
        html,
      );

      if (error) throw error;

      setPendingDetails((prev) => ({ ...prev, [processKey]: data.content }));
      router.refresh();
    },
    [departmentSlug, drawerContext, router],
  );

  const handlePostComment = useCallback(
    async (html: string, author: string) => {
      if (!drawerContext) return;

      const processKey = drawerContext.stepKey;
      setCommentsPosting(true);

      try {
        const { error: postError } = await postComment(
          departmentSlug,
          processKey,
          author,
          html,
        );
        if (postError) throw postError;

        const { data, error: reloadError } = await getCommentsForStep(
          departmentSlug,
          processKey,
        );
        if (reloadError) throw reloadError;

        setComments((prev) => ({ ...prev, [processKey]: data }));
      } finally {
        setCommentsPosting(false);
      }
    },
    [departmentSlug, drawerContext],
  );

  const activeStepKey = drawerOpen ? (drawerContext?.stepKey ?? null) : null;
  const currentDetail = drawerContext
    ? (details[drawerContext.stepKey] ?? "")
    : "";
  const currentComments = drawerContext
    ? (comments[drawerContext.stepKey] ?? [])
    : [];

  return (
    <>
      <div className="dept-shell">
        <div className={`flow-area${drawerOpen ? " shifted" : ""}`}>
          <Legend />
          <h2 className="dept-title">
            {isParkingLot ? departmentName : `${departmentName} Processes`}
          </h2>
          <p className="dept-sub">{departmentBlurb}</p>
          <div className="dept-procs">
            {isParkingLot ? (
              <ParkingLotSection
                details={details}
                comments={comments}
                activeStepKey={activeStepKey}
                onStepClick={openDrawer}
              />
            ) : (
              processes.map((proc) => (
                <ProcessSection
                  key={proc.id}
                  proc={proc}
                  details={details}
                  comments={comments}
                  activeStepKey={activeStepKey}
                  onStepClick={openDrawer}
                />
              ))
            )}
          </div>
        </div>

        <ProcessDrawer
          isOpen={drawerOpen}
          context={drawerContext}
          detailHtml={currentDetail}
          comments={currentComments}
          commentsLoading={commentsLoading}
          commentsPosting={commentsPosting}
          onClose={closeDrawer}
          onSaveDetail={handleSaveDetail}
          onPostComment={handlePostComment}
          onToast={showToast}
        />
      </div>

      <div className={`toast${toastVisible ? " show" : ""}`}>{toastMessage}</div>
    </>
  );
}
