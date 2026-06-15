import type { ImplementationLabelVariant } from "@/components/dashboard/implementation-label";

/** Page-specific implementation layer titles — each route gets its own semantic label. */
export const implementationLabels = {
  commandCenterSync: {
    variant: "architecture" as ImplementationLabelVariant,
    title: "System Architecture Core",
  },
  telemetryPolling: {
    variant: "engineering" as ImplementationLabelVariant,
    title: "Hardware Engineering Log",
  },
  retailIngestion: {
    variant: "logistics" as ImplementationLabelVariant,
    title: "Logistics Ingestion & Deduplication Pipeline",
  },
  vendorCompliance: {
    variant: "automation" as ImplementationLabelVariant,
    title: "Compliance Workflow Automation",
  },
  permitEscalation: {
    variant: "automation" as ImplementationLabelVariant,
    title: "Event-Driven Automation Hook",
  },
  inboxApiContract: {
    variant: "enterprise" as ImplementationLabelVariant,
    title: "Enterprise API & Prompt Engineering Contract",
  },
} as const;
