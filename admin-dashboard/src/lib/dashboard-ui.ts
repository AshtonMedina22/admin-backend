/** Shared compact layout tokens for ops dashboard pages. */
import { cn } from "@/lib/utils";

export const dashPageClass = "flex flex-col gap-3 md:gap-4";
export const dashPageHeaderClass = "flex flex-col gap-1 border-b border-border pb-3";
export const dashKpiGridClass = "grid grid-cols-2 gap-3 lg:grid-cols-4";
export const dashKpiGrid3Class = "grid grid-cols-2 gap-3 lg:grid-cols-3";
export const dashCardClass = "gap-0 py-0 [--card-spacing:--spacing(3)]";
/** Standard section card — neutral surface, no entity accent stripe */
export const dashSurfaceCardClass = cn(dashCardClass, "border border-border bg-card shadow-sm");
export const dashCardHeaderClass = "px-3 pt-3 pb-0";
export const dashCardContentClass = "px-3 pt-1 pb-3";
export const dashSectionCardHeaderClass = "px-3 pt-3 pb-2";
export const dashSectionCardContentClass = "px-3 pb-3 pt-0";
export const dashAlertBannerClass =
  "rounded-lg border border-[color-mix(in_oklab,var(--brand-ysp)_30%,transparent)] bg-[var(--status-warning-bg)] px-4 py-3 text-[var(--status-warning-text)]";
/** Technical / implementation callouts — neutral, readable on light canvas */
export const dashInfoBannerClass =
  "rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700";
