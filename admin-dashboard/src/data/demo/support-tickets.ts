export type SupportTicketStatus = "Open" | "In Progress" | "Resolved";

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  orderNumber: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  assignedTo: string;
}

export const supportTicketsData: SupportTicket[] = [
  {
    id: "tkt-001",
    ticketNumber: "#NRC-8012",
    customerName: "M. Allen",
    orderNumber: "9394",
    subject: "Battery Parallel Configuration Validation",
    message:
      "Customer is requesting engineering review on wiring three 48V Lithium blocks in parallel to hit targeted amp-hour margins without over-volting the input threshold of the Anenji 3KW inverter hardware bank.",
    status: "Open",
    priority: "High",
    createdAt: "2026-06-13",
    assignedTo: "Alex Morgan",
  },
  {
    id: "tkt-002",
    ticketNumber: "#NRC-8010",
    customerName: "Garrett Miller",
    orderNumber: "9401",
    subject: "Hybrid inverter pack pre-install checklist",
    message:
      "Garrett Miller (#WOO-9401) requesting confirmation on Rich Solar 3KW hybrid inverter combiner wiring before warehouse pull ships from Wylie.",
    status: "In Progress",
    priority: "Medium",
    createdAt: "2026-06-12",
    assignedTo: "Jordan Lee",
  },
  {
    id: "tkt-003",
    ticketNumber: "#NRC-8008",
    customerName: "Robert Davis",
    orderNumber: "9398",
    subject: "LiFePO4 add-on compatibility with existing DIY kit",
    message:
      "Robert Davis battery add-on order on inventory hold - needs validation that 48V 100Ah LiFePO4 block matches existing Anenji 3KW input threshold on parallel bus.",
    status: "Open",
    priority: "High",
    createdAt: "2026-06-13",
    assignedTo: "Jordan Lee",
  },
];
