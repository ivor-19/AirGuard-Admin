"use client"

import * as React from "react"
import { ShieldQuestion, TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import axios from "axios"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface User {
  _id: string
  status: "Ready" | "Blocked"
}

export function UsersStatus({ refresh }: { refresh: number }) {
  const [totalUsers, setTotalUsers] = React.useState(0)
  const [readyCount, setReadyCount] = React.useState(0)
  const [blockedCount, setBlockedCount] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get("https://air-quality-back-end-v2.vercel.app/users")
      const users: User[] = response.data.users

      const ready = users.filter((user) => user.status === "Ready").length
      const blocked = users.filter((user) => user.status === "Blocked").length

      setTotalUsers(users.length)
      setReadyCount(ready)
      setBlockedCount(blocked)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchUsers()
  }, [refresh])

  const readyChartData = [{ role: "ready", users: readyCount, fill: "#22c55e" }]

  const blockedChartData = [{ role: "blocked", users: blockedCount, fill: "#ef4444" }]

  const chartConfig = {
    users: {
      label: "Users",
    },
    ready: {
      label: "Ready",
    },
    blocked: {
      label: "Blocked",
    },
  } satisfies ChartConfig

  const renderStatusChart = (count: number, label: string, data: unknown[], color: string) => {
    if (count === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-44">
          <span className="text-3xl font-bold text-muted-foreground">{count}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      )
    }

    return (
      <ChartContainer config={chartConfig} className="w-full min-h-[200px] flex justify-center items-center font-geist">
        <PieChart width={250} height={250}>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="users" nameKey="role" innerRadius={50} outerRadius={60} strokeWidth={5}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                        style={{ fill: color }}
                      >
                        {count}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-xs">
                        {label}
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    )
  }

  return (
    <Card className="w-full shadow-sm font-geist">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldQuestion className="h-5 w-5" />
              Users Status Overview
            </CardTitle>
            <CardDescription className="text-xs">Distribution of user accounts by status</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-44">
            <div className="animate-pulse text-muted-foreground">Loading user data...</div>
          </div>
        ) : totalUsers === 0 ? (
          <div className="flex items-center justify-center h-44">
            <span className="text-muted-foreground text-sm">No users found</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border rounded-lg">
              {renderStatusChart(readyCount, "Ready", readyChartData, "#22c55e")}
            </div>
            <div className="border rounded-lg">
              {renderStatusChart(blockedCount, "Blocked", blockedChartData, "#ef4444")}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <div className="w-full">
          <div className="flex items-center gap-2 font-medium text-sm">
            <TrendingUp className="h-4 w-4" />
            Status Distribution
          </div>
          <div className="text-xs text-muted-foreground mt-1">Showing the total number of active and blocked users</div>
        </div>
      </CardFooter>
    </Card>
  )
}
