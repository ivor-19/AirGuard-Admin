"use client"

import * as React from "react"
import { Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Label, Pie, PieChart } from "recharts"
import axios from "axios"

interface User {
  _id: string
  role: "User" | "Admin" 
}

export function UsersCount({ refresh }: { refresh: number }) {
  const [totalUsers, setTotalUsers] = React.useState(0)
  const [adminCount, setAdminCount] = React.useState(0)
  const [userCount, setUserCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get("https://air-quality-back-end-v2.vercel.app/users")
      const users: User[] = response.data.users

      const admins = users.filter((user) => user.role === "Admin").length
      const usersR = users.filter((user) => user.role === "User").length

      setTotalUsers(users.length)
      setUserCount(usersR)
      setAdminCount(admins)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchUsers()
  }, [refresh])

  const chartData = [
    {
      role: "user",
      users: userCount,
      fill: "#9333ea",
      percentage: totalUsers ? Math.round((userCount / totalUsers) * 100) : 0,
    },
    {
      role: "admin",
      users: adminCount,
      fill: "#fde68a",
      percentage: totalUsers ? Math.round((adminCount / totalUsers) * 100) : 0,
    },
  ]

  const chartConfig = {
    users: {
      label: "Users",
    },
    user: {
      label: "User/s",
      color: "#10b981",
    },
    admin: {
      label: "Admin/s",
      color: "#f59e0b",
    },
  } satisfies ChartConfig

  return (
    <Card className="overflow-hidden border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md font-geist">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />Accounts Overview
            </CardTitle>
            <CardDescription className="text-xs">Showing the total number of accounts</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[250px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : totalUsers > 0 ? (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px] border rounded-lg w-full">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="users"
                  nameKey="role"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={2}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                              {totalUsers}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                              Total Users
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {chartData.map((item) => (
                <div key={item.role} className="flex flex-col rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium capitalize">{item.role}</span>
                      <span className="text-sm">/s</span>
                    </div>
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{item.users}</span>
                    <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[250px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No Accounts Found</h3>
            <p className="text-sm text-muted-foreground">Account data will appear here once available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
