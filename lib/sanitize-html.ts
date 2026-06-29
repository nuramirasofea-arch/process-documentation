/**
 * HTML sanitization for documentation content only.
 *
 * Comments are plain text and use `formatCommentForDisplay` instead.
 * Documentation is sanitized on save (client-side) before Supabase upsert;
 * there is no server-side re-sanitization on read.
 */
const ALLOWED_TAGS: Record<string, number> = {
  B: 1,
  STRONG: 1,
  I: 1,
  EM: 1,
  U: 1,
  S: 1,
  STRIKE: 1,
  DEL: 1,
  UL: 1,
  OL: 1,
  LI: 1,
  BR: 1,
  P: 1,
  DIV: 1,
  SPAN: 1,
  FONT: 1,
  H1: 1,
  H2: 1,
  H3: 1,
  H4: 1,
  BLOCKQUOTE: 1,
  PRE: 1,
  CODE: 1,
  A: 1,
  SUB: 1,
  SUP: 1,
};

const SAFE_STYLE =
  /^(color|background-color|font-size|font-weight|font-style|text-decoration|text-decoration-line|text-align)$/i;

const FONT_SIZE_MAP: Record<string, string> = {
  "1": "12px",
  "2": "14px",
  "3": "16px",
  "4": "18px",
  "5": "24px",
  "6": "32px",
  "7": "40px",
};

function walk(node: Node): void {
  const children = [...node.childNodes];
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      if (!ALLOWED_TAGS[el.tagName]) {
        while (el.firstChild) {
          node.insertBefore(el.firstChild, el);
        }
        node.removeChild(el);
        walk(node);
        continue;
      }

      if (el.tagName === "FONT") {
        const span = document.createElement("span");
        if (el.getAttribute("color")) {
          span.style.color = el.getAttribute("color")!;
        }
        const sz = el.getAttribute("size");
        if (sz && FONT_SIZE_MAP[sz]) {
          span.style.fontSize = FONT_SIZE_MAP[sz];
        }
        while (el.firstChild) {
          span.appendChild(el.firstChild);
        }
        node.replaceChild(span, el);
        walk(span);
        continue;
      }

      const keepStyle: string[] = [];
      const align = el.getAttribute("align") || el.style.textAlign;
      const styleAttr = el.getAttribute("style") || "";
      styleAttr.split(";").forEach((rule) => {
        const i = rule.indexOf(":");
        if (i < 0) return;
        const prop = rule.slice(0, i).trim();
        const val = rule.slice(i + 1).trim();
        if (SAFE_STYLE.test(prop) && !/url\(|expression|javascript:/i.test(val)) {
          keepStyle.push(`${prop}:${val}`);
        }
      });

      const href = el.tagName === "A" ? el.getAttribute("href") : null;
      [...el.attributes].forEach((a) => el.removeAttribute(a.name));

      if (keepStyle.length) {
        el.setAttribute("style", keepStyle.join(";"));
      } else if (align && /^(left|center|right|justify)$/i.test(align)) {
        el.setAttribute("style", `text-align:${align.toLowerCase()}`);
      }

      if (el.tagName === "A") {
        if (href && /^(https?:|mailto:|tel:)/i.test(href.trim())) {
          el.setAttribute("href", href.trim());
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
        } else {
          while (el.firstChild) {
            node.insertBefore(el.firstChild, el);
          }
          node.removeChild(el);
          walk(node);
          continue;
        }
      }

      if (el.tagName === "DIV") {
        const p = document.createElement("p");
        if (el.getAttribute("style")) {
          p.setAttribute("style", el.getAttribute("style")!);
        }
        while (el.firstChild) {
          p.appendChild(el.firstChild);
        }
        node.replaceChild(p, el);
        walk(p);
        continue;
      }

      walk(el);
    } else if (child.nodeType !== Node.TEXT_NODE) {
      node.removeChild(child);
    }
  }
}

/**
 * Whitelist-based sanitizer for rich documentation HTML.
 * Must run in the browser (`document` required); returns input unchanged on the server.
 */
export function sanitizeHtml(html: string): string {
  if (typeof document === "undefined") return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  walk(tmp);
  return tmp.innerHTML;
}

export function stripTags(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, "").replace(/\u00a0/g, " ");
  }
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || "").replace(/\u00a0/g, " ");
}

/** True when a step has non-empty documentation (ignores empty HTML tags). */
export function hasDetailContent(html: string | undefined): boolean {
  return !!(html && stripTags(html).trim());
}

const HTML_ENTITY_MAP: Record<string, string> = {
  nbsp: "\u00a0",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, entity: string) => {
    if (entity.startsWith("#x")) {
      return String.fromCharCode(parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith("#")) {
      return String.fromCharCode(Number(entity.slice(1)));
    }
    return HTML_ENTITY_MAP[entity.toLowerCase()] ?? match;
  });
}

const LEGACY_HTML_COMMENT_PATTERN = /<[a-z][\s\S]*?>/i;

/** Convert legacy stored comment HTML to plain text without DOM parsing. */
function htmlToPlainCommentText(html: string): string {
  if (!html) return "";

  const withLineBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*/gi, "\n")
    .replace(/<\/div>\s*/gi, "\n")
    .replace(/<\/li>\s*/gi, "\n")
    .replace(/<\/h[1-6]>\s*/gi, "\n")
    .replace(/<\/tr>\s*/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return decodeHtmlEntities(withLineBreaks)
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Renders a stored comment as plain text.
 *
 * New rows are plain text; legacy rows may contain HTML from the old rich-text
 * editor. HTML is detected by tag presence and converted without DOM parsing
 * to avoid XSS during conversion.
 */
export function formatCommentForDisplay(stored: string): string {
  if (!stored) return "";
  if (LEGACY_HTML_COMMENT_PATTERN.test(stored)) {
    return htmlToPlainCommentText(stored);
  }
  return stored;
}
