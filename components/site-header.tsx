"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { BriefcaseBusiness, ChevronDown, Menu } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { HomeContent } from "@/lib/cms-content";

export function SiteHeader({ content }: { content: Pick<HomeContent, "brand" | "navItems"> }) {
  const [activeNav, setActiveNav] = useState("");
  const activeIndex = content.navItems.findIndex((item) => item.label === activeNav);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="brand" href={content.brand.href} aria-label={content.brand.name + "首页"}>
        <Image src={content.brand.logo} alt={content.brand.name} width={275} height={140} priority />
        </a>

        <NavigationMenu.Root
        className="desktop-nav"
        value={activeNav}
        data-active-index={activeIndex}
        onValueChange={setActiveNav}
        delayDuration={120}
        skipDelayDuration={320}
        onPointerLeave={() => setActiveNav("")}
      >
        <NavigationMenu.List className="nav-list">
          {content.navItems.map((item) => (
            <NavigationItem item={item} key={item.label} onActivate={setActiveNav} />
          ))}
        </NavigationMenu.List>
        <div className="nav-viewport-position">
          <NavigationMenu.Viewport className="nav-viewport" />
        </div>
        </NavigationMenu.Root>

        <div className="header-actions">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="mobile-menu-trigger" aria-label="打开菜单">
            <Menu size={22} />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="mobile-menu" sideOffset={10}>
              {content.navItems.map((item) => (
                <DropdownMenu.Item asChild key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}

function NavigationItem({ item, onActivate }: { item: HomeContent["navItems"][number]; onActivate: (value: string) => void }) {
  const groups = item.children?.reduce<Array<{ label?: string; children: NonNullable<typeof item.children> }>>((result, child) => {
    const group = result.find((entry) => entry.label === child.group);
    if (group) group.children.push(child);
    else result.push({ label: child.group, children: [child] });
    return result;
  }, []) ?? [];
  const hasGroups = groups.some((group) => group.label);

  return (
    <NavigationMenu.Item value={item.label}>
      {item.children?.length ? (
        <>
          <NavigationMenu.Trigger className="nav-trigger" onPointerEnter={() => onActivate(item.label)} onFocus={() => onActivate(item.label)}>
            {item.label}
            <ChevronDown size={14} />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="nav-content" onPointerEnter={() => onActivate(item.label)}>
            <motion.div className={`nav-panel${hasGroups ? " nav-panel-grouped" : ""}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
              {groups.map((group) => group.label ? (
                <section className="nav-group" key={group.label}>
                  <p><BriefcaseBusiness size={17} aria-hidden="true" />{group.label}</p>
                  {group.children.map((child) => <a href={child.href} key={item.label + "-" + child.label}>{child.label}</a>)}
                </section>
              ) : group.children.map((child) => <a href={child.href} key={item.label + "-" + child.label}>{child.label}</a>))}
            </motion.div>
          </NavigationMenu.Content>
        </>
      ) : <NavigationMenu.Link className="nav-link" href={item.href} onPointerEnter={() => onActivate("")}>{item.label}</NavigationMenu.Link>}
    </NavigationMenu.Item>
  );
}
