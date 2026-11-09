export const FEEDBACK_KEY = "orgdocs-feedback-v1";
export type FeedbackNote = {
  id: string;
  page: string;
  url: string;
  title: string;
  selector: string;
  tag: string;
  excerpt: string;
  x: number;
  y: number;
  viewport: { width: number; height: number };
  text: string;
  status: "open" | "done";
  createdAt: string;
  updatedAt: string;
};
export type FeedbackFile = {
  format: "orgdocs-feedback";
  version: 1;
  exportedAt: string;
  notes: FeedbackNote[];
};
export function readFeedback(raw: string | null): FeedbackNote[] {
  if (!raw) return [];
  const value = JSON.parse(raw);
  if (
    !Array.isArray(value) ||
    value.some(
      (n) =>
        !n ||
        typeof n.id !== "string" ||
        typeof n.page !== "string" ||
        typeof n.selector !== "string" ||
        typeof n.text !== "string" ||
        !["open", "done"].includes(n.status) ||
        typeof n.createdAt !== "string" ||
        typeof n.updatedAt !== "string" ||
        typeof n.excerpt !== "string" ||
        typeof n.tag !== "string" ||
        typeof n.x !== "number" ||
        typeof n.y !== "number" ||
        !n.viewport ||
        typeof n.viewport.width !== "number" ||
        typeof n.viewport.height !== "number",
    )
  )
    throw Error(
      "یادداشت‌های ذخیره‌شده قابل خواندن نیستند؛ داده موجود پاک نشده است.",
    );
  return value;
}
export function feedbackFile(
  notes: FeedbackNote[],
  now = new Date().toISOString(),
): FeedbackFile {
  return {
    format: "orgdocs-feedback",
    version: 1,
    exportedAt: now,
    notes: notes.filter((note) => note.status === "open"),
  };
}
export function elementExcerpt(el: Element) {
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  ) {
    return (
      el.labels?.[0]?.textContent ||
      el.getAttribute("aria-label") ||
      el.getAttribute("placeholder") ||
      el.tagName
    )
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 140);
  }
  return (
    el.getAttribute("aria-label") ||
    el.getAttribute("alt") ||
    el.textContent ||
    el.tagName
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}
export function elementSelector(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;
  while (current && current !== document.documentElement) {
    if (current.id) {
      parts.unshift("#" + CSS.escape(current.id));
      break;
    }
    const parent: Element | null = current.parentElement;
    const siblings = parent
      ? Array.from(parent.children).filter(
          (s) => s.tagName === current!.tagName,
        )
      : [];
    parts.unshift(
      current.tagName.toLowerCase() +
        `:nth-of-type(${siblings.indexOf(current) + 1})`,
    );
    current = parent;
  }
  return parts.join(" > ");
}

