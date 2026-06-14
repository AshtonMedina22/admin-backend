export type AccessRole = {
  role: string;
  group: string;
  accessLevel: string;
  users: number;
  permissionSets: string[];
  lastReview: string;
  owner: string;
  status: "Active" | "Needs review";
};

export type AccessUser = {
  name: string;
  email: string;
  role: string;
  status: "Active" | "Pending invite" | "Deactivated";
  team: string;
  modules: string[];
  joinedDate: string;
  lastActive: number;
};

export const accessRolesData: AccessRole[] = [
  {
    role: "Family Manager",
    group: "Executive",
    accessLevel: "Full",
    users: 2,
    permissionSets: ["Command Center", "Enterprise", "Consumer Retail", "Operations", "Systems", "RBAC"],
    lastReview: "Jun 1, 2026",
    owner: "T. Khan",
    status: "Active",
  },
  {
    role: "Engineering Consultant",
    group: "Enterprise",
    accessLevel: "Scoped",
    users: 3,
    permissionSets: ["Engineering Pipeline", "Corporate Leads", "Telemetry", "Calendar"],
    lastReview: "May 15, 2026",
    owner: "T. Khan",
    status: "Active",
  },
  {
    role: "Installation Technician",
    group: "Field Ops",
    accessLevel: "Scoped",
    users: 6,
    permissionSets: ["Order Management", "Inventory", "Support Tickets"],
    lastReview: "May 20, 2026",
    owner: "S. Khan",
    status: "Active",
  },
  {
    role: "Office Admin",
    group: "Operations",
    accessLevel: "Scoped",
    users: 2,
    permissionSets: ["Inbox", "Calendar", "Vendor Ops"],
    lastReview: "Jun 5, 2026",
    owner: "S. Khan",
    status: "Active",
  },
];

export const accessUsersData: AccessUser[] = [
  {
    name: "T. Khan",
    email: "t.khan@yellowstarpower.com",
    role: "Family Manager",
    status: "Active",
    team: "Executive",
    modules: ["All modules"],
    joinedDate: "Jan 1, 2020",
    lastActive: 0,
  },
  {
    name: "S. Khan",
    email: "s.khan@yellowstarpower.com",
    role: "Family Manager",
    status: "Active",
    team: "Executive",
    modules: ["All modules"],
    joinedDate: "Jan 1, 2020",
    lastActive: 1,
  },
  {
    name: "Mike Torres",
    email: "mike@abcelectrical.com",
    role: "Installation Technician",
    status: "Active",
    team: "Field Ops",
    modules: ["Orders", "Inventory", "Support"],
    joinedDate: "Mar 12, 2024",
    lastActive: 2,
  },
  {
    name: "James Reed",
    email: "james@ntxinstall.com",
    role: "Installation Technician",
    status: "Active",
    team: "Field Ops",
    modules: ["Orders", "Inventory"],
    joinedDate: "Aug 5, 2024",
    lastActive: 5,
  },
  {
    name: "Design Partner",
    email: "eng@structuralpe.com",
    role: "Engineering Consultant",
    status: "Active",
    team: "Enterprise",
    modules: ["Engineering Pipeline", "Corporate Leads", "Telemetry"],
    joinedDate: "Feb 1, 2025",
    lastActive: 3,
  },
];
