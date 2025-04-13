"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

interface AQReading {
  aqi: number;
  pm2_5: number;
  pm10: number;
  co: number;
  no2: number;
  asset_model: string;
  date: string;
}

interface ApiResponse {
  isSuccess: boolean;
  message: string;
  aqReadings: AQReading[];
}

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  pm2_5: {
    label: "PM 2.5",
    color: "hsl(var(--chart-1))",
  },
  pm10: {
    label: "PM 10",
    color: "hsl(var(--chart-4))",
  },
  co: {
    label: "Carbon Monoxide",
    color: "hsl(var(--chart-2))",
  },
  no2: {
    label: "Nitrogen Dioxide",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function PollutantsTime() {
  const [data, setData] = React.useState<AQReading[]>([]);
  const [timeRange, setTimeRange] = React.useState("24h");
  const [cardDescription, setCardDescription] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          "https://air-quality-back-end-v2.vercel.app/aqChart"
        );
        setData(response.data.aqReadings); // Extract aqReadings from the response
        console.log("5 mins have passed, new aq reading extracted")
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 36000);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(interval);
    };
  }, []);

  const filteredData = data.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date(); // Use current date or a specific reference date
    let startDate;

    if (timeRange === "24h") {
      startDate = new Date(referenceDate);
      startDate.setHours(startDate.getHours() - 24);
    } else if (timeRange === "7d") {
      startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === "30d") {
      startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - 90);
    }

    return date >= startDate;
  });

  const formatXAxisTick = (value: string) => {
    const date = new Date(value);
    if (timeRange === "24h") {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } else if (timeRange === "7d") {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  React.useEffect(() => {
    if (timeRange === '24h') {
      setCardDescription('Showing data for the last 24 hours.');
    } else if (timeRange === '7d') {
      setCardDescription('Showing data for the last 7 days.');
    }
  }, [timeRange]); 

  return (
    <>
      {loading ? (
        <Skeleton className="w-full h-full"/>
      ):(
        <Card>
          <CardHeader className="font-geist flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1 text-center sm:text-left">
              <CardTitle>Pollutants Chart</CardTitle>
              <CardDescription className="text-[12px]">
                {cardDescription}
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-[160px] rounded-lg sm:ml-auto"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Last 24 Hours" />
              </SelectTrigger>
              <SelectContent className="rounded-xl font-geist">
                <SelectItem value="24h" className="rounded-lg">
                  Last 24 hours
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Last 7 days
                </SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 font-geist">
            <>
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <AreaChart data={filteredData}>
                  <defs>
                    <linearGradient id="fillpm2_5" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-pm2_5)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-pm2_5)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillpm10" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-pm10)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-pm10)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillco" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-co)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-co)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillno2" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-no2)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-no2)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={formatXAxisTick}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          if (timeRange === "24h" || timeRange === "7d") {
                            return date.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                            });
                          } else {
                            return date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            });
                          }
                        }}
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="pm2_5"
                    type="natural"
                    fill="url(#fillpm2_5)"
                    stroke="var(--color-pm2_5)"
                    // stackId="a"
                  />
                  <Area
                    dataKey="pm10"
                    type="natural"
                    fill="url(#fillpm10)"
                    stroke="var(--color-pm10)"
                    // stackId="a"
                  />
                  <Area
                    dataKey="co"
                    type="natural"
                    fill="url(#fillco)"
                    stroke="var(--color-co)"
                    // stackId="a"
                  />
                  <Area
                    dataKey="no2" 
                    type="natural"
                    fill="url(#fillno2)"
                    stroke="var(--color-no2)"
                    // stackId="a"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
              <span className="flex justify-center font-geist text-xs opacity-80 m-0">
                Chart updates every 5 minutes
              </span>
            </>
          </CardContent>
        </Card>
      )}
    </>
  );
}