"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"
import axios from "axios"
import { Skeleton } from "../ui/skeleton"

const initialChartData = [
  { pollutant: "PM 2.5", data: 0 },
  { pollutant: "PM 10", data: 0 },
  { pollutant: "Carbon Monoxide", data: 0 },
  { pollutant: "VOC", data: 0 },
  { pollutant: "Nitrogen Dioxide", data: 0 },
]

const chartConfig = {
  data: {
    label: "Data",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function PollutantsRadar() {
  // const [model, setModel] = useState("modelx21");
  const [chartData, setChartData] = useState(initialChartData);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://air-quality-back-end-v2.vercel.app/aqReadings/${'modelx21'}`)
        const readings = response.data.aqReadings[0];
        if(readings){
          setChartData([
            { pollutant: "PM 2.5", data: readings.pm2_5},
            { pollutant: "PM 10", data: 21 },
            { pollutant: "Carbon Monoxide", data: readings.co},
            { pollutant: "Nitrogen Dioxide", data: readings.no2},
          ]);
        }
        setLoading(false)
      } catch (error) {
        console.error("Error occured", error)
      }
    }
    fetchData();

    const intervalId = setInterval(fetchData, 2000);
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  },[])


  return (
    <>
      {loading ? (
        <Skeleton className="w-full h-full"/>
      ):(
        <Card>
        <CardHeader className="items-center pb-4 border-b font-geist">
          <CardTitle>AQI Radar Chart</CardTitle>
          <CardDescription className="text-[12px]">
            Showing the current AQI based on pollutant concentration.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0 font-geist">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px] w-full"
          >
            <RadarChart data={chartData}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <PolarGrid
                className="fill-[--color-data] opacity-20"
                gridType="circle"
              />
              <PolarAngleAxis dataKey="pollutant" />
              <Radar
                dataKey="data"
                fill="var(--color-data)"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm font-geist">
          <div className="flex items-center gap-2 font-medium leading-none">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2 leading-none text-muted-foreground">
            January - June 2024
          </div>
        </CardFooter>
      </Card>
      )}
    </>
  )
}
