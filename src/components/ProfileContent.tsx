"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Check, User, Lock, IdCard, User2, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/context/AuthContext"

// Media query hook
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    const handleChange = () => {
      setMatches(mediaQuery.matches)
    }

    // Set initial value
    setMatches(mediaQuery.matches)

    mediaQuery.addEventListener("change", handleChange)
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [query])

  return matches
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile")
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [error, setError] = useState("")
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { userCred } = useAuth();

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Reset states
    setError("")

    // Simple validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    // Here you would call your API to change the password
    // For demo purposes, we'll just simulate success
    setTimeout(() => {
      setError("")
      setPasswordChanged(true)

      // Reset the success message after 3 seconds
      setTimeout(() => {
        setPasswordChanged(false)
      }, 3000)
    }, 1000)
  }

  const NavButton = ({
    id,
    label,
    icon,
  }: {
    id: "profile" | "password"
    label: string
    icon: React.ReactNode
  }) => (
    <Button
      variant={activeTab === id ? "default" : "ghost"}
      className={cn("justify-start w-full", isMobile ? "flex-1" : "mb-1")}
      onClick={() => setActiveTab(id)}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Button>
  )

  return (
    <div className="container max-w-5xl py-10 font-geist">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation */}
        <div className={cn("md:w-64 shrink-0", isMobile ? "mb-4" : "")}>
          <div className={cn("flex md:flex-col", isMobile ? "space-x-2" : "space-y-1")}>
            <NavButton id="profile" label="My Profile" icon={<User className="h-4 w-4" />} />
            <NavButton id="password" label="Change Password" icon={<Lock className="h-4 w-4" />} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">{activeTab === "profile" ? "My Profile" : "Change Password"}</CardTitle>
              <CardDescription>
                {activeTab === "profile" ? "View your account information" : "Update your password"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === "profile" ? (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Account ID</Label>
                    <div className="flex gap-2 items-center">
                      <IdCard className="h-4 w-4 text-muted-foreground" />
                      <div className="text-lg font-medium">{userCred?.account_id}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <div className="flex gap-2 items-center">
                      <User2 className="h-4 w-4 text-muted-foreground" />
                      <div className="text-lg font-medium">{userCred?.username}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <div className="flex gap-2 items-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div className="text-lg font-medium">{userCred?.email}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {passwordChanged && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <Check className="h-4 w-4" />
                      <AlertDescription>Password successfully changed</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" name="currentPassword" type="password" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" name="newPassword" type="password" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" name="confirmPassword" type="password" />
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit">Save Password</Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
