import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  /** 배경 강조 레벨 */
  variant?: "default" | "elevated";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg px-4 py-16 transition-all",
        variant === "elevated"
          ? "bg-muted/40 border border-border/50 shadow-sm"
          : "border border-dashed border-muted-foreground/25"
      )}
    >
      {/* 아이콘 배경 원 (elevated 변형에만 적용) */}
      {variant === "elevated" && (
        <div className="absolute pointer-events-none">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 blur-3xl"
            style={{
              width: "200px",
              height: "200px",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}

      {/* 아이콘 */}
      <div className="relative z-10">
        <div
          className={cn(
            "rounded-full p-4",
            variant === "elevated"
              ? "bg-primary/10"
              : "bg-muted/30"
          )}
        >
          <Icon
            className={cn(
              "h-8 w-8",
              variant === "elevated"
                ? "text-primary/60"
                : "text-muted-foreground/50"
            )}
          />
        </div>
      </div>

      {/* 텍스트 */}
      <div className="text-center relative z-10">
        <h3 className="font-semibold text-foreground text-lg">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            {description}
          </p>
        )}
      </div>

      {/* 액션 버튼 */}
      {action && (
        <div className="relative z-10">
          <Button onClick={action.onClick} variant="default" size="sm">
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
