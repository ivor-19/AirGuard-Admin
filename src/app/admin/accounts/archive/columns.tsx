"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, CircleCheck, CircleX, Copy, MoreHorizontal, RotateCcw, SquarePen, View } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

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
}


export const archiveColumns = (handleUserSelection: (user: User) => void, handleViewCompleteDetails: (user: User) => void): ColumnDef<User>[] => [
  
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
      return(
        <div className={`${!email || email.trim() === "" ? 'text-zinc-400' : 'text-[var(--email-color)]'}`}>
          {!email || email.trim() === "" ? "-----" : email}
        </div>
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
      <div className={`capitalize ${row.getValue('role') === 'Admin' ? 'text-yellow-500 font-bold' : ''}`}>
        {row.getValue("role")}
      </div>
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
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
     

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 font-geist">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-geist">
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.account_id)}
              >
                <Copy />
                Copy Account ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewCompleteDetails(user)}>
                <View />
                View Complete Details
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

        </>
       
      )
    },
  },
]