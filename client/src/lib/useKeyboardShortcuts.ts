import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function isTyping(): boolean {
  const tag = (document.activeElement?.tagName ?? "").toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    (document.activeElement as HTMLElement)?.isContentEditable
  );
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "n":
        case "N": {
          if (isTyping()) return;
          e.preventDefault();
          navigate("/invoices/new");
          break;
        }
        case "/": {
          if (isTyping()) return;
          e.preventDefault();
          const search = document.getElementById(
            "invoice-search"
          ) as HTMLInputElement | null;
          if (search) {
            navigate("/invoices");
            setTimeout(() => {
              document.getElementById("invoice-search")?.focus();
            }, 50);
          }
          break;
        }
        case "Escape": {
          const search = document.getElementById(
            "invoice-search"
          ) as HTMLInputElement | null;
          if (document.activeElement === search) {
            search.blur();
            search.value = "";
            search.dispatchEvent(new Event("input", { bubbles: true }));
            return;
          }
          if (isTyping()) return;
          navigate(-1);
          break;
        }
        case "?": {
          if (isTyping()) return;
          document
            .getElementById("shortcuts-modal")
            ?.removeAttribute("hidden");
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
}