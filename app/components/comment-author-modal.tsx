"use client";

import { useState } from "react";

interface CommentAuthorModalProps {
  isOpen: boolean;
  initialName?: string;
  title?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

function AuthorModalForm({
  initialName,
  title,
  onConfirm,
  onCancel,
}: Omit<CommentAuthorModalProps, "isOpen">) {
  const [name, setName] = useState(initialName ?? "");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onConfirm(trimmed);
  };

  return (
    <div className="author-modal-backdrop" onClick={onCancel}>
      <div
        className="author-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="author-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h4 id="author-modal-title">{title}</h4>
        <p className="author-modal-sub">
          Your name will appear on comments you post.
        </p>
        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="comment-author-name">
            Name
          </label>
          <input
            id="comment-author-name"
            className="author-modal-input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            autoFocus
          />
          <div className="author-modal-actions">
            <button type="button" className="author-modal-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={!name.trim()}>
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CommentAuthorModal({
  isOpen,
  initialName = "",
  title = "Your name",
  onConfirm,
  onCancel,
}: CommentAuthorModalProps) {
  if (!isOpen) return null;

  return (
    <AuthorModalForm
      key={initialName}
      initialName={initialName}
      title={title}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
