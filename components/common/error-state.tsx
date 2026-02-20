import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorState({
  title,
  description,
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-12">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="text-center">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          size="sm"
          className="border-destructive text-destructive hover:bg-destructive/10"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
