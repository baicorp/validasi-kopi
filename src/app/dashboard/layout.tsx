"use client";

import {
  FileText,
  FilePlus,
  Coffee,
  ChevronRight,
  HeartHandshake,
  User,
  BookCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/ui/signOutBtn";
import { Breadcrumbs } from "@/components/ui/breadcrumbList";

const sidebarMenu = [
  { url: "/dashboard/ujian", menu: "Ujian", icon: BookCheck },
  { url: "/dashboard/daftar-soal", menu: "Daftar Soal", icon: FileText },
  { url: "/dashboard/produk", menu: "Produk", icon: Coffee },
  { url: "/dashboard/karyawan", menu: "Karyawan", icon: User },
];

const collapsibleSidebarMenu = [
  {
    menu: "Buat Soal",
    icon: FilePlus,
    submenu: [
      { url: "/dashboard/buat-soal/uji-dasar", menu: "Uji Dasar" },
      { url: "/dashboard/buat-soal/uji-produk", menu: "Uji Produk" },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="mt-2.5">
                <Link href="/dashboard/ujian">
                  <HeartHandshake />
                  <span className="text-base font-semibold">
                    Quality Assurance.
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              {/* Static Menus */}
              <SidebarMenu>
                {sidebarMenu.map((item) => (
                  <ActiveMenuItem
                    key={item.menu}
                    href={item.url}
                    label={item.menu}
                    Icon={item.icon}
                  />
                ))}
              </SidebarMenu>

              {/* Collapsible Menus */}
              <SidebarMenu>
                {collapsibleSidebarMenu.map((item) => (
                  <CollapsibleMenu
                    key={item.menu}
                    Icon={item.icon}
                    menu={item.menu}
                    subMenu={item.submenu}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <SignOutButton />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 min-w-0 py-4">
        <section className="flex items-center gap-2 px-3 lg:px-8">
          <SidebarTrigger />
          <div className="bg-border w-0.5 h-3.5 mr-1" />
          <Breadcrumbs />
        </section>
        <div className="flex flex-col gap-4 px-4 lg:px-10 pb-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}

function ActiveMenuItem({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: React.ElementType;
}) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={`${
          isActive
            ? "bg-black text-white hover:bg-black/85 hover:text-white"
            : "hover:bg-neutral-200 hover:text-accent-foreground"
        }`}
      >
        <Link
          href={href}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
            isActive
              ? "bg-black text-white hover:bg-black/85 hover:text-white"
              : "hover:bg-neutral-200 hover:text-accent-foreground",
          )}
        >
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

interface CollapsibleMenuData {
  Icon: React.ElementType;
  menu: string;
  subMenu: { menu: string; url: string }[];
}

function CollapsibleMenu({ Icon, menu, subMenu }: CollapsibleMenuData) {
  const [isCollapse, setIsCollapse] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <SidebarMenuButton onClick={() => setIsCollapse((prev) => !prev)}>
        <Icon />
        <span>{menu}</span>
        <ChevronRight
          className={`${isCollapse && "rotate-90"} transition-all ml-auto`}
        />
      </SidebarMenuButton>

      {isCollapse && (
        <SidebarMenu className="pl-6">
          {subMenu.map((child) => {
            const isActive = pathname.startsWith(child.url);
            return (
              <SidebarMenuItem key={child.menu}>
                <SidebarMenuButton
                  asChild
                  className={`${
                    isActive
                      ? "bg-black text-white hover:bg-black/85 hover:text-white"
                      : "hover:bg-neutral-200 hover:text-accent-foreground"
                  }`}
                >
                  <Link
                    href={child.url}
                    className={cn(
                      "block text-sm rounded-lg px-2 py-2",
                      isActive
                        ? "bg-black text-white hover:bg-black/85 hover:text-white"
                        : "hover:bg-neutral-200 hover:text-accent-foreground",
                    )}
                  >
                    {child.menu}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      )}
    </>
  );
}
