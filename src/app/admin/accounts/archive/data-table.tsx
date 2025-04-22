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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useEffect, useState } from "react"

import { archiveColumns } from "./columns"
import { User } from "./columns"
import { CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CircleCheck, CircleX, FilterX, IdCard, Import, KeyRound, ListFilter, Loader, Loader2, Mail, PlusCircle, RefreshCcw, RefreshCw, Settings2, Shield, ShieldAlert, ShieldCheck, User2 } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import DeleteModal from "@/components/modals/DeleteModal"
import { Skeleton } from "@/components/ui/skeleton"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import RestoreModal from "@/components/modals/RestoreModal"

const FormSchema = z.object({
  accountId: z.string().min(10, {message: "Account ID must have atleast 10 characters"}),
  name: z.string().min(1, {message: "Name is required"}),
  email: z.string(),
  role: z.enum(["Admin", "User"], {message: "Invalid role"}),
  status: z.enum(["Available", "Blocked"], {message: "Invalid status"})
})

type FormData = z.infer<typeof FormSchema>;

export default function ArchiveDataTable() {
  const { formState: {errors}, setValue } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })
  const [refresh, setRefresh] = useState(0);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`https://air-quality-back-end-v2.vercel.app/users/archive`);
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

  
  const deleteUser = async () => {
    setLoading(true);
    try {
      const selectedRows = table.getSelectedRowModel().rows;
      for (const row of selectedRows) {
        const userId = row.original._id;
        await axios.post(`https://air-quality-back-end-v2.vercel.app/users/deletePermanent/${userId}`);
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

  const restoreUser = async () => {
    setLoading(true);
    try {
      const selectedRows = table.getSelectedRowModel().rows;
      for (const row of selectedRows) {
        const userId = row.original._id;
        await axios.post(`https://air-quality-back-end-v2.vercel.app/users/restore/${userId}`);
      }
      toast.info(`(${selectedRows.length}) User/s has been restored.`)
      fetchUsers();
      setRowSelection({});
      setLoading(false);
      setRestoreModalOpen(false);
    } catch (error) {
      console.error("Error restoring a user", error)
      setRestoreModalOpen(false);
      toast.error("Unknown error has occured")
    }
  }

  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data: users,
    columns: archiveColumns(handleUserSelection, handleViewCompleteDetails),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      
      return Object.values(row.original).some(value => 
        String(value).toLowerCase().includes(search)
      );
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
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min relative ">
            <Card className="absolute left-0 right-0 bg-[var(--table-bg)] p-4 rounded-lg shadow-xl">
              <div className="w-full">
                <div className="flex py-4 font-geist justify-between max-lg:flex-col gap-4">
                  <div className="flex gap-2">
                     <Input
                        placeholder="Search....."
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(event.target.value)}
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
                  </div>
                  <div className="flex gap-2">
                    {Object.keys(rowSelection).length !== 0 ? (
                      <RestoreModal 
                        title={`Restore (${Object.keys(rowSelection).length})`}
                        description={`Are you sure you want to restore ${Object.keys(rowSelection).length} user(s)?.`}
                        open={restoreModalOpen}
                        setOpen={setRestoreModalOpen}
                        onClick={restoreUser}
                        loading={loading}
                      />
                    ) : (
                      <></>
                    )
                    }
                    {Object.keys(rowSelection).length !== 0 ? (
                      <DeleteModal 
                        title={`Delete (${Object.keys(rowSelection).length})`}
                        description={`Are you sure you want to delete ${Object.keys(rowSelection).length} user(s) permanently? This action cannot be undone.`}
                        open={deleteModalOpen}
                        setOpen={setDeleteModalOpen}
                        onClick={deleteUser}
                        loading={loading}
                      />
                    ) : (
                      <></>
                    )
                    }
                  
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
                            colSpan={archiveColumns.length}
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
                </div>
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
              </div>
          </Card>
        </div>
      </div>
      </div>
    )}
    </>
  )
}