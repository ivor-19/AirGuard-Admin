"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, FilterX } from "lucide-react"
import { Skeleton } from "./ui/skeleton"

interface TimelineStep {
  date: string
  timestamp: string
  aqi: number
  pm2_5: number
  pm10: number
  co: number
  no2: number
  scanned_by: string
  scanned_using_model: string
  message: string
  title?: string
  description?: string
}

interface TimelineStepperProps {
  steps: TimelineStep[]
  initialStep?: number
  onChange?: (step: number) => void
}

export function TimelineStepper({ steps, initialStep = 0, onChange }: TimelineStepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)

  const handleStepChange = (index: number) => {
    setCurrentStep(index)
    onChange?.(index)
  }

  return (
    <Card className="font-geist">
      <CardHeader>
        <CardTitle>Air Quality Announcements Timeline</CardTitle>
        <CardDescription>Historical air quality measurements and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full max-w-3xl mx-auto font-geist">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute top-0 left-4 h-full w-0.5 bg-border" />

            <div className="space-y-4">
              {steps.map((step, index) => {
                const isCompleted = index < currentStep
                const isCurrent = index === currentStep
                const isLast = index === steps.length - 1

                // Determine risk level based on AQI
                const getRiskLevel = (aqi: number) => {
                  if (aqi <= 20) return "Low Risk"
                  if (aqi <= 40) return "Mild Risk"
                  if (aqi <= 90) return "Moderate Risk"
                  if (aqi <= 200) return "Unhealthy for Sensitive Groups"
                  if (aqi <= 280) return "Very High Risk"
                  if (aqi <= 900) return "Hazardous"
                  return "Hazardous"
                }

                // Determine color based on AQI
                const getAqiColor = (aqi: number) => {
                  if (aqi <= 20) return "text-emerald-500"
                  if (aqi <= 40) return "text-green-500"
                  if (aqi <= 90) return "text-yellow-500"
                  if (aqi <= 200) return "text-orange-500"
                  if (aqi <= 280) return "text-red-500"
                  if (aqi <= 900) return "text-purple-500"
                  return "text-purple-700"
                }

                return (
                  <div key={index} className={cn("relative pl-12 pb-4", isLast && "pb-0")}>
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute left-4 top-4 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full cursor-pointer z-10",
                        isCompleted ? "bg-primary/20" : isCurrent ? "bg-primary ring-4 ring-primary/20" : "bg-muted",
                      )}
                      onClick={() => handleStepChange(index)}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          isCompleted ? "bg-primary" : isCurrent ? "bg-primary-foreground" : "bg-muted-foreground",
                        )}
                      />
                    </div>

                    {/* Content card */}
                    <div
                      className={cn(
                        "p-4 rounded-lg transition-colors",
                        isCurrent ? "bg-muted" : "hover:bg-muted/50 cursor-pointer",
                      )}
                      onClick={() => handleStepChange(index)}
                    >
                      <div className="flex justify-between items-start">
                        <p className={cn("text-sm", isCompleted ? "text-primary" : "text-muted-foreground")}>
                          {step.date} • {step.timestamp}
                        </p>
                        <span
                          className={cn(
                            "text-sm font-medium px-2 py-0.5 rounded-full bg-muted-foreground/10",
                            getAqiColor(step.aqi),
                          )}
                        >
                          AQI: {step.aqi}
                        </span>
                      </div>

                      <h3 className={cn("font-medium mt-1", !isCompleted && !isCurrent && "text-muted-foreground")}>
                        {getRiskLevel(step.aqi)}
                      </h3>

                      {isCurrent && (
                        <div className="mt-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">PM 2.5:</span> {step.pm2_5}
                            </div>
                            <div>
                              <span className="text-muted-foreground">PM 10:</span> {step.pm10}
                            </div>
                            <div>
                              <span className="text-muted-foreground">CO:</span> {step.co}
                            </div>
                            <div>
                              <span className="text-muted-foreground">NO2:</span> {step.no2}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Announced by:</span> {step.scanned_by}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted-foreground/5 rounded border border-border">
                            {step.message}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => handleStepChange(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => handleStepChange(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TimelineStepperWithData() {
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([])
  const [filteredSteps, setFilteredSteps] = useState<TimelineStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://air-quality-back-end-v2.vercel.app/history')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const data = await response.json()
        
        // Transform the API data to match TimelineStep interface
        const transformedData = data.history.map((item: any) => ({
          date: item.date,
          timestamp: item.timestamp,
          aqi: item.aqi,
          pm2_5: item.pm2_5,
          pm10: item.pm10,
          co: item.co,
          no2: item.no2,
          scanned_by: item.scanned_by,
          scanned_using_model: item.scanned_using_model,
          message: item.message
        }))
        
        // Sort by date and timestamp (newest first)
        transformedData.sort((a: TimelineStep, b: TimelineStep) => {
          const dateA = new Date(`${a.date} ${a.timestamp}`)
          const dateB = new Date(`${b.date} ${b.timestamp}`)
          return dateB.getTime() - dateA.getTime()
        })
        
        setTimelineSteps(transformedData)
        setFilteredSteps(transformedData) // Initialize filtered steps with all data
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get unique dates for the dropdown
  const uniqueDates = [...new Set(timelineSteps.map(step => step.date))]

  const handleDateFilter = (date: string | null) => {
    setSelectedDate(date)
    if (date) {
      const filtered = timelineSteps.filter(step => step.date === date)
      setFilteredSteps(filtered)
    } else {
      setFilteredSteps(timelineSteps) // Reset to show all when filter is cleared
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton className="h-[800px] w-full"/>
      </div>
    )
  }

  if (error) {
    return <div className="p-6 max-w-4xl mx-auto text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="float-right font-geist">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2 border-dashed bg-transparent">
              <Calendar className="mr-1 h-4 w-4" /> 
              {selectedDate ? selectedDate : 'Filter by Date'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="font-geist w-48 max-h-60 overflow-y-auto">
            <DropdownMenuLabel>Available Dates</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {uniqueDates.map((date) => (
              <DropdownMenuItem 
                key={date} 
                onClick={() => handleDateFilter(date)}
                className={selectedDate === date ? "bg-accent" : ""}
              >
                {date}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDateFilter(null)}>
              <FilterX className="mr-2 h-4 w-4" />
              Clear Filter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <TimelineStepper steps={filteredSteps} />
    </div>
  )
}