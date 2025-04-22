"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, CircleCheck, CircleX, Copy, MoreHorizontal, RotateCcw, Shield, SquarePen, SquareUserRound, User, UserCog, View } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export type User = {
  _id: string;
  account_id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  asset_model?: string;
  first_access?: string;
  device_notif?: string;
  created_at?: string;
  updated_at?: string;
  avatarPath?: string;
}

export const RowContextMenu = ({ 
  children, 
  user,
  handleViewCompleteDetails,
  handleUserSelection,
  handleResetPassword,
  row
}: { 
  children: React.ReactNode,
  user: User,
  handleViewCompleteDetails: (user: User) => void,
  handleUserSelection: (user: User) => void,
  handleResetPassword: (user: User) => void,
  row: any
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div 
          onClick={(e) => {
            // Prevent triggering when clicking on interactive elements
            if (!(e.target instanceof HTMLInputElement)) {
              row.toggleSelected(!row.getIsSelected())
            }
          }}
          className="cursor-pointer"
        >
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="font-geist">
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(user.account_id)}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Account ID
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => handleViewCompleteDetails(user)}>
          <View className="mr-2 h-4 w-4" />
          View Complete Details
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleUserSelection(user)}>
          <SquarePen className="mr-2 h-4 w-4" />
          Edit User Details
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleResetPassword(user)}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Password
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export const columns = (
  handleUserSelection: (user: User) => void, 
  handleViewCompleteDetails: (user: User) => void, 
  handleResetPassword: (user: User) => void
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()} // Prevent row click from triggering here
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "account_id",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="pl-0"
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" /> 
          </Button>
        </div>
      )
    },
    cell: ({ row }) => (
      <RowContextMenu 
        user={row.original}
        handleViewCompleteDetails={handleViewCompleteDetails}
        handleUserSelection={handleUserSelection}
        handleResetPassword={handleResetPassword}
        row={row}
      >
        <div>{row.getValue("account_id")}</div>
      </RowContextMenu>
    ),
  },
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="pl-0"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => (
      <RowContextMenu 
        user={row.original}
        handleViewCompleteDetails={handleViewCompleteDetails}
        handleUserSelection={handleUserSelection}
        handleResetPassword={handleResetPassword}
        row={row}
      >
        <div>{row.getValue("username")}</div>
      </RowContextMenu>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="pl-0"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return (
        <RowContextMenu 
          user={row.original}
          handleViewCompleteDetails={handleViewCompleteDetails}
          handleUserSelection={handleUserSelection}
          handleResetPassword={handleResetPassword}
          row={row}
        >
          <div className={`${!email || email.trim() === "" ? 'text-zinc-400' : 'text-[var(--email-color)]'}`}>
            {!email || email.trim() === "" ? "-----" : email}
          </div>
        </RowContextMenu>
      )
    }
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="pl-0"
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" /> 
          </Button>
        </div>
      )
    },
    cell: ({ row }) => (
      <RowContextMenu 
        user={row.original}
        handleViewCompleteDetails={handleViewCompleteDetails}
        handleUserSelection={handleUserSelection}
        handleResetPassword={handleResetPassword}
        row={row}
      >
        <div className={`capitalize}`}>
          {row.getValue("role") === "User" ? (
            <Badge className="px-2 py-1 text-xs font-medium bg-purple-200 text-purple-700 hover:bg-purple-50 gap-1">
              <User className="h-3.5 w-3.5" />
              {row.getValue("role")}
            </Badge>
          ):(
            <Badge className="px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-50 gap-1">
              <Shield className="h-3.5 w-3.5" />
              {row.getValue("role")}
            </Badge>
          )}
        </div>
      </RowContextMenu>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="pl-0"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-2" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => (
      <RowContextMenu 
        user={row.original}
        handleViewCompleteDetails={handleViewCompleteDetails}
        handleUserSelection={handleUserSelection}
        handleResetPassword={handleResetPassword}
        row={row}
      >
        <div className="capitalize">
          {row.getValue("status") === "Available" ? (
            <Badge className="bg-green-200 text-green-800 hover:bg-green-200 cursor-default gap-1">
              <CircleCheck className="h-3.5 w-3.5" />
              {row.getValue("status")}
            </Badge>
          ):(
            <Badge className="bg-red-200 text-red-800 hover:bg-red-200 cursor-default gap-1">
              <CircleX className="h-3.5 w-3.5" />
              {row.getValue("status")}
            </Badge>
          )}
        </div>
      </RowContextMenu>
    ),
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="pl-0"
          >
            Updated At
            <ArrowUpDown className="ml-2 h-4 w-2" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => (
      <RowContextMenu 
        user={row.original}
        handleViewCompleteDetails={handleViewCompleteDetails}
        handleUserSelection={handleUserSelection}
        handleResetPassword={handleResetPassword}
        row={row}
      >
        <div>{row.getValue("updated_at")}</div>
      </RowContextMenu>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 font-geist"
              onClick={(e) => e.stopPropagation()} // Prevent row click from triggering here
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="font-geist">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.account_id)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Account ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleViewCompleteDetails(user)}>
              <View className="mr-2 h-4 w-4" />
              View Complete Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUserSelection(user)}>
              <SquarePen className="mr-2 h-4 w-4" />
              Edit User Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleResetPassword(user)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]