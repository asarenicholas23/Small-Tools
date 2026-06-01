import * as React from "react";
import { cn } from "../../lib/utils";

export const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" | "warning" }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "rounded-md border p-4 text-sm",
      variant === "destructive" &&
        "border-destructive/30 bg-destructive/10 text-destructive",
      variant === "warning" && "border-amber-300 bg-amber-50 text-amber-900",
      variant === "default" && "border-border bg-card",
      className,
    )}
    {...props}
  />
));
Alert.displayName = "Alert";
