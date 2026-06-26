"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";import { ProcessCard } from "@/app/components/process-card";
import {
  hasDetailContent,
  ProcessDrawer,
} from "@/app/components/process-drawer";
import {
  documentationToState,
  saveDocumentation,
  type DocumentationRecord,
} from "@/lib/documentation";
import {
  getProcessesForDepartment,
  PARKING_LOT,
} from "@/lib/mock-data";
import { stripTags } from "@/lib/sanitize-html";
import type { Comment, DrawerContext, Process, ProcessStep } from "@/lib/types";

interface DepartmentViewProps {
  departmentSlug: string;
  departmentName: string;
  departmentBlurb: string;
  isParkingLot?: boolean;
  initialDocumentation?: DocumentationRecord[];
}

function Legend() {
  return (
    <div className="legend">
      <h2>Legend</h2>
      <div className="legend-grid">
        <div className="leg">
          <span className="swatch" style={{ background: "var(--ink)" }} />
          Black — high-level process
        </div>
        <div className="leg">
          <span className="swatch" style={{ background: "var(--handoff)" }} />
          Blue — hand-off
        </div>
        <div className="leg">
          <span className="swatch" style={{ background: "var(--pain)" }} />
          Red — delay / pain point
        </div>
        <div className="leg">
          <span className="swatch" style={{ background: "var(--opp)" }} />
          Green — opportunity
        </div>
        <div className="leg">
          <span
            className="dot"
            style={{ background: "var(--dot-yellow)" }}
          />
          Pain / back &amp; forth
        </div>
        <div className="leg">
          <span className="dot" style={{ background: "var(--dot-green)" }} />
          Quick-win
        </div>
        <div className="leg">
          <span
            className="dot"
            style={{ background: "var(--dot-orange)" }}
          />
          Work waits here
        </div>
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
}: {
  proc: Process;
  details: Record<string, string>;
  comments: Record<string, Comment[]>;
  activeStepKey: string | null;
  onStepClick: (context: DrawerContext) => void;
}) {
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
              stepKey={stepKey}
              step={step}
              stepIndex={index}
              isActive={activeStepKey === stepKey}
              hasNote={hasDetailContent(details[stepKey])}
              commentCount={(comments[stepKey] ?? []).length}
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
}: {
  details: Record<string, string>;
  comments: Record<string, Comment[]>;
  activeStepKey: string | null;
  onStepClick: (context: DrawerContext) => void;
}) {
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
              stepKey={stepKey}
              step={step}
              stepIndex={index}
              isActive={activeStepKey === stepKey}
              hasNote={hasDetailContent(details[stepKey])}
              commentCount={(comments[stepKey] ?? []).length}
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
  const initialState = useMemo(
    () => documentationToState(initialDocumentation),
    [initialDocumentation],
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContext, setDrawerContext] = useState<DrawerContext | null>(null);
  const [details, setDetails] = useState<Record<string, string>>(
    () => initialState.details,
  );
  const [recordIds, setRecordIds] = useState<Record<string, string>>(
    () => initialState.recordIds,
  );
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const nextState = documentationToState(initialDocumentation);
    setDetails(nextState.details);
    setRecordIds(nextState.recordIds);
  }, [initialDocumentation]);

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

      if (error) {
        throw error;
      }

      setDetails((prev) => ({ ...prev, [processKey]: data.content }));
      setRecordIds((prev) => ({ ...prev, [processKey]: data.id }));
      router.refresh();
    },
    [departmentSlug, drawerContext, router],
  );

  const handlePostComment = useCallback(
    (html: string) => {
      if (!drawerContext) return;
      const entry: Comment = {
        html,
        when: new Date().toLocaleString(),
      };
      setComments((prev) => ({
        ...prev,
        [drawerContext.stepKey]: [...(prev[drawerContext.stepKey] ?? []), entry],
      }));
    },
    [drawerContext],
  );

  const handleDeleteComment = useCallback(
    (index: number) => {
      if (!drawerContext) return;
      setComments((prev) => {
        const list = [...(prev[drawerContext.stepKey] ?? [])];
        list.splice(index, 1);
        return { ...prev, [drawerContext.stepKey]: list };
      });
    },
    [drawerContext],
  );

  useEffect(() => {
    const hasUnsaved = Object.values(details).some(
      (html) => stripTags(html).length > 0,
    );
    if (!hasUnsaved) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [details]);

  const activeStepKey = drawerOpen ? drawerContext?.stepKey ?? null : null;
  const currentDetail = drawerContext
    ? details[drawerContext.stepKey] ?? ""
    : "";
  const currentComments = drawerContext
    ? comments[drawerContext.stepKey] ?? []
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
          onClose={closeDrawer}
          onSaveDetail={handleSaveDetail}
          onPostComment={handlePostComment}
          onDeleteComment={handleDeleteComment}
          onToast={showToast}
        />
      </div>

      <div className={`toast${toastVisible ? " show" : ""}`}>{toastMessage}</div>
    </>
  );
}
