"use client";

import { useCallback, useEffect, useState } from "react";
import { CommentAuthorModal } from "@/app/components/comment-author-modal";
import { RichTextEditor } from "@/app/components/rich-text-editor";
import { getCommentAuthor, setCommentAuthor } from "@/lib/comment-author";
import { sanitizeHtml, stripTags } from "@/lib/sanitize-html";
import type { Comment } from "@/lib/types";

interface CommentSectionProps {
  comments: Comment[];
  isLoading?: boolean;
  isPosting?: boolean;
  onPost: (html: string, author: string) => Promise<void>;
  onToast: (message: string) => void;
}

const COMMENT_PLACEHOLDER =
  "Comments are for discussion about this step - not the procedure itself (that goes in the field above). Use this to raise questions, flag a pain point or bottleneck, suggest an improvement, note who owns an open issue, or add context the team should know. Tip: start with your point, then add detail.";

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
  const [pendingHtml, setPendingHtml] = useState<string | null>(null);

  useEffect(() => {
    setAuthorName(getCommentAuthor() ?? "");
  }, []);

  const submitComment = useCallback(
    async (html: string, author: string) => {
      try {
        await onPost(html, author);
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

      if (pendingHtml) {
        void submitComment(pendingHtml, name);
        setPendingHtml(null);
      }
    },
    [pendingHtml, submitComment],
  );

  const handlePost = () => {
    const html = sanitizeHtml(draft);
    if (!stripTags(html).trim()) return;

    if (!authorName.trim()) {
      setPendingHtml(html);
      setShowAuthorModal(true);
      return;
    }

    void submitComment(html, authorName);
  };

  const closeAuthorModal = () => {
    setShowAuthorModal(false);
    setPendingHtml(null);
  };

  return (
    <>
      <div className="comments">
        <p className="field-label">
          Comments <span className="cbadge">{comments.length}</span>
        </p>
        <div className="comments-scroll">
          <ul className="comment-list">
            {comments.map((comment) => (
              <li key={comment.id} className="comment">
                <div className="meta">
                  <span>
                    <strong>{comment.author}</strong> · {comment.when}
                  </span>
                </div>
                <div
                  className="body"
                  dangerouslySetInnerHTML={{ __html: comment.html }}
                />
              </li>
            ))}
          </ul>
          {isLoading && comments.length === 0 && (
            <p className="comment-status">Loading comments…</p>
          )}
          <div className="comment-add">
            {authorName && (
              <p className="comment-author-bar">
                Posting as <strong>{authorName}</strong>
                <button
                  type="button"
                  className="comment-change-name"
                  onClick={() => setShowAuthorModal(true)}
                >
                  Change name
                </button>
              </p>
            )}
            <RichTextEditor
              value={draft}
              onChange={setDraft}
              placeholder={COMMENT_PLACEHOLDER}
              editorClassName="rt-editor-lg"
              onCtrlEnter={handlePost}
            />
            <button
              type="button"
              className="post"
              disabled={isPosting}
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
