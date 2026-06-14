export type SupportTicketStatus = "Open" | "In Progress" | "Resolved";

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  orderNumber: string;
  subject: string;
  status: SupportTicketStatus;
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  assignedTo: string;
}

export const supportTicketsData: SupportTicket[] = [
  {
    id: "tkt-001",
    ticketNumber: "ST-1042",
    customerName: "Marcus Vance",
    orderNumber: "1094",
    subject: "DIY inverter wiring diagram clarification",
    status: "In Progress",
    priority: "Medium",
    createdAt: "2026-06-12",
    assignedTo: "T. Khan",
  },
  {
    id: "tkt-002",
    ticketNumber: "ST-1043",
    customerName: "Robert Davis",
    orderNumber: "1096",
    subject: "Battery add-on compatibility with existing kit",
    status: "Open",
    priority: "High",
    createdAt: "2026-06-13",
    assignedTo: "S. Khan",
  },
  {
    id: "tkt-003",
    ticketNumber: "ST-1041",
    customerName: "Sarah Chen",
    orderNumber: "1093",
    subject: "Permit documentation for DIY install",
    status: "Resolved",
    priority: "Low",
    createdAt: "2026-06-08",
    assignedTo: "T. Khan",
  },
  {
    id: "tkt-004",
    ticketNumber: "ST-1044",
    customerName: "Garrett Miller",
    orderNumber: "1095",
    subject: "Shipment tracking — Anenji inverter delay",
    status: "Open",
    priority: "High",
    createdAt: "2026-06-13",
    assignedTo: "S. Khan",
  },
];
