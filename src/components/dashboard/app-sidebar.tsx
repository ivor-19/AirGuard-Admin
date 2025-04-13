"use client"

import * as React from "react"
import {
  Bot,
  SquareTerminal,
} from "lucide-react"

import { NavUser } from "@/components/dashboard/nav-user"
import { TeamSwitcher } from "@/components/dashboard/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "../ui/button"

// This is sample data.
const data = {
  user: {
    name: "",
    email: "",
    avatar: "/avatars/leaf-dark.png",
    username: "",  // Add the username here
    account_id: "", // Add the account_id here
  },
  teams: [
    {
      name: "Air Guard",
      plan: "",
    },
  ],
  navMain: [
    {
      title: "Analytics",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Pollutants",
          url: "/admin",
          isActive: false,
        },
        {
          title: "Announcements Timeline",
          url: "/admin/history",
          isActive: false,
        },
      ],
    },
    {
      title: "Accounts",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Manage Accounts",
          url: "/admin/accounts",
          isActive: false,
        },
      ],
    },
  ],
};


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathName = usePathname();
  const router = useRouter();

  const updatedNav = data.navMain.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      isActive: pathName === item.url, // Set isActive to true if path matches
    })),
  }));
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="font-geist">
        <SidebarGroup>
            <SidebarMenu>
              {updatedNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={item.isActive}>
                            <a href={item.url}>{item.title}</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button className="flex font-geist text-sm" variant={"secondary"} onClick={() => router.push("/admin/chat")}>Group Chat</Button>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}