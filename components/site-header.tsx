"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ChevronDown, Menu } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { HomeContent } from "@/lib/cms-content";

export function SiteHeader({ content }: { content: Pick<HomeContent, "brand" | "navItems"> }) {
  const [activeNav, setActiveNav] = useState("");
  const visibleNavItems = content.navItems.filter((item) => !item.hidden);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="brand" href={content.brand.href} aria-label={content.brand.name + "首页"}>
        <Image src={content.brand.logo} alt={content.brand.name} width={275} height={140} priority />
        </a>

        <NavigationMenu.Root
        className="desktop-nav"
        value={activeNav}
        onValueChange={setActiveNav}
        delayDuration={120}
        skipDelayDuration={320}
        onPointerLeave={() => setActiveNav("")}
      >
        <NavigationMenu.List className="nav-list">
          {visibleNavItems.map((item) => (
            <NavigationItem item={item} key={item.label} onActivate={setActiveNav} />
          ))}
        </NavigationMenu.List>
        </NavigationMenu.Root>

        <div className="header-actions">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="mobile-menu-trigger" aria-label="打开菜单">
            <Menu size={22} />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="mobile-menu" sideOffset={10}>
              {visibleNavItems.map((item) => {
                const visibleChildren = item.children?.filter((child) => !child.hidden) ?? [];
                return (
                  <DropdownMenu.Group key={item.label}>
                    <DropdownMenu.Item asChild>
                      <a className="mobile-menu-parent" href={item.href}>{item.label}</a>
                    </DropdownMenu.Item>
                    {visibleChildren.map((child) => (
                      <DropdownMenu.Item asChild key={`${item.label}-${child.label}`}>
                        <a className="mobile-menu-child" href={child.href}>{child.label}</a>
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Group>
                );
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}

function NavigationItem({ item, onActivate }: { item: HomeContent["navItems"][number]; onActivate: (value: string) => void }) {
  const visibleChildren = item.children?.filter((child) => !child.hidden) ?? [];
  return (
    <NavigationMenu.Item value={item.label}>
      {visibleChildren.length ? (
        <>
          <NavigationMenu.Trigger className="nav-trigger" onPointerEnter={() => onActivate(item.label)} onFocus={() => onActivate(item.label)}>
            {item.label}
            <ChevronDown size={14} />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="nav-content" onPointerEnter={() => onActivate(item.label)}>
            <motion.div className="nav-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
              {visibleChildren.map((child) => <a href={child.href} key={item.label + "-" + child.label}>{child.label}</a>)}
            </motion.div>
          </NavigationMenu.Content>
        </>
      ) : <NavigationMenu.Link className="nav-link" href={item.href} onPointerEnter={() => onActivate("")}>{item.label}</NavigationMenu.Link>}
    </NavigationMenu.Item>
  );
}
