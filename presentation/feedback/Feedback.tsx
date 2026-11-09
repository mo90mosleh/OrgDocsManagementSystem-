import { useEffect, useRef, useState } from "react";
import {
  MessageSquarePlus,
  List,
  X,
  Download,
  ChevronLeft,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  FEEDBACK_KEY,
  readFeedback,
  feedbackFile,
  elementExcerpt,
  elementSelector,
  type FeedbackNote,
} from "./feedback-model";
import "./feedback.css";
type Rect = { left: number; top: number; width: number; height: number };
const route = () => window.__ORGDEMO_HASH_ROUTING__ ? (location.hash.startsWith("#/") ? location.hash.slice(1) : "/dashboard") : location.pathname === "/" ? "/dashboard" : location.pathname;
const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};
export function Feedback() {
  const [notes, setNotes] = useState<FeedbackNote[]>([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [page, setPage] = useState(route);
  const [hover, setHover] = useState<Rect | null>(null);
  const [draft, setDraft] = useState<FeedbackNote | null>(null);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"page" | "all">("page");
  const [message, setMessage] = useState("");
  const [marks, setMarks] = useState<{ note: FeedbackNote; rect: Rect }[]>([]);
  const [visibleMarks, setVisibleMarks] = useState(true);
  const launcher = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const sync = () => {
      try {
        setNotes(readFeedback(localStorage.getItem(FEEDBACK_KEY)));
        setError("");
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "ذخیره‌سازی مرورگر در دسترس نیست",
        );
      }
    };
    sync();
    const changed = (e: StorageEvent) => {
      if (e.key === FEEDBACK_KEY || e.key === null) sync();
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, []);
  useEffect(() => {
    const changed = () => {
      setPage(route());
      setSelecting(false);
      setHover(null);
    };
    window.addEventListener("hashchange", changed);
    window.addEventListener("orgdocs:route", changed);
    return () => { window.removeEventListener("hashchange", changed); window.removeEventListener("orgdocs:route", changed); };
  }, []);
  useEffect(() => {
    if (draft) editor.current?.focus();
    else if (open) panel.current?.focus();
  }, [draft, open]);
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(id);
  }, [message]);
  const close = () => {
    setOpen(false);
    setDraft(null);
    setSelecting(false);
    setHover(null);
    requestAnimationFrame(() =>
      (restoreFocus.current?.isConnected
        ? restoreFocus.current
        : launcher.current
      )?.focus(),
    );
  };
  function persist(next: FeedbackNote[]) {
    try {
      readFeedback(localStorage.getItem(FEEDBACK_KEY));
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next));
      setNotes(next);
      setError("");
      return true;
    } catch {
      setError(
        "ذخیره یادداشت ممکن نیست. فضای ذخیره‌سازی یا تنظیمات مرورگر را بررسی کن؛ متن فعلی حفظ شده است.",
      );
      return false;
    }
  }
  function begin() {
    restoreFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setOpen(false);
    setDraft(null);
    setHover(null);
    setSelecting(true);
  }
  useEffect(() => {
    if (!selecting) return;
    const target = (raw: EventTarget | null) => {
      if (!(raw instanceof Element) || raw.closest("[data-feedback-ui]"))
        return null;
      if (
        raw === document.body ||
        raw === document.documentElement ||
        raw.id === "app"
      )
        return null;
      return (
        raw.closest(
          'button,a,input,textarea,select,label,h1,h2,h3,p,img,svg[role="img"],section,article,header,footer,nav',
        ) || raw
      );
    };
    const choose = (el: Element, e: MouseEvent | KeyboardEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const r = el.getBoundingClientRect();
      const clicked = e instanceof MouseEvent && e.detail > 0;
      const x = clicked
        ? Math.max(0, Math.min(1, (e.clientX - r.left) / Math.max(r.width, 1)))
        : 0.5;
      const y = clicked
        ? Math.max(0, Math.min(1, (e.clientY - r.top) / Math.max(r.height, 1)))
        : 0.5;
      const now = new Date().toISOString();
      setDraft({
        id: crypto.randomUUID(),
        page: route(),
        url: location.origin + location.pathname + (location.hash.startsWith("#/") ? location.hash.split("?")[0] : ""),
        title: document.title,
        selector: elementSelector(el),
        tag: el.tagName.toLowerCase(),
        excerpt: elementExcerpt(el),
        x,
        y,
        viewport: { width: innerWidth, height: innerHeight },
        text: "",
        status: "open",
        createdAt: now,
        updatedAt: now,
      });
      setText("");
      setSelecting(false);
      setHover(null);
      setOpen(true);
    };
    const click = (e: MouseEvent) => {
      const el = target(e.target);
      if (el) choose(el, e);
    };
    const move = (e: PointerEvent) => {
      const el = target(e.target);
      setHover(el ? rectOf(el) : null);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setSelecting(false);
        setHover(null);
        launcher.current?.focus();
      } else if (e.key === "Enter") {
        const el = target(document.activeElement);
        if (el) choose(el, e);
      }
    };
    window.addEventListener("click", click, true);
    window.addEventListener("pointermove", move, true);
    window.addEventListener("keydown", key, true);
    return () => {
      window.removeEventListener("click", click, true);
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("keydown", key, true);
    };
  }, [selecting]);
  useEffect(() => {
    let frame = 0;
    const compute = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setMarks(
          notes
            .filter((n) => n.page === page)
            .flatMap((note) => {
              try {
                const el = document.querySelector(note.selector);
                if (
                  !el ||
                  el.tagName.toLowerCase() !== note.tag ||
                  elementExcerpt(el) !== note.excerpt
                )
                  return [];
                const rect = rectOf(el);
                if (rect.width === 0 || rect.height === 0) return [];
                return [{ note, rect }];
              } catch {
                return [];
              }
            }),
        );
      });
    };
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    window.addEventListener("load", compute, true);
    const observer = new ResizeObserver(compute);
    observer.observe(document.body);
    const mutation = new MutationObserver(compute);
    const root = document.getElementById("app");
    if (root) mutation.observe(root, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutation.disconnect();
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
      window.removeEventListener("load", compute, true);
    };
  }, [notes, page]);
  function edit(note: FeedbackNote) {
    setDraft(note);
    setText(note.text);
    setSelecting(false);
    setOpen(true);
  }
  function exportNotes() {
    if (!notes.some((note) => note.status === "open")) return;
    const blob = new Blob([JSON.stringify(feedbackFile(notes), null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "orgdocs-feedback-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("فایل دریافت شد؛ آن را در گفت‌وگوی Codex پیوست کن.");
  }
  const shown = notes.filter((n) => filter === "all" || n.page === page);
  return (
    <div
      className={"feedback-root" + (selecting ? " feedback-selecting" : "")}
      data-feedback-ui="true"
      dir="rtl"
    >
      {selecting && hover && (
        <div className="feedback-highlight" style={hover} />
      )}
      {!selecting &&
        visibleMarks &&
        marks.map(({ note, rect }) => {
          const left = rect.left + rect.width * note.x;
          const top = rect.top + rect.height * note.y;
          if (left < 0 || left > innerWidth || top < 0 || top > innerHeight)
            return null;
          return (
            <button
              key={note.id}
              className={
                "feedback-pin " +
                (note.status === "done" ? "feedback-done" : "")
              }
              style={{
                left: Math.max(16, Math.min(innerWidth - 16, left)),
                top: Math.max(16, Math.min(innerHeight - 16, top)),
              }}
              aria-label={
                "یادداشت " +
                (notes.findIndex((n) => n.id === note.id) + 1) +
                ": " +
                note.text
              }
              onClick={() => edit(note)}
            >
              {(notes.findIndex((n) => n.id === note.id) + 1).toLocaleString(
                "fa-IR",
              )}
            </button>
          );
        })}
      {open && (
        <section
          ref={panel}
          tabIndex={-1}
          className="feedback-panel"
          role="dialog"
          aria-label={draft ? "نوشتن بازخورد" : "یادداشت‌های بازخورد"}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            }
          }}
        >
          <header className="feedback-header">
            <div>
              <MessageSquarePlus size={20} />
              <strong>{draft ? "یادداشت روی صفحه" : "بازخورد روی صفحه"}</strong>
            </div>
            <button
              className="feedback-icon"
              aria-label="بستن بازخورد"
              onClick={close}
            >
              <X size={20} />
            </button>
          </header>
          <div className="feedback-content">
            {error && (
              <p className="feedback-error" role="alert">
                {error}
              </p>
            )}
            {draft ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const value = text.trim();
                  if (!value) {
                    setMessage("متن یادداشت را بنویس.");
                    return;
                  }
                  const note = {
                    ...draft,
                    text: value,
                    updatedAt: new Date().toISOString(),
                  };
                  if (
                    persist(
                      notes.some((n) => n.id === draft.id)
                        ? notes.map((n) => (n.id === draft.id ? note : n))
                        : [...notes, note],
                    )
                  ) {
                    close();
                    setMessage(
                      "یادداشت ذخیره شد؛ برای مورد بعدی دوباره بازخورد را بزنید.",
                    );
                  }
                }}
              >
                <div className="feedback-context">
                  <span>بخش انتخاب‌شده</span>
                  <blockquote>{draft.excerpt}</blockquote>
                  <small>
                    صفحه: <bdi>{draft.page}</bdi> ·{" "}
                    {draft.viewport.width < 761 ? "موبایل" : "دسکتاپ"} ·{" "}
                    <bdi>
                      {draft.viewport.width} × {draft.viewport.height}
                    </bdi>
                  </small>
                </div>
                <label>
                  تغییر پیشنهادی
                  <textarea
                    ref={editor}
                    value={text}
                    maxLength={3000}
                    required
                    onChange={(e) => setText(e.target.value)}
                    placeholder="مثلاً این دکمه بالاتر قرار بگیرد…"
                  />
                </label>
                <div className="feedback-actions">
                  <button type="submit">ذخیره یادداشت</button>
                  <button type="button" className="secondary" onClick={close}>
                    انصراف
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="feedback-toolbar">
                  <label>
                    نمایش یادداشت‌ها
                    <select
                      aria-label="محدوده یادداشت‌ها"
                      value={filter}
                      onChange={(e) =>
                        setFilter(e.target.value as "page" | "all")
                      }
                    >
                      <option value="page">همین صفحه</option>
                      <option value="all">همه صفحه‌ها</option>
                    </select>
                  </label>
                  <label className="feedback-toggle">
                    <input
                      type="checkbox"
                      checked={visibleMarks}
                      onChange={(e) => setVisibleMarks(e.target.checked)}
                    />
                    نمایش نشانه‌ها
                  </label>
                </div>
                {!shown.length && (
                  <p className="feedback-empty">
                    {notes.length
                      ? "در این صفحه یادداشتی نیست؛ همه صفحه‌ها را انتخاب کن."
                      : "هنوز یادداشتی ننوشته‌ای. بخش موردنظر را انتخاب کن و تغییری که می‌خواهی بنویس."}
                  </p>
                )}
                <ol className="feedback-notes">
                  {shown.map((note) => (
                    <li key={note.id}>
                      <div className="feedback-note-heading">
                        <strong>
                          یادداشت{" "}
                          {(
                            notes.findIndex((n) => n.id === note.id) + 1
                          ).toLocaleString("fa-IR")}
                        </strong>
                        <span>
                          {note.status === "done"
                            ? "انجام‌شده"
                            : "در انتظار بررسی"}
                        </span>
                      </div>
                      <p>{note.text}</p>
                      <blockquote>{note.excerpt}</blockquote>
                      <small>
                        <bdi>{note.page}</bdi> ·{" "}
                        {note.viewport.width < 761 ? "موبایل" : "دسکتاپ"} ·{" "}
                        {new Intl.DateTimeFormat("fa-IR", {
                          dateStyle: "short",
                        }).format(new Date(note.createdAt))}
                      </small>
                      <div className="feedback-note-actions">
                        <button className="link" onClick={() => edit(note)}>
                          <Pencil size={13} />
                          ویرایش
                        </button>
                        <button
                          className="link"
                          onClick={() =>
                            persist(
                              notes.map((n) =>
                                n.id === note.id
                                  ? {
                                      ...n,
                                      status:
                                        n.status === "done" ? "open" : "done",
                                      updatedAt: new Date().toISOString(),
                                    }
                                  : n,
                              ),
                            )
                          }
                        >
                          <Check size={14} />
                          {note.status === "done" ? "بازگشایی" : "انجام شد"}
                        </button>
                        <button
                          className="link"
                          aria-label={
                            "حذف یادداشت " +
                            (notes.findIndex((n) => n.id === note.id) + 1)
                          }
                          onClick={() => {
                            if (confirm("این یادداشت حذف شود؟"))
                              persist(notes.filter((n) => n.id !== note.id));
                          }}
                        >
                          <Trash2 size={13} />
                          حذف
                        </button>
                        {note.page !== page && (
                          <a
                            className="link"
                            href={window.__ORGDEMO_HASH_ROUTING__ ? "#" + note.page : note.page}
                            onClick={() => setOpen(false)}
                          >
                            رفتن به صفحه
                            <ChevronLeft size={13} />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                <button
                  className="secondary full"
                  disabled={!notes.some((note) => note.status === "open")}
                  onClick={exportNotes}
                >
                  <Download size={17} />
                  دریافت بازخوردهای در انتظار بررسی (
                  {notes
                    .filter((note) => note.status === "open")
                    .length.toLocaleString("fa-IR")}
                  )
                </button>
              </>
            )}
            {message && (
              <p className="feedback-message" role="status">
                {message}
              </p>
            )}
          </div>
        </section>
      )}
      {!open && (
        <div className="feedback-launcher-group">
          <button
            ref={launcher}
            className="feedback-launcher"
            aria-pressed={selecting}
            onClick={() => {
              if (selecting) {
                setSelecting(false);
                setHover(null);
              } else begin();
            }}
          >
            {selecting ? <X size={18} /> : <MessageSquarePlus size={18} />}
            {selecting ? "لغو انتخاب" : "بازخورد"}
          </button>
          <button
            className="feedback-history"
            aria-label={
              "مشاهده بازخوردهای ثبت‌شده (" +
              notes.length.toLocaleString("fa-IR") +
              ")"
            }
            onClick={() => {
              setSelecting(false);
              setHover(null);
              setDraft(null);
              setOpen(true);
            }}
          >
            <List size={18} />
            <span>{notes.length.toLocaleString("fa-IR")}</span>
          </button>
        </div>
      )}
      {!open && message && (
        <span className="sr-only" role="status">
          {message}
        </span>
      )}
    </div>
  );
}

