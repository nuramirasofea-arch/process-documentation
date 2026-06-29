"use client";

import { useCallback, useEffect, useState } from "react";
import { CommentAuthorModal } from "@/app/components/comment-author-modal";
import { getCommentAuthor, setCommentAuthor } from "@/lib/comment-author";
import { formatCommentTimestamp } from "@/lib/format-comment-date";
import { formatCommentForDisplay } from "@/lib/sanitize-html";
import type { Comment } from "@/lib/types";

interface CommentSectionProps {
  comments: Comment[];
  isLoading?: boolean;
  isPosting?: boolean;
  onPost: (text: string, author: string) => Promise<void>;
  onToast: (message: string) => void;
}

const COMMENT_PLACEHOLDER =
  "Discuss this step — ask a question, flag a bottleneck, or add context for the team. Plain text only.";

export function CommentSection({
  comments,
  isLoading = false,
  isPosting = false,
  onPost,
  onToast,
}: CommentSectionProps) {
  const [draft, setDraft] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [pendingText, setPendingText] = useState<string | null>(null);

  useEffect(() => {
    setAuthorName(getCommentAuthor() ?? "");
  }, []);

  const submitComment = useCallback(
    async (text: string, author: string) => {
      try {
        await onPost(text, author);
        setDraft("");
      } catch (error) {
        onToast(
          error instanceof Error ? error.message : "Failed to post comment",
        );
      }
    },
    [onPost, onToast],
  );

  const handleAuthorConfirm = useCallback(
    (name: string) => {
      setCommentAuthor(name);
      setAuthorName(name);
      setShowAuthorModal(false);

      if (pendingText) {
        void submitComment(pendingText, name);
        setPendingText(null);
      }
    },
    [pendingText, submitComment],
  );

  const handlePost = () => {
    const text = draft.trim();
    if (!text) return;

    if (!authorName.trim()) {
      setPendingText(text);
      setShowAuthorModal(true);
      return;
    }

    void submitComment(text, authorName);
  };

  const closeAuthorModal = () => {
    setShowAuthorModal(false);
    setPendingText(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handlePost();
    }
  };

  return (
    <>
      <div className="comments-panel">
        <p className="comments-panel-intro">
          Team discussion for this step. Official procedures belong in
          Documentation.
        </p>

        <div className="comments-scroll">
          {isLoading && comments.length === 0 ? (
            <p className="comment-loading">Loading comments…</p>
          ) : comments.length === 0 ? (
            <div className="comment-empty">
              <span className="comment-empty-icon" aria-hidden="true">
                💬
              </span>
              <p className="comment-empty-title">No comments yet</p>
              <p className="comment-empty-sub">
                Start the discussion by posting the first comment.
              </p>
            </div>
          ) : (
            <ul className="comment-list">
              {comments.map((comment) => (
                <li key={comment.id} className="comment">
                  <header className="comment-header">
                    <strong className="comment-author">{comment.author}</strong>
                    <time
                      className="comment-time"
                      dateTime={comment.createdAt}
                    >
                      {formatCommentTimestamp(comment.createdAt)}
                    </time>
                  </header>
                  <div className="comment-body">
                    {formatCommentForDisplay(comment.text)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="comment-compose">
          {authorName && (
            <p className="comment-author-bar">
              Commenting as <strong>{authorName}</strong>
              <button
                type="button"
                className="comment-change-name"
                onClick={() => setShowAuthorModal(true)}
              >
                Change name
              </button>
            </p>
          )}
          <textarea
            className="comment-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={COMMENT_PLACEHOLDER}
            rows={4}
            aria-label="New comment"
          />
          <div className="comment-compose-actions">
            <button
              type="button"
              className="post"
              disabled={isPosting || !draft.trim()}
              onClick={handlePost}
            >
              {isPosting ? "Posting…" : "Post comment"}
            </button>
          </div>
        </div>
      </div>

      <CommentAuthorModal
        isOpen={showAuthorModal}
        initialName={authorName}
        title={authorName ? "Change your name" : "Your name"}
        onConfirm={handleAuthorConfirm}
        onCancel={closeAuthorModal}
      />
    </>
  );
}
