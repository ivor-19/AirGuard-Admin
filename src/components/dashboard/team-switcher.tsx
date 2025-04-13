"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ModeToggle } from "../ModeToggle"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    plan: string
  }[]
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  return (
    <SidebarMenu className="font-geist">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex w-full items-center justify-between">
            <SidebarMenuButton
              size="lg"
              className="w-1/2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <img src="/avatars/leaf-dark.png" className="rounded-md"/>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              
            </SidebarMenuButton>
            <ModeToggle />
            </div>
          </DropdownMenuTrigger>
       
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
