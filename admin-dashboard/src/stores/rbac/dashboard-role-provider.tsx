"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { DEMO_ADMIN, DEMO_MANAGER } from "@/config/demo-identity";

export type DashboardAccessLevel = "admin" | "manager";

export type DashboardProfile = {
  id: string;
  name: string;
  roleLabel: string;
  company: string;
  email: string;
  accessLevel: DashboardAccessLevel;
};

export const dashboardProfiles: DashboardProfile[] = [
  {
    id: DEMO_ADMIN.id,
    name: DEMO_ADMIN.name,
    roleLabel: DEMO_ADMIN.roleLabel,
    company: DEMO_ADMIN.company,
    email: DEMO_ADMIN.email,
    accessLevel: "admin",
  },
  {
    id: DEMO_MANAGER.id,
    name: DEMO_MANAGER.name,
    roleLabel: DEMO_MANAGER.roleLabel,
    company: DEMO_MANAGER.company,
    email: DEMO_MANAGER.email,
    accessLevel: "manager",
  },
];

type DashboardRoleContextValue = {
  profile: DashboardProfile;
  accessLevel: DashboardAccessLevel;
  setProfileId: (id: string) => void;
};

const STORAGE_KEY = "dashboard-active-profile";

const DashboardRoleContext = createContext<DashboardRoleContextValue | null>(null);

export function DashboardRoleProvider({ children }: { children: ReactNode }) {
  const [profileId, setProfileIdState] = useState(dashboardProfiles[0].id);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && dashboardProfiles.some((p) => p.id === stored)) {
      setProfileIdState(stored);
    }
  }, []);

  const setProfileId = (id: string) => {
    setProfileIdState(id);
    sessionStorage.setItem(STORAGE_KEY, id);
  };

  const value = useMemo(() => {
    const profile = dashboardProfiles.find((p) => p.id === profileId) ?? dashboardProfiles[0];
    return { profile, accessLevel: profile.accessLevel, setProfileId };
  }, [profileId]);

  return <DashboardRoleContext.Provider value={value}>{children}</DashboardRoleContext.Provider>;
}

export function useDashboardRole() {
  const context = useContext(DashboardRoleContext);
  if (!context) {
    throw new Error("useDashboardRole must be used within DashboardRoleProvider");
  }
  return context;
}
