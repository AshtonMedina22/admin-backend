import { DEMO_ADMIN, DEMO_MANAGER } from "@/config/demo-identity";

export const users = [
  {
    id: "1",
    name: DEMO_ADMIN.name,
    username: DEMO_ADMIN.id,
    email: DEMO_ADMIN.email,
    avatar: "",
    role: "administrator",
  },
  {
    id: "2",
    name: DEMO_MANAGER.name,
    username: DEMO_MANAGER.id,
    email: DEMO_MANAGER.email,
    avatar: "",
    role: "admin",
  },
];

export const rootUser = users[0];
