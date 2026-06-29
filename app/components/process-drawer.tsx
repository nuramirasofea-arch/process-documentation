"use client";

import { useCallback, useEffect, useState } from "react";
import { CommentSection } from "@/app/components/comment-section";
import { RichTextEditor } from "@/app/components/rich-text-editor";
import { KTAG } from "@/lib/constants";
import { sanitizeHtml } from "@/lib/sanitize-html";
import type { Comment, DrawerContext } from "@/lib/types";

type DrawerPanel = "documentation" | "comments";

interface ProcessDrawerProps {
  isOpen: boolean;
  context: DrawerContext | null;
  detailHtml: string;
  comments: Comment[];
  commentsLoading?: boolean;
  commentsPosting?: boolean;
  onClose: () => void;
  onSaveDetail: (html: string) => Promise<void>;
  onPostComment: (text: string, author: string) => Promise<void>;
  onToast: (message: string) => void;
}

export function ProcessDrawer({
  isOpen,
  context,
  detailHtml,
  comments,
  commentsLoading = false,
  commentsPosting = false,
  onClose,
  onSaveDetail,
  onPostComment,
  onToast,
}: ProcessDrawerProps) {
  const [activePanel, setActivePanel] = useState<DrawerPanel>("documentation");
  const [draft, setDraft] = useState(detailHtml);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(detailHtml);
    setIsDirty(false);
  }, [detailHtml, context?.stepKey]);

  // Documentation is the primary panel; reset when navigating between steps.
  useEffect(() => {
    setActivePanel("documentation");
  }, [context?.stepKey]);

  const saveDetail = useCallback(async () => {
    if (isSaving) return;

    // Sanitize before persist; documentation HTML is the only user content rendered as markup.
    const html = sanitizeHtml(draft);
    setIsSaving(true);
    try {
      await onSaveDetail(html);
      setDraft(html);
      setIsDirty(false);
      onToast("Step documentation saved");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save documentation";
      onToast(message);
    } finally {
      setIsSaving(false);
    }
  }, [draft, isSaving, onSaveDetail, onToast]);

  // Auto-save documentation on Escape/close so edits are not lost silently.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isDirty && !isSaving && activePanel === "documentation") {
          void saveDetail();
        }
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDirty, isSaving, activePanel, onClose, saveDetail]);

  if (!context) {
    return (
      <aside className={`panel${isOpen ? " open" : ""}`} aria-hidden={!isOpen}>
        <div className="panel-head">
          <div className="crumb">
            <span>Process</span>
            <button
              type="button"
              className="close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <h3>Select a step</h3>
        </div>
      </aside>
    );
  }

  const { proc, step, stepIndex } = context;
  const ktag = KTAG[step.k] ?? KTAG.process;

  return (
    <aside className={`panel${isOpen ? " open" : ""}`} aria-hidden={!isOpen}>
      <div className="panel-head">
        <div className="crumb">
          <span>
            {proc.seq}. {proc.title} · step {stepIndex + 1}
          </span>
          <button
            type="button"
            className="close"
            onClick={() => {
              if (isDirty && !isSaving && activePanel === "documentation") {
                void saveDetail();
              }
              onClose();
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <h3>{step.t}</h3>
        <span
          className="ktag"
          style={{ background: ktag[0], color: ktag[1] }}
        >
          {ktag[2]}
        </span>
      </div>

      <div
        className="panel-tabs"
        role="tablist"
        aria-label="Step panel sections"
      >
        <button
          type="button"
          role="tab"
          id="panel-tab-documentation"
          aria-selected={activePanel === "documentation"}
          aria-controls="panel-panel-documentation"
          className={`panel-tab${activePanel === "documentation" ? " active" : ""}`}
          onClick={() => setActivePanel("documentation")}
        >
          Documentation
        </button>
        <button
          type="button"
          role="tab"
          id="panel-tab-comments"
          aria-selected={activePanel === "comments"}
          aria-controls="panel-panel-comments"
          className={`panel-tab${activePanel === "comments" ? " active" : ""}`}
          onClick={() => setActivePanel("comments")}
        >
          Comments
          <span className="cbadge">{comments.length}</span>
        </button>
      </div>

      <div className="panel-body">
        {activePanel === "documentation" && (
          <div
            className="detail-section detail-section-full"
            role="tabpanel"
            id="panel-panel-documentation"
            aria-labelledby="panel-tab-documentation"
          >
            <p className="field-label">Detailed process steps &amp; context</p>
            {step.board && (
              <div className="from-board">
                <b>From the board</b>
                {step.board}
              </div>
            )}
            <RichTextEditor
              value={draft}
              onChange={(html) => {
                setDraft(html);
                setIsDirty(true);
              }}
              variant="detail"
              showGuide
              onCtrlS={() => {
                if (isDirty && !isSaving) {
                  void saveDetail();
                }
              }}
            />
            <div className="detail-actions">
              <span
                className="save-status"
                data-state={isDirty ? "unsaved" : "saved"}
              >
                {isDirty ? "Unsaved changes" : "Saved"}
              </span>
              <button
                type="button"
                className="save-btn"
                disabled={!isDirty || isSaving}
                onClick={() => {
                  void saveDetail();
                }}
              >
                Save
              </button>
            </div>
          </div>
        )}

        {activePanel === "comments" && (
          <div
            role="tabpanel"
            id="panel-panel-comments"
            aria-labelledby="panel-tab-comments"
            className="comments-tab-panel"
          >
            <CommentSection
              comments={comments}
              isLoading={commentsLoading}
              isPosting={commentsPosting}
              onPost={onPostComment}
              onToast={onToast}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
