"use client"

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"

import { columns } from "./columns"
import { User } from "./columns"
import { AlertCircle, BadgeCheck, BadgePlusIcon, CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CircleCheck, CircleX, FilterX, IdCard, Import, KeyRound, ListFilter, Loader, Loader2, Mail, PlusCircle, RefreshCcw, RefreshCw, Settings2, Shield, ShieldAlert, ShieldCheck, User2 } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import DeleteModal from "@/components/modals/DeleteModal"
import { Skeleton } from "@/components/ui/skeleton"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { AddUserModal } from "@/components/modals/AddUserModal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UsersCount } from "@/components/charts/UsersCount"
import { Card } from "@/components/ui/card"
import { UsersStatus } from "@/components/charts/UsersStatus"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

const FormSchema = z.object({
  accountId: z.string().min(10, {message: "Account ID must have atleast 10 characters"}),
  name: z.string().min(1, {message: "Name is required"}),
  email: z.string(),
  role: z.enum(["Admin", "Student"], {message: "Invalid role"}),
  status: z.enum(["Available", "Blocked"], {message: "Invalid status"})
})

type FormData = z.infer<typeof FormSchema>;

export default function DataTable() {
  const { register, handleSubmit, formState: {errors}, setValue } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);
  const [openUploadExcel, setOpenUploadExcel] = useState(false);
  const [successUpload, setSuccessUpload] = useState(false)
  const [loadingTable, setLoadingTable] = useState(true);

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error('Please upload an Excel file (.xlsx, .xls)');
      return;
    }
  
    setIsUploading(true);
    setOpenUploadExcel(true);
    
    try {
      const formData = new FormData();
      formData.append('excelFile', file);
  
      const response = await axios.post(
        'https://air-quality-back-end-v2.vercel.app/excel/uploadExcel', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      // toast.success(response.data.message || 'Excel file imported successfully!');
      setSuccessUpload(true)
      setTimeout(() => {
        setSuccessUpload(false)
      }, 3000)
      fetchUsers();
    } catch (error) {
      console.error('Error uploading file:', error);
      
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to import Excel file');
      } else {
        toast.error('Failed to import Excel file');
      }
    } finally {
      setIsUploading(false);
      setOpenUploadExcel(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`https://air-quality-back-end-v2.vercel.app/users`);
      setUsers([...response.data.users].reverse());
      setLoadingTable(false);
      setRefresh(prev => prev + 1);
    } catch (error) {
      console.error("Error fetching users", error);
      setLoadingTable(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserSelection = (user: User) => {
    setOpenEditDialog(true);
    setSelectedUser(user);
  };

  const handleViewCompleteDetails = (user: User) => {
    setOpenViewDialog(true);
    setSelectedUser(user);
  };

  const handleResetPassword = (user: User) => {
    setOpenResetPassword(true);
    setSelectedUser(user);
  };

  useEffect(() => {
    if (selectedUser) {
      setValue("accountId", selectedUser.account_id);
      setValue("name", selectedUser.username);
      setValue("email", selectedUser.email);
      setValue("role", selectedUser.role as "Admin" | "Student");
      setValue("status", selectedUser.status as "Available" | "Blocked");
    }
  }, [selectedUser, setValue]); 

  const editUser = async (data: FormData) => {
    setLoading(true);
    const editedUser = {account_id: data.accountId, username: data.name, email: data.email, role: data.role, status: data.status}
    try {
      await axios.post(`https://air-quality-back-end-v2.vercel.app/users/editUser/${selectedUser?._id}`, editedUser)
      setOpenEditDialog(false);
      setLoading(false);
      toast.success("Edit successfully!")
      fetchUsers();
    } catch (error) {
      console.error("Error editing user", error)
    }
  }  
  
  const deleteUser = async () => {
    setLoading(true);
    try {
      const selectedRows = table.getSelectedRowModel().rows;
      for (const row of selectedRows) {
        const userId = row.original._id;
        await axios.post(`https://air-quality-back-end-v2.vercel.app/users/deleteUser/${userId}`);
      }
      toast.info(`(${selectedRows.length}) User/s has been deleted.`)
      fetchUsers();
      setRowSelection({});
      setLoading(false);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting a user", error)
      setDeleteModalOpen(false);
      toast.error("Unknown error has occured")
    }
  }

  const resetPassword = async () => {
    setLoading(true);
    let newPassword;

    if(selectedUser?.role === 'Student'){
      newPassword = {password: '@Student01'}
    }
    else{
      newPassword = {password: '@Admin01'}
    }
    console.log(newPassword)
    try {
      await axios.post(`https://air-quality-back-end-v2.vercel.app/users/editUser/${selectedUser?._id}`, newPassword)
      setOpenEditDialog(false);
      setLoading(false);
      toast.success("Reset password successfully!")
      setOpenResetPassword(false)
      const message = {
        to: selectedUser?.email,
        subject: "Your AirGuard App Password Has Been Reset",
        html: `
          <p>Dear User,</p>
          <p>Your password for the AirGuard App has been successfully reset. Please find your new login credentials below:</p>        
          <p>Account ID: ${selectedUser?.account_id}</p>
          <p>Temporary Password: ${newPassword.password}</p>       
          <p>
            For your security, we strongly recommend logging in and changing your password as soon as possible.
            If you did not request this change, please contact our support team immediately.
          </p>
          <p>Best regards,</p>
          <p>The AirGuard Team</p>
        `
      }
      try {
        await axios.post('https://air-quality-back-end-v2.vercel.app/email/send', message);
        setOpenResetPassword(false)
      } catch (error) {
        console.error(error);
      }
      fetchUsers();
    } catch (error) {
      console.error("Error editing user", error)
    } finally {
      setLoading(false);
      setOpenResetPassword(false)
    }
  }

  const table = useReactTable({
    data: users,
    columns: columns(handleUserSelection, handleViewCompleteDetails, handleResetPassword),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
      columnVisibility: {
        _id: false,
      },
    },
  });

  return (
    <>
    {loadingTable ? (
      <div className="w-full">
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min relative ">
          <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            <Skeleton className="h-60" />
            <Skeleton className="h-60" />
          </div>
          <div className="flex items-center py-4 font-geist justify-between">
            <div className="w-1/2 flex gap-2">
              <Skeleton className="w-full h-10"/>
              <Skeleton className="w-[20%]"/>
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-20 h-10"/>
              <Skeleton className="w-20 h-10"/>
              <Skeleton className="w-10 h-10"/>
            </div>
          </div>
          <div className="rounded-md border font-geist">
            <Skeleton className="h-96 w-full"></Skeleton>
          </div>
          <div className="flex items-center justify-between space-x-2 py-4 font-geist">
            <Skeleton className="h-10 w-20"></Skeleton>
            <div className="space-x-2 flex">
            <Skeleton className="w-20 h-8"/>
            <Skeleton className="w-20 h-8"/>
            <Skeleton className="w-10 h-8"/>
            <Skeleton className="w-10 h-8"/>
            <Skeleton className="w-10 h-8"/>
            <Skeleton className="w-10 h-8"/>
            </div>
          </div>
        </div>
      </div>
    ):(
      <div className="w-full">
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 grid-cols-2 max-lg:grid-cols-1">
            <UsersCount refresh={refresh}/>
            <UsersStatus refresh={refresh}/>
            <Card ></Card>
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min relative ">
            <Card className="absolute left-0 right-0 bg-[var(--table-bg)] p-4 rounded-lg shadow-xl">
              <div className="w-full">
                <div className="flex py-4 font-geist justify-between max-lg:flex-col gap-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search ID...."
                      value={(table.getColumn("account_id")?.getFilterValue() as string) ?? ""}
                      onChange={(event) =>
                        table.getColumn("account_id")?.setFilterValue(event.target.value)
                      }
                      className="w-full"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto border-dashed bg-transparent">
                          <Settings2 />
                          View
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="font-geist w-40">
                        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {table
                          .getAllColumns()
                          .filter((column) => column.getCanHide())
                          .map((column) => {
                            return (
                              <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                  column.toggleVisibility(!!value)
                                }
                              >
                                {column.id}
                              </DropdownMenuCheckboxItem>
                            )
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-2 border-dashed bg-transparent">
                          <ListFilter className="mr-1" /> Status 
                          {table.getColumn("status")?.getFilterValue() ? (
                            <div className="flex gap-2">
                              <span className="font-thin text-gray-500">|</span>
                              <Badge variant={"secondary"}>
                                {String(table.getColumn("status")?.getFilterValue())}
                              </Badge>
                            </div>
                          ) : null}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="font-geist w-40">
                        <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("Available")}>
                          <ShieldCheck size={16}/> Available
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("Blocked")}>
                          <ShieldAlert size={16}/> Blocked
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-center" onClick={() => table.getColumn("status")?.setFilterValue(undefined)}>
                          <FilterX size={16}/> Clear Filter
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex gap-2">
                    {Object.keys(rowSelection).length !== 0 ? (
                      <DeleteModal 
                        title={`Delete (${Object.keys(rowSelection).length})`}
                        description={`Are you sure you want to delete ${Object.keys(rowSelection).length} user(s)? This action will archive their data, which can be retrieved later.`}
                        open={deleteModalOpen}
                        setOpen={setDeleteModalOpen}
                        onClick={deleteUser}
                        loading={loading}
                      />
                    ) : (
                      <></>
                    )
                    }
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".xlsx,.xls,.csv"
                      style={{ display: 'none' }}
                    />
                   <Button onClick={handleImportClick} disabled={isUploading}>
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Import className="mr-2 h-4 w-4" />
                          Import Excel
                        </>
                      )}
                    </Button>
                    <AddUserModal
                      open={openAddDialog}
                      setOpen={setOpenAddDialog}
                      fetch={() => fetchUsers()}
                    />
                    <Button size="icon" onClick={() => fetchUsers()}>
                      <RefreshCcw />
                    </Button>
                  </div>
                </div>
                <div className="rounded-md border font-geist">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="text-xs">
                          {headerGroup.headers.map((header) => {
                            return (
                              <TableHead key={header.id} className="text-xs">
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </TableHead>
                            )
                          })}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            className="text-xs"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            {/* No results. */}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4 font-geist">
                  <div className="flex-1 text-xs text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                  </div>
                  <div className="flex items-center space-x-2 font-geist">
                    <p className="text-xs font-medium">Rows per page</p>
                    <Select
                      value={`${table.getState().pagination.pageSize}`}
                      onValueChange={(value) => {
                        table.setPageSize(Number(value))
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                      </SelectTrigger>
                      <SelectContent side="top" className="font-geist">
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                          <SelectItem key={pageSize} value={`${pageSize}`}>
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex w-[100px] items-center justify-center text-xs font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronsLeft />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeft />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <ChevronRight />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      disabled={!table.getCanNextPage()}
                    >
                      <ChevronsRight />
                    </Button>
                  </div>
                  <Button variant={'secondary'} onClick={() => router.push('/admin/accounts/archive')}>View Archive</Button>
                </div>
                <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>      
                  <DialogContent className="sm:max-w-[425px] font-geist">
                    <DialogHeader>
                      <DialogTitle>Edit User Details</DialogTitle>
                      <DialogDescription>
                      Click save when you&#39;re done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="accountId" className="text-right">
                          Account ID
                        </Label>
                        <div className="col-span-3 relative">
                          <Input 
                            id="account_id" 
                            className="col-span-3" 
                            type="text"
                            {...register("accountId")}
                            placeholder="MA-########"
                            disabled
                          />
                          {errors.accountId && <span className="text-red-500 text-xs font-geist">{errors.accountId.message}</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Name
                        </Label>
                        <div className="col-span-3 relative">
                          <Input 
                            id="name" 
                            className="col-span-3" 
                            type="text"
                            {...register("name")}
                            placeholder="Full Name"
                          />
                          {errors.name && <span className="text-red-500 text-xs font-geist">{errors.name.message}</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <div className="col-span-3 relative">
                          <Input 
                            id="email" 
                            className="col-span-3" 
                            type="text"
                            {...register("email")}
                            placeholder="(Optional)"
                          />
                          
                          {errors.email && <span className="text-red-500 text-xs font-geist">{errors.email.message}</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                          Role
                        </Label>
                        <div className="col-span-3 font-geist text-[14px]">
                          <select 
                            id="role"
                            {...register("role")}
                            className="w-[180px] p-2 border rounded-md font-geist"
                          >
                            <option value="" disabled>Select role</option>
                            <option value="Student">Student</option>
                            <option value="Admin">Admin</option>
                          </select>
                          {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Status
                        </Label>
                        <div className="col-span-3 font-geist text-[14px]">
                          <select 
                            id="status"
                            {...register("status")}
                            className="w-[180px] p-2 border rounded-md font-geist"
                          >
                            <option value="" disabled>Select status</option>
                            <option value="Available">Available</option>
                            <option value="Blocked">Blocked</option>
                          </select>
                          {errors.status && <p className="text-red-500 text-xs">{errors.status.message}</p>}
                        </div>
                      </div>
                      
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSubmit(editUser)}>  
                        {loading ? (
                          <>
                            Saving Changes
                            <Loader2 className="animate-spin"/>
                          </>
                        ) : (
                          <>
                            Save
                          </>
                        )} 
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
                  <DialogContent className="sm:max-w-[500px] font-geist">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">User Complete Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 font-geist text-sm">
                      <div className="grid grid-cols-[100px_1fr] gap-y-3">
                        <div className="text-sm text-muted-foreground">Account ID:</div>
                        <div className="flex items-center gap-2 font-mono text-sm">
                          <IdCard className="h-4 w-4 text-muted-foreground" />
                          {selectedUser?.account_id}
                        </div>

                        <div className="text-sm text-muted-foreground">Name:</div>
                        <div className=" flex items-center gap-2">
                          <User2 className="h-4 w-4 text-muted-foreground" />
                          {selectedUser?.username}
                        </div>

                        <div className="text-sm text-muted-foreground">Email:</div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {selectedUser?.email === " " ? (
                            <span className="opacity-80">(none)</span>
                          ):(
                            <>
                             {selectedUser?.email}
                            </>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground">Role:</div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          {selectedUser?.role}
                        </div>

                        <div className="text-sm text-muted-foreground">Status:</div>
                        <div>
                          {selectedUser?.status === "Available" ? (
                            <Badge className="bg-green-200 text-green-800 hover:bg-green-200 flex items-center gap-1 w-fit">
                              <CircleCheck className="h-3.5 w-3.5" />
                              Available
                            </Badge>
                          ) : (
                            <Badge className="bg-red-200 text-red-900 hover:bg-red-200 flex items-center gap-1 w-fit">
                              <CircleX className="h-3.5 w-3.5" />
                              Blocked
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-[100px_1fr] gap-y-3">
                        <div className="text-sm text-muted-foreground">Created at:</div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          {selectedUser?.created_at}
                        </div>

                        <div className="text-sm text-muted-foreground">Updated at:</div>
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-muted-foreground" />
                          {selectedUser?.updated_at}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={openResetPassword} onOpenChange={setOpenResetPassword}>
                  <DialogContent className="sm:max-w-[500px] font-geist">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                        <KeyRound className="h-5 w-5" />
                        Reset User Password
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground pt-2">
                        This will reset the user's password to the system default.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 font-geist text-sm">
                      <div className="border-amber-200 bg-amber-50 text-amber-800 p-4 rounded-md flex gap-2">
                        <AlertCircle className="h-8 w-8" />
                        <AlertDescription>
                          The user will receive a notification with the default password. @Student01 for Students and @Admin01 for Admins
                        </AlertDescription>
                      </div>

                      <div className="rounded-md bg-[var(--gray-counter)] p-4 ">
                        <p>Are you sure you want to reset this user's password?</p>
                        <p className="mt-2 text-slate-500">This action cannot be undone.</p>
                      </div>
                    </div>
                    <DialogFooter className="flex sm:justify-end gap-2 mt-2">
                      <Button variant="outline" onClick={() => setOpenResetPassword(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={resetPassword}
                        disabled={loading ? true : false}
                      >
                        {loading ? (
                          <>
                            Resetting
                            <Loader2 className="animate-spin"/>
                          </>
                        ) : (
                          <>
                            Reset Password
                          </>
                        )} 
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <AlertDialog open={openUploadExcel} onOpenChange={setOpenUploadExcel}>
                  <AlertDialogContent className='font-geist flex items-center justify-center'>
                    <AlertDialogHeader className='flex flex-col items-center justify-center'>
                      <Loader className='animate-spin'/>
                      <AlertDialogTitle className='text-sm'>Uploading</AlertDialogTitle>
                    </AlertDialogHeader>
                  </AlertDialogContent>
                </AlertDialog>
                <Dialog open={successUpload} onOpenChange={setSuccessUpload}>
                  <DialogContent className='font-geist flex items-center justify-center'>
                    <DialogHeader className='flex flex-col items-center justify-center'>
                      <BadgeCheck className="text-green-500 h-20 w-20" />
                      <DialogTitle className='text-md font-semibold text-center mt-4'>
                        Excel File Uploaded Successfully!
                      </DialogTitle>
                      <DialogDescription className='text-sm  text-center mt-2'>
                        Your data has been imported and is now available in the system.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
          </Card>
        </div>
      </div>
      </div>
    )}
    </>
  )
}