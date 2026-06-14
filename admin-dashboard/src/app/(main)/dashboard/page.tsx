import { CommandCenterRoute } from "./_components/command-center-route";

/**
 * /dashboard root - mounts Command Center with live workbook sync metadata
 * (source: "workbook" | "demo") surfaced in the Executive Control Tower header grid.
 */
export default function DashboardPage() {
  return <CommandCenterRoute />;
}

export const dynamic = "force-dynamic";

export const revalidate = 0;
