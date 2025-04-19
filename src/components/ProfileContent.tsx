"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Lock, IdCard, User2, Mail, Loader } from "lucide-react"
import { useAuth } from "@/app/context/AuthContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import ImageGallery from "./ImageGallery"
import ImageUpload from "./ImageUpload"

// Password validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function AccountPage() {
  const { userCred } = useAuth()
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile")
  const [loading, setLoading] = useState(false)
  const [incorrectCurrent, setIncorrectCurrent] = useState(false);
  
  // Password form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const p = { 
        currentPassword: data.currentPassword, 
        newPassword: data.newPassword, 
        confirmPassword: data.confirmPassword 
      }
      const response = await axios.post(
        `https://air-quality-back-end-v2.vercel.app/users/changePassword/${userCred?._id}`, 
        p
      );
      
      if (response.data.isSuccess) {
        toast.success("New password has been saved!");
        setIncorrectCurrent(false)
      } else {
        toast.error(response.data.message || "Failed to update password");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(error.response.data.message || "Error changing password");
        if(error.response.data.message === 'Current password is incorrect'){
          setIncorrectCurrent(true)
        }
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Error has occurred", error);
    } finally {
      setLoading(false);
      reset();
    }
  }

  return (
    <div className="container max-w-5xl py-10 font-geist">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="md:w-64 shrink-0 space-y-2">
          <Button 
            variant={activeTab === "profile" ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveTab("profile")}
          >
            <User className="h-4 w-4 mr-2" />
            My Profile
          </Button>
          <Button 
            variant={activeTab === "password" ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveTab("password")}
          >
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "profile" ? "Profile Information" : "Change Password"}
              </CardTitle>
              <CardDescription>
                {activeTab === "profile" 
                  ? "View your account details" 
                  : "Update your password"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === "profile" ? (
                <div className="space-y-4">
                  <div>
                    <Label>Account ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <IdCard className="h-4 w-4" />
                      <span>{userCred?.account_id}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Name</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <User2 className="h-4 w-4" />
                      <span>{userCred?.username}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      <span>{userCred?.email}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      {...register("currentPassword")} 
                    />
                    {errors.currentPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.currentPassword.message as string}
                      </p>
                    )}
                    {incorrectCurrent && (
                      <p className="text-sm text-red-500 mt-1">
                        Current password is incorrect
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      {...register("newPassword")} 
                    />
                    {errors.newPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.newPassword.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      {...register("confirmPassword")} 
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.confirmPassword.message as string}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="mt-4">
                    {loading ? (
                      <>
                        Updating<Loader className="animate-spin"/>
                      </>
                    ):(
                      <>
                        Update Password
                      </>
                    )}

                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
          <ImageGallery />
          <ImageUpload />
        </div>
      </div>
    </div>
  )
}