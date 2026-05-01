import { useEffect, useRef } from "react";

const shortcuts = [
  { key: "N", description: "New invoice" },
  { key: "/", description: "Focus search" },
  { key: "Esc", description: "Go back / clear search" },
  { key: "?", description: "Show this dialog" },
];

export default function ShortcutsModal() {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = document.getElementById("shortcuts-modal");
    function open() {
      ref.current?.showModal();
    }
    el?.addEventListener("removeAttribute", open);

    function handleKey(e: KeyboardEvent) {
      if (e.key === "?" && !isTyping()) ref.current?.showModal();
      if (e.key === "Escape") ref.current?.close();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function isTyping() {
    const tag = (document.activeElement?.tagName ?? "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select";
  }

  return (
    <>
      <dialog ref={ref} id="shortcuts-modal" className="shortcuts-dialog">
        <div className="shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button
            className="shortcuts-close"
            onClick={() => ref.current?.close()}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <ul className="shortcuts-list">
          {shortcuts.map((s) => (
            <li key={s.key} className="shortcut-row">
              <kbd className="kbd">{s.key}</kbd>
              <span>{s.description}</span>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
