"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, CircleCheck, CircleX, Copy, MoreHorizontal, RotateCcw, SquarePen, User, UserCog, View } from "lucide-react"
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


export const columns = (handleUserSelection: (user: User) => void, handleViewCompleteDetails: (user: User) => void, handleResetPassword: (user: User) => void): ColumnDef<User>[] => [

  
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
      <div className={`capitalize}`}>
         {row.getValue("role") === "Student" ? (
          <Badge className="px-2 py-1 text-xs font-medium bg-purple-200 text-purple-700 hover:bg-purple-50 gap-1">
            <User className="h-3.5 w-3.5" />
            {row.getValue("role")}
          </Badge>
        ):(
          <Badge className="px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-50 gap-1">
            <UserCog className="h-3.5 w-3.5" />
            {row.getValue("role")}
          </Badge>
        )}
      </div>
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
      
      // const notifyEmail = async () =>{
      //   try {
      //     // const message = {
      //     //   to: user.email,
      //     //   subject: "Your AirGuard App Password Has Been Reset",
      //     //   message: `Hello,
          
      //     // Your password for the AirGuard App has been successfully reset. Please find your new login credentials below:
          
      //     // Account ID: ${user?.account_id}
      //     // Temporary Password: ${user?.created_at}
          
      //     // For your security, we strongly recommend logging in and changing your password as soon as possible.
          
      //     // If you did not request this change, please contact our support team immediately.
          
      //     // Best regards,  
      //     // The AirGuard Team`
      //     // }
      //     const message = {email: user.email, createdat: user.created_at}
      //     // try {
      //     //   await axios.post('https://air-quality-back-end-v2.vercel.app/email/send', message);
      //     //   setOpenResetPassword(false)
      //     // } catch (error) {
      //     //   console.error(error);
      //     // }
      //     console.log(message)
      //   } catch (error) {
      //     console.error("Error notifying user", error)
      //   }
      // }

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
              {/* <DropdownMenuItem onClick={notifyEmail}>
                <View />
               NOtify
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewCompleteDetails(user)}>
                <View />
                View Complete Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUserSelection(user)}>
                <SquarePen />
                Edit User Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                <RotateCcw />
                Reset Password
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </>
       
      )
    },
  },
]