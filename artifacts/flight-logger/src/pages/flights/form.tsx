import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useEffect } from "react";
import { useCreateFlight, useUpdateFlight, useGetFlight, useDeleteFlight, getListFlightsQueryKey, getGetFlightQueryKey, getGetStatsQueryKey, getGetCarbonStatsQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "wouter";

const flightSchema = z.object({
  airline: z.string().min(1, "Airline is required"),
  flightNumber: z.string().optional(),
  aircraftType: z.string().optional(),
  departureAirport: z.string().length(3, "Must be 3-letter IATA code").toUpperCase(),
  arrivalAirport: z.string().length(3, "Must be 3-letter IATA code").toUpperCase(),
  departureCity: z.string().optional(),
  arrivalCity: z.string().optional(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  durationMinutes: z.coerce.number().optional(),
  distanceKm: z.coerce.number().optional(),
  seatClass: z.enum(["economy", "premium_economy", "business", "first"]),
  notes: z.string().optional(),
});

export default function FlightForm() {
  const { id } = useParams();
  const isEditing = !!id && id !== "new";
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const createFlight = useCreateFlight();
  const updateFlight = useUpdateFlight();
  const deleteFlight = useDeleteFlight();

  const { data: flight, isLoading } = useGetFlight(Number(id), {
    query: { enabled: isEditing, queryKey: getGetFlightQueryKey(Number(id)) }
  });

  const form = useForm<z.infer<typeof flightSchema>>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      airline: "",
      flightNumber: "",
      aircraftType: "",
      departureAirport: "",
      arrivalAirport: "",
      departureCity: "",
      arrivalCity: "",
      departureDate: new Date().toISOString().split('T')[0],
      durationMinutes: undefined,
      distanceKm: undefined,
      seatClass: "economy",
      notes: "",
    },
  });

  useEffect(() => {
    if (isEditing && flight) {
      form.reset({
        airline: flight.airline,
        flightNumber: flight.flightNumber || "",
        aircraftType: flight.aircraftType || "",
        departureAirport: flight.departureAirport,
        arrivalAirport: flight.arrivalAirport,
        departureCity: flight.departureCity || "",
        arrivalCity: flight.arrivalCity || "",
        departureDate: flight.departureDate,
        durationMinutes: flight.durationMinutes || undefined,
        distanceKm: flight.distanceKm || undefined,
        seatClass: flight.seatClass as any,
        notes: flight.notes || "",
      });
    }
  }, [flight, isEditing, form]);

  function onSubmit(values: z.infer<typeof flightSchema>) {
    const action = isEditing ? updateFlight.mutate : createFlight.mutate;
    const payload = isEditing ? { id: Number(id), data: values } : { data: values };

    action(payload as any, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFlightsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCarbonStatsQueryKey() });
        toast({ title: isEditing ? "Flight updated" : "Flight logged successfully" });
        setLocation("/flights");
      },
      onError: () => {
        toast({ title: "Error saving flight", variant: "destructive" });
      }
    });
  }

  function handleDelete() {
    if (!isEditing) return;
    if (confirm("Are you sure you want to delete this flight?")) {
      deleteFlight.mutate({ id: Number(id) }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFlightsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          toast({ title: "Flight deleted" });
          setLocation("/flights");
        }
      });
    }
  }

  if (isEditing && isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/flights" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-secondary h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{isEditing ? "Edit Flight" : "Log New Flight"}</h1>
          <p className="text-muted-foreground">{isEditing ? "Update your flight details." : "Add a new journey to your logbook."}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="departureAirport" render={({ field }) => (
                  <FormItem>
                    <FormLabel>From (IATA)</FormLabel>
                    <FormControl><Input placeholder="LHR" maxLength={3} {...field} className="uppercase" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="arrivalAirport" render={({ field }) => (
                  <FormItem>
                    <FormLabel>To (IATA)</FormLabel>
                    <FormControl><Input placeholder="JFK" maxLength={3} {...field} className="uppercase" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="departureDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="airline" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Airline</FormLabel>
                    <FormControl><Input placeholder="British Airways" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="flightNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight Number</FormLabel>
                    <FormControl><Input placeholder="BA285" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="aircraftType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aircraft</FormLabel>
                    <FormControl><Input placeholder="Boeing 787" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="seatClass" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="premium_economy">Premium Economy</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="first">First Class</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="distanceKm" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distance (km)</FormLabel>
                    <FormControl><Input type="number" placeholder="5540" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl><Input type="number" placeholder="450" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea placeholder="Great flight, smooth landing..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex items-center justify-between pt-4">
                {isEditing ? (
                  <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteFlight.isPending}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                ) : <div/>}
                
                <Button type="submit" disabled={createFlight.isPending || updateFlight.isPending}>
                  {isEditing ? "Save Changes" : "Log Flight"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
