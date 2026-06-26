"use client";

import { useCallback, useEffect, useState } from "react";
import { CommentSection } from "@/app/components/comment-section";
import { RichTextEditor } from "@/app/components/rich-text-editor";
import { KTAG } from "@/lib/constants";
import { sanitizeHtml, stripTags } from "@/lib/sanitize-html";
import type { Comment, DrawerContext } from "@/lib/types";

interface ProcessDrawerProps {
  isOpen: boolean;
  context: DrawerContext | null;
  detailHtml: string;
  comments: Comment[];
  onClose: () => void;
  onSaveDetail: (html: string) => Promise<void>;
  onPostComment: (html: string) => void;
  onDeleteComment: (index: number) => void;
  onToast: (message: string) => void;
}

export function ProcessDrawer({
  isOpen,
  context,
  detailHtml,
  comments,
  onClose,
  onSaveDetail,
  onPostComment,
  onDeleteComment,
  onToast,
}: ProcessDrawerProps) {
  const [draft, setDraft] = useState(detailHtml);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(detailHtml);
    setIsDirty(false);
  }, [detailHtml, context?.stepKey]);

  const saveDetail = useCallback(async () => {
    if (isSaving) return;

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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isDirty && !isSaving) {
          void saveDetail();
        }
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDirty, isSaving, onClose, saveDetail]);

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
              if (isDirty && !isSaving) {
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
      <div className="panel-body">
        <div className="detail-section">
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
        <CommentSection
          comments={comments}
          onPost={onPostComment}
          onDelete={onDeleteComment}
        />
      </div>
    </aside>
  );
}

export function hasDetailContent(html: string | undefined): boolean {
  return !!(html && stripTags(html).trim());
}
