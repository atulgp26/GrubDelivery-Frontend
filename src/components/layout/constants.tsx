import type { NavItemConfig } from "@/types";

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: "DASHBOARD",
    label: "DASHBOARD",
    icon: "dashboard",
    href: "/dashboard",
    activeIconSrc: "/Dashboard/Side Nav/Nav/grid.svg",
  },
  {
    id: "RESTAURANTS",
    label: "RESTAURANTS",
    icon: "restaurant",
    href: "/restaurants",
    activeIconSrc: "/Restaurants/Side Nav/Nav/globe.svg",
  },
  {
    id: "GRUBPACS",
    label: "GRUBPACS",
    icon: "grubpacs",
    href: "/grubpacs",
    activeIconSrc: "/GrubPac/Side Nav/Nav/Box.svg",
  },
  {
    id: "GRUBLOCK",
    label: "GRUBLOCK",
    icon: "grublock",
    href: "/grublock",
    activeIconSrc: "/sidebar/Grublock.svg",
  },
  {
    id: "EMPLOYEES",
    label: "EMPLOYEES",
    icon: "users",
    href: "/employees",
    activeIconSrc: "/Employees/Side Nav/Nav/team-member.svg",
  },
  {
    id: "SYSTEM LOGS",
    label: "SYSTEM LOGS",
    icon: "log",
    href: "/system-logs",
    activeIconSrc: "/Logs/Side Nav/Nav/clipboard-text.svg",
  },
  {
    id: "HELP",
    label: "HELP",
    icon: "help",
    href: "/help",
    activeIconSrc: "/Support/Side Nav/Nav/question-circle.svg",
  },
];