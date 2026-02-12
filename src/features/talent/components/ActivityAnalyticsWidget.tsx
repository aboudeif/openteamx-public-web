import { useEffect, useState } from "react";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { IS_DEMO_MODE, talentService } from "@/services";

const activityData = [
  { day: "Mon", "TechVentures": 12, "DesignCo": 8, "StartupX": 5 },
  { day: "Tue", "TechVentures": 15, "DesignCo": 10, "StartupX": 8 },
  { day: "Wed", "TechVentures": 8, "DesignCo": 12, "StartupX": 6 },
  { day: "Thu", "TechVentures": 20, "DesignCo": 6, "StartupX": 10 },
  { day: "Fri", "TechVentures": 18, "DesignCo": 14, "StartupX": 12 },
  { day: "Sat", "TechVentures": 5, "DesignCo": 3, "StartupX": 2 },
  { day: "Sun", "TechVentures": 3, "DesignCo": 2, "StartupX": 1 },
];

const teamColors = {
  TechVentures: "hsl(231, 48%, 48%)",
  DesignCo: "hsl(142, 71%, 45%)",
  StartupX: "hsl(38, 92%, 50%)",
};

export function ActivityAnalyticsWidget() {
  const [chartData, setChartData] = useState(activityData);

  useEffect(() => {
    if (IS_DEMO_MODE) {
      setChartData(activityData);
      return;
    }

    const loadAnalytics = async () => {
      try {
        const response = await talentService.getActivityAnalytics("week");
        const data = response?.data || response;
        const series = Array.isArray(data?.series) ? data.series : Array.isArray(data) ? data : [];
        setChartData(series.length > 0 ? series : []);
      } catch {
        setChartData([]);
      }
    };

    void loadAnalytics();
  }, []);

  const totalActivities = chartData.reduce((acc, item: any) => {
    return acc + Object.entries(item).reduce((sum, [key, value]) => {
      if (key === "day" || key === "label") return sum;
      return sum + (typeof value === "number" ? value : 0);
    }, 0);
  }, 0);

  return (
    <WidgetCard title="Activity Analytics" icon={BarChart3} className="col-span-2">
      <div className="h-64">
        {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={chartData[0]?.day ? "day" : "label"} 
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: "12px" }}
              iconType="circle"
            />
            {Object.keys(chartData[0] || {})
              .filter((key) => key !== "day" && key !== "label")
              .slice(0, 3)
              .map((key, idx) => {
                const colors = [teamColors.TechVentures, teamColors.DesignCo, teamColors.StartupX];
                return <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} />;
              })}
          </BarChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No activity data available
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">Total this week:</span>
          <span className="font-semibold text-foreground">{totalActivities} activities</span>
        </div>
        <span className="text-success text-xs">{IS_DEMO_MODE ? "+12% vs last week" : "Live analytics"}</span>
      </div>
    </WidgetCard>
  );
}
