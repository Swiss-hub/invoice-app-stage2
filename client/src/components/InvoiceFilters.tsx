import { useEffect, useRef, useState } from "react";
import type { InvoiceStatus } from "../types/invoice";

const STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  selectedStatuses: InvoiceStatus[];
  onStatusChange: (statuses: InvoiceStatus[]) => void;
}

export default function InvoiceFilters({
  query,
  onQueryChange,
  selectedStatuses,
  onStatusChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggleStatus(status: InvoiceStatus) {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  }

  const filterLabel =
    selectedStatuses.length === 0 || selectedStatuses.length === STATUSES.length
      ? "Filter by status"
      : `Status: ${selectedStatuses.join(", ")}`;

  return (
    <div className="list-controls">
      <input
        id="invoice-search"
        className="search-input"
        type="search"
        placeholder="Search by # or client..."
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <div className="filter-wrapper" ref={wrapperRef}>
        <button
          type="button"
          className={`filter-toggle ${open ? "open" : ""}`}
          onClick={() => setOpen((o) => !o)}
        >
          {filterLabel} <span className="arrow">▼</span>
        </button>
        {open && (
          <div className="filter-menu">
            {STATUSES.map((status) => (
              <label key={status} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status)}
                  onChange={() => toggleStatus(status)}
                />
                {status}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
