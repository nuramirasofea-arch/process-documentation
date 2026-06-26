import { DOT_COLOR, PILL } from "@/lib/constants";
import type { ProcessStep } from "@/lib/types";

interface ProcessCardProps {
  stepKey: string;
  step: ProcessStep;
  stepIndex: number;
  isActive: boolean;
  hasNote: boolean;
  commentCount: number;
  onClick: () => void;
}

function connectorClass(kind: ProcessStep["k"]): string {
  if (kind === "handoff") return "connector handoff";
  if (kind === "pain") return "connector pain";
  if (kind === "opp") return "connector opp";
  return "connector";
}

export function ProcessCard({
  stepKey,
  step,
  stepIndex,
  isActive,
  hasNote,
  commentCount,
  onClick,
}: ProcessCardProps) {
  const pill = PILL[step.k];
  const dots = step.dots ?? [];

  return (
    <>
      {stepIndex > 0 && <div className={connectorClass(step.k)} />}
      <button
        type="button"
        className={`step-bar kind-${step.k}${isActive ? " active" : ""}`}
        data-key={stepKey}
        onClick={onClick}
      >
        <span className="step-num">{stepIndex + 1}</span>
        <span className="step-title">{step.t}</span>
        <span className="step-right">
          {dots.length > 0 && (
            <span className="step-dots">
              {dots.map((dot) => (
                <span
                  key={dot}
                  className="dot"
                  style={{ background: DOT_COLOR[dot] }}
                />
              ))}
            </span>
          )}
          {pill && <span className={`pill ${pill[0]}`}>{pill[1]}</span>}
          <span className="chips">
            <span className={`chip note${hasNote ? " has" : ""}`}>note</span>
            <span className={`chip cmt${commentCount > 0 ? " has" : ""}`}>
              {commentCount}
            </span>
          </span>
        </span>
      </button>
    </>
  );
}
