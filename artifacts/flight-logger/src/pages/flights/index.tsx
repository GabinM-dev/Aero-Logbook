import { useListFlights, getListFlightsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Plane, MapPin, Calendar, Clock, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FlightsLog() {
  const { data: flights, isLoading } = useListFlights({
    query: { queryKey: getListFlightsQueryKey() }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Flight Log</h1>
          <p className="text-muted-foreground">Every journey, meticulously recorded.</p>
        </div>
        <Link href="/flights/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus className="mr-2 h-4 w-4" /> Log Flight
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : flights && flights.length > 0 ? (
          flights.map((flight, index) => (
            <Link key={flight.id} href={`/flights/${flight.id}/edit`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="hidden sm:flex flex-col items-center justify-center w-12 h-12 bg-secondary rounded-full text-secondary-foreground">
                      <Plane className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">{flight.departureAirport}</span>
                        <div className="h-[2px] w-8 bg-border relative">
                          <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground rotate-90" />
                        </div>
                        <span className="font-bold text-lg">{flight.arrivalAirport}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(flight.departureDate), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground">{flight.airline}</span>
                          {flight.flightNumber && <span> {flight.flightNumber}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <div className="text-right flex flex-col items-end">
                      <span className="text-sm font-medium capitalize">
                        {flight.seatClass === "premium_economy" ? "Premium Economy" : flight.seatClass}
                      </span>
                      {flight.distanceKm && (
                        <span className="text-xs text-muted-foreground">{flight.distanceKm} km</span>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="flex flex-col items-center justify-center py-16 px-4 text-center border-dashed">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Plane className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No flights logged yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Start building your personal logbook by recording your first flight.
            </p>
            <Link href="/flights/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              <Plus className="mr-2 h-4 w-4" /> Log First Flight
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
