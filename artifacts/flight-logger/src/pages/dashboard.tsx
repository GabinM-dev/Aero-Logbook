import { 
  useGetStats, 
  useGetListFlights, 
  useListFlights,
  useGetCarbonStats,
  getGetStatsQueryKey,
  getGetCarbonStatsQueryKey,
  getListFlightsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, MapPin, Globe, Leaf } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats({ 
    query: { queryKey: getGetStatsQueryKey() } 
  });
  
  const { data: carbon, isLoading: carbonLoading } = useGetCarbonStats({
    query: { queryKey: getGetCarbonStatsQueryKey() }
  });

  const { data: flights, isLoading: flightsLoading } = useListFlights({
    query: { queryKey: getListFlightsQueryKey() }
  });

  if (statsLoading || carbonLoading || flightsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Flight Dashboard</h1>
        <p className="text-muted-foreground">Your aviation activity at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Flights" 
          value={stats?.totalFlights || 0} 
          icon={Plane} 
        />
        <StatCard 
          title="Distance Flown" 
          value={`${(stats?.totalDistanceKm || 0).toLocaleString()} km`} 
          icon={Globe} 
        />
        <StatCard 
          title="Unique Airports" 
          value={stats?.uniqueAirports || 0} 
          icon={MapPin} 
        />
        <StatCard 
          title="Carbon Footprint" 
          value={`${(stats?.totalCarbonKg || 0).toLocaleString()} kg`} 
          icon={Leaf} 
          description={carbon ? `~${carbon.treesEquivalent} trees equivalent` : undefined}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Flights</CardTitle>
          </CardHeader>
          <CardContent>
            {flights && flights.length > 0 ? (
              <div className="space-y-4">
                {flights.slice(0, 5).map((flight) => (
                  <div key={flight.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/50">
                    <div className="flex flex-col">
                      <span className="font-semibold">{flight.departureAirport} → {flight.arrivalAirport}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(flight.departureDate), "MMM d, yyyy")} • {flight.airline} {flight.flightNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No flights logged yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="w-4 h-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
