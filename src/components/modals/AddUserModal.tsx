import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { Button } from '../ui/button'
import axios from 'axios'
import { toast } from 'sonner'
import { Input } from '../ui/input'
import { Loader2, Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AddUserModalProps {
  fetch: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const FormSchema = z.object({
  accountId: z.string().min(4, {message: "Account ID must have atleast 4 characters"}),
  name: z.string().min(1, {message: "Name is required"}),
  email: z.string().email().optional(),
  role: z.enum(["Student", "Admin"]).default("Student")
})

type FormData = z.infer<typeof FormSchema>;

export const AddUserModal = ({open, setOpen, fetch} : AddUserModalProps) => {
  const { register, handleSubmit, formState: {errors}, reset, setError, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      role: "Student",
    }
  })
  const [userExists, setUserExists] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const role = watch("role");

  const addUser = async (data: FormData) => {
    setLoading(true);
    setUserExists(false);
    setEmailExists(false);
    const password = data.role === "Student" ? "@Student01" : "@Admin01";

    const newUser = {
      account_id: data.accountId, 
      username: data.name, 
      email: data.email,
      password: password,
      role: data.role
    }
    try {
      const response = await axios.post('https://air-quality-back-end-v2.vercel.app/users/signUp', newUser);
      console.log("Success", response.data);
      setOpen(false);
      toast.success("User has been created.");
      
      reset({
        accountId: "",
        name: "",
        email: "",
        role: "Student"
      });
      fetch();
      setLoading(false);
    } catch (error) {
      if (error instanceof Error && 'response' in error) {
        const errorResponse = (error as { response: { data: { message?: string; error?: string } } }).response;
    
        if (errorResponse.data) {
          const errorMessage = errorResponse.data.message || errorResponse.data.error;
          console.log(errorMessage);
    
          if (errorMessage === 'User already exists.') {
            console.log(errorResponse.data.message)
            setUserExists(true);
            setLoading(false);
          }
          else if (errorMessage === 'Email already exists.') {
            console.log(errorResponse.data.message)
            setEmailExists(true);
            setLoading(false);
          }
        }
      } else {
        console.error('Error creating account', error);
        setOpen(false);
        setLoading(false);
        toast.error("Unknown error occurs...")
      }
    }
    setLoading(false);
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}><Plus strokeWidth={3}/>Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-geist">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
          Click submit when you&#39;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 p-4">
          <div className="">
            <Label htmlFor="accountId" className="text-right">
              Account ID
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="account_id" 
                className="col-span-3" 
                type="text"
                {...register("accountId")}
                placeholder="MA########"
              />
              {errors.accountId && <span className="text-red-500 text-xs font-geist">{errors.accountId.message}</span>}
              {userExists && <span className="text-red-500 text-xs font-geist">User already exists. Please choose a different account ID.</span>}
            </div>
          </div>
          <div className="">
            <Label htmlFor="username" className="text-right">
              Name
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="name" 
                className="col-span-3" 
                type="text"
                {...register("name")}
                placeholder="Name"
              />
              {errors.name && <span className="text-red-500 text-xs font-geist">{errors.name.message}</span>}
            </div>
          </div>
          <div className="">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="email" 
                className="col-span-3" 
                type="text"
                {...register("email")}
                placeholder="Email"
              />
              {errors.email && <span className="text-red-500 text-xs font-geist">{errors.email.message}</span>}
              {emailExists && <span className="text-red-500 text-xs font-geist">Email already exists. Please choose a different email.</span>}
            </div>
          </div>
          <div>
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select 
              value={role}
              onValueChange={(value: "Student" | "Admin") => setValue("role", value)}
            >
              <SelectTrigger className="w-[180px] font-geist">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className='font-geist'>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex items-center">
          <span className="text-gray-500 text-xs font-geist"> Password will be automatically set to @Student01 for Students or @Admin01 for Admins.</span>
          <Button onClick={handleSubmit(addUser)}> 
            {loading ? ( 
              <>
                Submitting
                <Loader2 className="animate-spin ml-2 h-4 w-4"/>
              </>
            ):(
              <>
                Submit
              </>
            )} 
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}