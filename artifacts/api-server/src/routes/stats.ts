import { Router, type IRouter } from "express";
import { db, flightsTable } from "@workspace/db";
import {
  GetStatsResponse,
  GetCarbonStatsResponse,
  GetStatsByYearResponse,
  GetTopDestinationsResponse,
  GetTopAirlinesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  const flights = await db.select().from(flightsTable);

  const totalFlights = flights.length;
  const totalDistanceKm = flights.reduce((sum, f) => sum + (f.distanceKm ?? 0), 0);
  const totalCarbonKg = flights.reduce((sum, f) => sum + (f.carbonKg ?? 0), 0);

  const airports = new Set<string>();
  for (const f of flights) {
    airports.add(f.departureAirport);
    airports.add(f.arrivalAirport);
  }
  const uniqueAirports = airports.size;

  const airlines = new Set(flights.map((f) => f.airline));
  const uniqueAirlines = airlines.size;

  // Crude country count from IATA codes (first char gives rough region, not country)
  // We'll count unique country-like groupings from airport codes
  const countries = new Set<string>();
  for (const f of flights) {
    [f.departureCity, f.arrivalCity].forEach((city) => {
      if (city) countries.add(city.split(",").pop()?.trim() ?? city);
    });
  }
  const uniqueCountries = Math.max(countries.size, 1);

  const flightsByClass: Record<string, number> = {};
  for (const f of flights) {
    flightsByClass[f.seatClass] = (flightsByClass[f.seatClass] ?? 0) + 1;
  }

  let longestFlightKm: number | null = null;
  let longestFlightRoute: string | null = null;
  for (const f of flights) {
    if (f.distanceKm && (longestFlightKm === null || f.distanceKm > longestFlightKm)) {
      longestFlightKm = f.distanceKm;
      longestFlightRoute = `${f.departureAirport} → ${f.arrivalAirport}`;
    }
  }

  res.json(
    GetStatsResponse.parse({
      totalFlights,
      totalDistanceKm,
      totalCarbonKg: Math.round(totalCarbonKg * 10) / 10,
      uniqueAirports,
      uniqueCountries,
      uniqueAirlines,
      longestFlightKm,
      longestFlightRoute,
      flightsByClass,
    })
  );
});

router.get("/stats/carbon", async (req, res): Promise<void> => {
  const flights = await db.select().from(flightsTable);

  const totalCarbonKg = flights.reduce((sum, f) => sum + (f.carbonKg ?? 0), 0);

  const byYearMap: Record<number, number> = {};
  for (const f of flights) {
    const year = parseInt(f.departureDate.substring(0, 4), 10);
    byYearMap[year] = (byYearMap[year] ?? 0) + (f.carbonKg ?? 0);
  }
  const byYear = Object.entries(byYearMap)
    .map(([year, carbonKg]) => ({ year: parseInt(year, 10), carbonKg: Math.round(carbonKg * 10) / 10 }))
    .sort((a, b) => a.year - b.year);

  const byClassMap: Record<string, { carbonKg: number; flights: number }> = {};
  for (const f of flights) {
    if (!byClassMap[f.seatClass]) byClassMap[f.seatClass] = { carbonKg: 0, flights: 0 };
    byClassMap[f.seatClass].carbonKg += f.carbonKg ?? 0;
    byClassMap[f.seatClass].flights += 1;
  }
  const byClass = Object.entries(byClassMap).map(([seatClass, data]) => ({
    seatClass,
    carbonKg: Math.round(data.carbonKg * 10) / 10,
    flights: data.flights,
  }));

  // A mature tree absorbs ~21 kg CO2/year
  const treesEquivalent = Math.round((totalCarbonKg / 21) * 10) / 10;

  res.json(
    GetCarbonStatsResponse.parse({
      totalCarbonKg: Math.round(totalCarbonKg * 10) / 10,
      byYear,
      byClass,
      treesEquivalent,
    })
  );
});

router.get("/stats/by-year", async (req, res): Promise<void> => {
  const flights = await db.select().from(flightsTable);

  const byYearMap: Record<number, { flights: number; distanceKm: number; carbonKg: number }> = {};
  for (const f of flights) {
    const year = parseInt(f.departureDate.substring(0, 4), 10);
    if (!byYearMap[year]) byYearMap[year] = { flights: 0, distanceKm: 0, carbonKg: 0 };
    byYearMap[year].flights += 1;
    byYearMap[year].distanceKm += f.distanceKm ?? 0;
    byYearMap[year].carbonKg += f.carbonKg ?? 0;
  }

  const result = Object.entries(byYearMap)
    .map(([year, data]) => ({
      year: parseInt(year, 10),
      flights: data.flights,
      distanceKm: data.distanceKm,
      carbonKg: Math.round(data.carbonKg * 10) / 10,
    }))
    .sort((a, b) => a.year - b.year);

  res.json(GetStatsByYearResponse.parse(result));
});

router.get("/stats/destinations", async (req, res): Promise<void> => {
  const flights = await db.select().from(flightsTable);

  const destMap: Record<string, { city: string | null; visits: number }> = {};
  for (const f of flights) {
    if (!destMap[f.arrivalAirport]) {
      destMap[f.arrivalAirport] = { city: f.arrivalCity ?? null, visits: 0 };
    }
    destMap[f.arrivalAirport].visits += 1;
  }

  const result = Object.entries(destMap)
    .map(([airport, data]) => ({ airport, city: data.city, visits: data.visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);

  res.json(GetTopDestinationsResponse.parse(result));
});

router.get("/stats/airlines", async (req, res): Promise<void> => {
  const flights = await db.select().from(flightsTable);

  const airlineMap: Record<string, { flights: number; distanceKm: number }> = {};
  for (const f of flights) {
    if (!airlineMap[f.airline]) airlineMap[f.airline] = { flights: 0, distanceKm: 0 };
    airlineMap[f.airline].flights += 1;
    airlineMap[f.airline].distanceKm += f.distanceKm ?? 0;
  }

  const result = Object.entries(airlineMap)
    .map(([airline, data]) => ({ airline, flights: data.flights, distanceKm: data.distanceKm }))
    .sort((a, b) => b.flights - a.flights)
    .slice(0, 10);

  res.json(GetTopAirlinesResponse.parse(result));
});

export default router;
