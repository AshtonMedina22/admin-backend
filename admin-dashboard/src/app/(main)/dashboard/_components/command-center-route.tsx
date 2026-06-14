import { fetchWorkbookCommandCenter } from "@/lib/workbook-sync-status";

import { CommandCenter } from "../default/_components/command-center";

export async function CommandCenterRoute() {
  const { data } = await fetchWorkbookCommandCenter();
  return <CommandCenter data={data} />;
}
