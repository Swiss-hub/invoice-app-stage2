import type { InvoiceStatus } from "../types/invoice";

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
  return <span className={`status status-${status}`}>{status}</span>;
}
