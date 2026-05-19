"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import ProfileMenu from "@/components/layout/ProfileMenu";
import Icon from "@/components/ui/Icon";
import type { SidebarProps } from "@/types";
import NavItem from "./NavItem";
import { NAV_ITEMS } from "./constants";
import Button from "../ui/Button";

const ICON_MAPPING: Record<string, string> = {
  DASHBOARD: "/sidebar/grid.svg",
  RESTAURANTS: "/sidebar/globe.svg",
  GRUBPACS: "/sidebar/Box.svg",
  GRUBLOCK: "/sidebar/Grublock.svg",
  EMPLOYEES: "/sidebar/team-member.svg",
  "SYSTEM LOGS": "/sidebar/clipboard-text.svg",
  HELP: "/sidebar/question-circle.svg",
};

export default function Sidebar({ collapsed, onClose }: SidebarProps) {
  const pathname = usePathname();

  const renderItems = (withDivider: boolean = false) =>
    NAV_ITEMS.map((item) => (
      <Fragment key={item.id}>
        {withDivider && item.id === "SYSTEM LOGS" ? (
          <hr className="my-4 border-[var(--gp-color-border-neutral)]" />
        ) : null}
        <Link
          href={item.href}
          className="block"
          onClick={withDivider ? onClose : undefined}
        >
          <NavItem
            icon={item.icon}
            label={item.label}
            isActive={pathname?.startsWith(item.href) ?? false}
            iconSrc={ICON_MAPPING[item.id]}
            activeIconSrc={item.activeIconSrc}
          />
        </Link>
      </Fragment>
    ));

  return (
    <>
      {collapsed && (
        <div suppressHydrationWarning className="hidden md:block fixed top-0 left-0 h-full w-1 bg-[var(--gp-color-brand-primary)] z-50" />
      )}

      <aside
        suppressHydrationWarning
        className={`fixed left-0 top-0 h-full bg-white border-r border-[var(--gp-color-border-neutral)] transition-all duration-300 z-40 ${
          collapsed ? "-translate-x-full" : "translate-x-0"
        } w-60 hidden md:block`}
      >
        <div className="flex flex-col h-full width-[240px]">
          <div className="flex flex-col h-16 items-start justify-center px-4">
            <img
              src="/sidebar/Logo wordmark.svg"
              alt="GrubPac"
              className="h-[30px] w-auto object-contain"
            />
          </div>
          <nav className="flex-1 px-4 overflow-y-auto">
            <div className="space-y-4 pt-6">
              {NAV_ITEMS.map((item) => (
                <Fragment key={item.id}>
                  {item.id === "SYSTEM LOGS" ? <hr className="my-4 border-[var(--gp-color-border-neutral)]" /> : null}
                  <Link href={item.href} className="block">
                    <NavItem
                      icon={item.icon}
                      label={item.label}
                      isActive={pathname?.startsWith(item.href) ?? false}
                      iconSrc={ICON_MAPPING[item.id]}
                      activeIconSrc={item.activeIconSrc}
                    />
                  </Link>
                </Fragment>
              ))}
            </div>
          </nav>
          <div className="px-4 py-4 space-y-4">
            <div>
              <Button variant="neutral" appearance="ghost" size="default" asChild>
                <a href="#">
                  <span>PRIVACY POLICY</span>
                </a>
              </Button>
              <Button variant="neutral" appearance="ghost" size="default" asChild>
                <a href="#">
                  <span>TERMS OF SERVICE</span>
                </a>
              </Button>
            </div>
            <div className="pt-2">
              <ProfileMenu />
            </div>
          </div>
        </div>
      </aside>

      {!collapsed && (
        <div
          suppressHydrationWarning
          className="fixed inset-0 bg-[var(--gp-color-text-neutral-primary)] bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        suppressHydrationWarning
        className={`fixed left-0 top-0 h-full bg-white transition-all duration-300 z-40 ${
          collapsed ? "-translate-x-full" : "translate-x-0"
        } w-64 md:hidden`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-[var(--gp-color-border-neutral)]">
            <img
              src="/sidebar/Logo wordmark.svg"
              alt="GrubPac"
              className="h-6 w-auto object-contain"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[var(--gp-color-text-neutral-secondary)] hover:text-[var(--gp-color-text-neutral-primary)] hover:bg-[var(--gp-color-bg-neutral-secondary)] rounded-lg transition-colors"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 pt-6 overflow-y-auto">
            <div className="space-y-2">{renderItems(true)}</div>
          </nav>

          <div className="p-4 space-y-4 border-t border-[var(--gp-color-border-neutral)]">
            <div className="space-y-2">
              <a href="#" className="text-[var(--gp-color-text-brand)] text-xs font-medium uppercase hover:opacity-80 transition-opacity block">
                PRIVACY POLICY
              </a>
              <a href="#" className="text-[var(--gp-color-text-brand)] text-xs font-medium uppercase hover:opacity-80 transition-opacity block">
                TERMS OF SERVICE
              </a>
            </div>
            <ProfileMenu />
          </div>
        </div>
      </aside>
    </>
  );
}

