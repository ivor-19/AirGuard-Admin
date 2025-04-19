"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Wind, Droplets, CloudFog, Gauge, AlertTriangle, Clock, Info, Hourglass } from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AirQualityData {
  isSuccess: boolean
  message: string
  hourlyAverages: {
    aqi: number
    pm2_5: number
    pm10: number
    co: number
    no2: number
    count: number
    timeRange: {
      start: string
      end: string
    }
  } | null
}

export default function AirQualityAverage() {
  const [data, setData] = useState<AirQualityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get<AirQualityData>("https://air-quality-back-end-v2.vercel.app/aqChart/average")
        setData(response.data)
        setError(null)
      } catch (err) {
        setError("Failed to fetch air quality data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(intervalId)
  }, [])

  const getAqiLevel = (aqi: number) => {
    if (aqi <= 20) return { level: "Very Low", color: "text-emerald-500 border-emerald-200" }
    if (aqi <= 40) return { level: "Low", color: "text-green-500 border-green-200" }
    if (aqi <= 90) return { level: "Moderate", color: "text-amber-500 border-amber-200" }
    if (aqi <= 200) return { level: "High", color: "text-red-500 border-red-200" }
    if (aqi <= 280) return { level: "Very High", color: "text-purple-500 border-purple-200" }
    return { level: "Extremely High", color: "text-rose-500 border-rose-200" }
  }

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), "h:mm a")
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <Card className="bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Error Loading Data
          </CardTitle>
          <CardDescription>{error || "Unknown error occurred"}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // No data fallback state
  if (!data.hourlyAverages) {
    return (
      <Card className="bg-muted/30 text-muted-foreground font-geist">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            No Data Available
          </CardTitle>
          <CardDescription>{data.message}</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm">
          <p>Air quality readings were not recorded during this time range.</p>
          <p className="mt-2 italic">{format(new Date(), "MMMM d, yyyy h:mm a")}</p>
        </CardContent>
      </Card>
    )
  }

  const { hourlyAverages } = data
  const aqiInfo = getAqiLevel(hourlyAverages.aqi)

  return (
    <TooltipProvider>
      <Card className="overflow-hidden font-geist">
        <CardHeader>
          <CardTitle>
            <CardTitle className="flex items-center gap-2">
              <Hourglass className="h-5 w-5" />Air Quality Hourly Averages
            </CardTitle>
          </CardTitle>
          <CardDescription className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(hourlyAverages.timeRange.start)} - {formatTime(hourlyAverages.timeRange.end)}
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full">Based on {hourlyAverages.count} reading/s</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Large AQI Display */}
          <div className={`flex flex-col items-center p-6 rounded-xl ${aqiInfo.color}`}>
            <div className="flex items-center gap-2 text-base font-medium mb-1">
              <Gauge className="h-5 w-5" /> Air Quality Index
            </div>
            <div className="text-6xl font-bold my-3">{Math.round(hourlyAverages.aqi)}</div>
            <div className="text-lg font-medium">{aqiInfo.level}</div>
          </div>

          {/* Pollutant boxes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <PollutantBox
              icon={<Droplets />}
              name="PM2.5"
              value={hourlyAverages.pm2_5.toFixed(1)}
              tooltip="Fine particulate matter with diameter less than 2.5 micrometers. Can penetrate deep into lungs and bloodstream."
            />
            <PollutantBox
              icon={<Wind />}
              name="PM10"
              value={hourlyAverages.pm10.toFixed(1)}
              tooltip="Particulate matter with diameter less than 10 micrometers. Can cause respiratory issues."
            />
            <PollutantBox
              icon={<CloudFog />}
              name="CO"
              value={hourlyAverages.co.toFixed(1)}
              tooltip="Carbon Monoxide (CO) is a colorless, odorless gas that can be harmful when inhaled in large amounts."
            />
            <PollutantBox
              icon={<AlertTriangle />}
              name="NO₂"
              value={hourlyAverages.no2.toFixed(1)}
              tooltip="Nitrogen Dioxide (NO₂) is a gaseous air pollutant produced by combustion processes. Can cause respiratory issues."
            />
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

interface PollutantBoxProps {
  icon: React.ReactNode
  name: string
  value: string
  tooltip: string
}

function PollutantBox({ icon, name, value, tooltip }: PollutantBoxProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col p-4 border rounded-lg transition-colors hover:bg-muted/10 font-geist">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              {icon} {name}
            </div>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold mt-2">{value}</div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs font-geist">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}
