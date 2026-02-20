import { Badge } from "@/components/ui/badge";
import { InvoiceStatus, INVOICE_STATUS_LABELS } from "@/types/invoice";

interface StatusBadgeProps {
  status: InvoiceStatus;
  size?: "sm" | "md" | "lg";
}

const statusColorMap: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
  sent: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
  viewed: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100",
  paid: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeMap = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1.5",
    lg: "text-base px-3 py-2",
  };

  return (
    <Badge
      className={`${statusColorMap[status]} ${sizeMap[size]} font-medium`}
      variant="outline"
    >
      {INVOICE_STATUS_LABELS[status]}
    </Badge>
  );
}
