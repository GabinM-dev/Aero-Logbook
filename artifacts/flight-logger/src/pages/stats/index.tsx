import { useGetStatsByYear, useGetTopDestinations, useGetTopAirlines, useGetCarbonStats, getGetStatsByYearQueryKey, getGetTopDestinationsQueryKey, getGetTopAirlinesQueryKey, getGetCarbonStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PieChart, Pie } from "recharts";

export default function Statistics() {
  const { data: yearlyStats } = useGetStatsByYear({ query: { queryKey: getGetStatsByYearQueryKey() } });
  const { data: topDestinations } = useGetTopDestinations({ query: { queryKey: getGetTopDestinationsQueryKey() } });
  const { data: topAirlines } = useGetTopAirlines({ query: { queryKey: getGetTopAirlinesQueryKey() } });
  const { data: carbonStats } = useGetCarbonStats({ query: { queryKey: getGetCarbonStatsQueryKey() } });

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Statistics</h1>
        <p className="text-muted-foreground">Deep dive into your aviation history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Flights by Year</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {yearlyStats && yearlyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyStats}>
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--secondary))'}}
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="flights" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carbon by Class</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {carbonStats && carbonStats.byClass.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={carbonStats.byClass}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="carbonKg"
                    nameKey="seatClass"
                  >
                    {carbonStats.byClass.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            {topDestinations && topDestinations.length > 0 ? (
              <div className="space-y-4">
                {topDestinations.map((dest, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{dest.airport}</div>
                        <div className="text-xs text-muted-foreground">{dest.city || "Unknown"}</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{dest.visits} visits</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">Not enough data</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Airlines</CardTitle>
          </CardHeader>
          <CardContent>
            {topAirlines && topAirlines.length > 0 ? (
              <div className="space-y-4">
                {topAirlines.map((airline, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {i + 1}
                      </div>
                      <div className="font-semibold">{airline.airline}</div>
                    </div>
                    <div className="text-sm font-medium">{airline.flights} flights</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">Not enough data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
