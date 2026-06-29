"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

/**
 * contentEditable documentation editor backed by `document.execCommand`.
 *
 * Toolbar actions would collapse the selection without save/restore because
 * button mousedown steals focus from the editable region.
 */
const FORMAT_COMMANDS = [
  "bold",
  "italic",
  "underline",
  "strikeThrough",
  "insertUnorderedList",
  "insertOrderedList",
  "justifyLeft",
  "justifyCenter",
  "justifyRight",
] as const;

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  variant?: "default" | "detail";
  showGuide?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onCtrlEnter?: () => void;
  onCtrlS?: () => void;
  editorClassName?: string;
}

function EditorGuide() {
  return (
    <div className="editor-guide" aria-hidden="true">
      <p className="g-lead">
        Describe how this step runs, as a repeatable procedure:
      </p>
      <ol className="g-list">
        <li>
          <b>Purpose / Trigger</b> — what starts this step and what it should
          achieve
        </li>
        <li>
          <b>Owner</b> — the role or team responsible (name the role, not the
          person)
        </li>
        <li>
          <b>Inputs</b> — what must be ready before starting
        </li>
        <li>
          <b>Actions</b> — the steps in order, one per line, each starting with
          a verb
        </li>
        <li>
          <b>Systems / tools</b> — what&apos;s used (e.g. ORND, Asana, email)
        </li>
        <li>
          <b>Output / done</b> — what exists when the step is complete
        </li>
        <li>
          <b>Timing</b> — how long it should take, or any deadline
        </li>
        <li>
          <b>Hand-off</b> — who receives the work next and how they&apos;re told
        </li>
        <li>
          <b>What if something goes wrong</b> — delays, missing info,
          rejection, cancellation
        </li>
      </ol>
      <p className="g-tip">
        Tip: use headings and bullet lists to keep it scannable.
      </p>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  variant = "default",
  showGuide = false,
  onFocus,
  onBlur,
  onCtrlEnter,
  onCtrlS,
  editorClassName = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [activeCommands, setActiveCommands] = useState<Record<string, boolean>>(
    {},
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isFilled, setIsFilled] = useState(() => value.trim().length > 0);

  useEffect(() => {
    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch {
      // execCommand may be unavailable in some environments
    }
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || editor.innerHTML === value) return;
    // Sync external value (e.g. step change) without clobbering in-progress edits.
    editor.innerHTML = value;
    setIsFilled(value.replace(/<[^>]*>/g, "").trim().length > 0);
  }, [value]);

  const saveSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (
      !editor ||
      !selection ||
      selection.rangeCount === 0 ||
      !editor.contains(selection.anchorNode)
    ) {
      return;
    }
    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  }, []);

  const restoreSelection = useCallback(() => {
    const range = savedRangeRef.current;
    const selection = window.getSelection();
    if (!range || !selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const syncToolbar = useCallback(() => {
    const next: Record<string, boolean> = {};
    for (const cmd of FORMAT_COMMANDS) {
      try {
        next[cmd] = document.queryCommandState(cmd);
      } catch {
        next[cmd] = false;
      }
    }
    setActiveCommands(next);
  }, []);

  const handleInput = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    saveSelection();
    onChange(editor.innerHTML);
    setIsFilled(editor.textContent?.trim().length ? true : false);
    syncToolbar();
  }, [onChange, saveSelection, syncToolbar]);

  const runCommand = useCallback(
    (command: string, valueArg?: string) => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      restoreSelection();
      document.execCommand(command, false, valueArg ?? undefined);
      saveSelection();
      handleInput();
    },
    [handleInput, restoreSelection, saveSelection],
  );

  const handleToolbarMouseDown = (event: React.MouseEvent) => {
    // Prevent focus loss so execCommand applies to the saved selection.
    event.preventDefault();
    saveSelection();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      onCtrlS?.();
      return;
    }
    if (
      event.key === "Enter" &&
      (event.metaKey || event.ctrlKey) &&
      onCtrlEnter
    ) {
      event.preventDefault();
      onCtrlEnter();
    }
  };

  const editorClasses = [
    "rt-editor",
    variant === "detail" ? "detail" : "",
    editorClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const wrapClasses = [
    "editor-wrap",
    isFilled ? "filled" : "",
    isEditing ? "editing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const toolbar = (
    <div className="rt-toolbar rt-full">
        <select
          className="rt-select"
          data-action="formatBlock"
          title="Paragraph style"
          defaultValue="P"
          onMouseDown={handleToolbarMouseDown}
          onChange={(event) => {
            if (event.target.value) {
              runCommand("formatBlock", event.target.value);
            }
            event.target.selectedIndex = 0;
          }}
        >
          <option value="P">Normal</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
          <option value="BLOCKQUOTE">Quote</option>
          <option value="PRE">Code block</option>
        </select>
        <select
          className="rt-select"
          data-action="fontSize"
          title="Font size"
          defaultValue=""
          onMouseDown={handleToolbarMouseDown}
          onChange={(event) => {
            if (event.target.value) {
              runCommand("fontSize", event.target.value);
            }
            event.target.selectedIndex = 0;
          }}
        >
          <option value="">Size</option>
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">X-Large</option>
          <option value="6">Huge</option>
        </select>
        <span className="rt-sep" />
        {(
          [
            ["bold", "B", "Bold (Ctrl+B)"],
            ["italic", "I", "Italic (Ctrl+I)"],
            ["underline", "U", "Underline (Ctrl+U)"],
          ] as const
        ).map(([cmd, label, title]) => (
          <button
            key={cmd}
            type="button"
            data-cmd={cmd}
            title={title}
            className={activeCommands[cmd] ? "active" : ""}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => runCommand(cmd)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          data-cmd="strikeThrough"
          title="Strikethrough"
          className={activeCommands.strikeThrough ? "active" : ""}
          onMouseDown={handleToolbarMouseDown}
          onClick={() => runCommand("strikeThrough")}
        >
          <s>S</s>
        </button>
        <span className="rt-sep" />
        <label className="rt-color" title="Text color">
          <span>A</span>
          <input
            type="color"
            data-action="foreColor"
            defaultValue="#1c1c1c"
            onMouseDown={handleToolbarMouseDown}
            onInput={(event) =>
              runCommand("foreColor", event.currentTarget.value)
            }
          />
        </label>
        <label className="rt-color rt-hl" title="Highlight color">
          <span>H</span>
          <input
            type="color"
            data-action="hiliteColor"
            defaultValue="#fff3a0"
            onMouseDown={handleToolbarMouseDown}
            onInput={(event) => {
              const color = event.currentTarget.value;
              if (!document.execCommand("hiliteColor", false, color)) {
                runCommand("backColor", color);
              } else {
                handleInput();
              }
            }}
          />
        </label>
        <span className="rt-sep" />
        {(
          [
            ["insertUnorderedList", "•", "Bullet list"],
            ["insertOrderedList", "1.", "Numbered list"],
            ["outdent", "⇤", "Decrease indent"],
            ["indent", "⇥", "Increase indent"],
          ] as const
        ).map(([cmd, label, title]) => (
          <button
            key={cmd}
            type="button"
            data-cmd={cmd}
            title={title}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => runCommand(cmd)}
          >
            {label}
          </button>
        ))}
        <span className="rt-sep" />
        {(
          [
            ["justifyLeft", "⇤|", "Align left"],
            ["justifyCenter", "|↔|", "Align center"],
            ["justifyRight", "|⇥", "Align right"],
          ] as const
        ).map(([cmd, label, title]) => (
          <button
            key={cmd}
            type="button"
            data-cmd={cmd}
            title={title}
            className={activeCommands[cmd] ? "active" : ""}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => runCommand(cmd)}
          >
            {label}
          </button>
        ))}
        <span className="rt-sep" />
        <button
          type="button"
          data-action="createLink"
          title="Insert link"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => {
            const url = window.prompt(
              "Link URL (https://, mailto:, tel:)",
              "https://",
            );
            if (url?.trim()) {
              runCommand("createLink", url.trim());
            }
          }}
        >
          🔗
        </button>
        <button
          type="button"
          data-action="unlink"
          title="Remove link"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => runCommand("unlink")}
        >
          🔗✕
        </button>
        <button
          type="button"
          data-cmd="removeFormat"
          title="Clear formatting"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => runCommand("removeFormat")}
        >
          Clear
        </button>
    </div>
  );

  const editor = (
    <div
      ref={editorRef}
      className={editorClasses}
      contentEditable
      role="textbox"
      aria-multiline="true"
      data-placeholder={placeholder}
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyUp={() => {
        saveSelection();
        syncToolbar();
      }}
      onMouseUp={() => {
        saveSelection();
        syncToolbar();
      }}
      onFocus={() => {
        setIsEditing(true);
        onFocus?.();
      }}
      onBlur={() => {
        setIsEditing(false);
        onBlur?.();
      }}
      onKeyDown={handleKeyDown}
    />
  );

  if (showGuide) {
    return (
      <div className="rt-editor-block">
        {toolbar}
        <div className={wrapClasses}>
          {editor}
          <EditorGuide />
        </div>
      </div>
    );
  }

  return (
    <>
      {toolbar}
      {editor}
    </>
  );
}
