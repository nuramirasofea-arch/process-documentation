"use client";

import { useState } from "react";
import { RichTextEditor } from "@/app/components/rich-text-editor";
import { sanitizeHtml, stripTags } from "@/lib/sanitize-html";
import type { Comment } from "@/lib/types";

interface CommentSectionProps {
  comments: Comment[];
  onPost: (html: string) => void;
  onDelete: (index: number) => void;
}

const COMMENT_PLACEHOLDER =
  "Comments are for discussion about this step - not the procedure itself (that goes in the field above). Use this to raise questions, flag a pain point or bottleneck, suggest an improvement, note who owns an open issue, or add context the team should know. Tip: start with your point, then add detail.";

export function CommentSection({
  comments,
  onPost,
  onDelete,
}: CommentSectionProps) {
  const [draft, setDraft] = useState("");

  const postComment = () => {
    const html = sanitizeHtml(draft);
    if (!stripTags(html).trim()) return;
    onPost(html);
    setDraft("");
  };

  return (
    <div className="comments">
      <p className="field-label">
        Comments <span className="cbadge">{comments.length}</span>
      </p>
      <div className="comments-scroll">
        <ul className="comment-list">
          {comments.map((comment, index) => (
            <li key={`${comment.when}-${index}`} className="comment">
              <div className="meta">
                <span>{comment.when}</span>
                <button
                  type="button"
                  className="del"
                  onClick={() => onDelete(index)}
                >
                  delete
                </button>
              </div>
              <div
                className="body"
                dangerouslySetInnerHTML={{ __html: comment.html }}
              />
            </li>
          ))}
        </ul>
        <div className="comment-add">
          <RichTextEditor
            value={draft}
            onChange={setDraft}
            placeholder={COMMENT_PLACEHOLDER}
            editorClassName="rt-editor-lg"
            onCtrlEnter={postComment}
          />
          <button type="button" className="post" onClick={postComment}>
            Post comment
          </button>
        </div>
      </div>
    </div>
  );
}
