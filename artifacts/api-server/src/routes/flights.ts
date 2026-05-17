import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, flightsTable } from "@workspace/db";
import { requireAuth, getUserId } from "../middlewares/requireAuth";
import {
  CreateFlightBody,
  GetFlightParams,
  GetFlightResponse,
  UpdateFlightParams,
  UpdateFlightBody,
  UpdateFlightResponse,
  DeleteFlightParams,
  ListFlightsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toDateString(val: unknown): string {
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val);
}

function computeCarbonKg(distanceKm: number, seatClass: string): number {
  const isLongHaul = distanceKm > 1500;
  const baseRate = isLongHaul ? 0.195 : 0.255;
  const classMultipliers: Record<string, number> = {
    economy: 1.0,
    premium_economy: 1.5,
    business: 2.5,
    first: 3.0,
  };
  const multiplier = classMultipliers[seatClass] ?? 1.0;
  return Math.round(distanceKm * baseRate * multiplier * 10) / 10;
}

router.get("/flights", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const flights = await db
    .select()
    .from(flightsTable)
    .where(eq(flightsTable.userId, userId))
    .orderBy(desc(flightsTable.departureDate));
  res.json(ListFlightsResponse.parse(flights));
});

router.post("/flights", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = CreateFlightBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid flight body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const d = parsed.data;
  const departureDate = toDateString(d.departureDate);
  const carbonKg = d.distanceKm
    ? computeCarbonKg(d.distanceKm, d.seatClass ?? "economy")
    : null;

  const [flight] = await db
    .insert(flightsTable)
    .values({
      userId,
      flightNumber: d.flightNumber ?? null,
      airline: d.airline,
      aircraftType: d.aircraftType ?? null,
      departureAirport: d.departureAirport,
      arrivalAirport: d.arrivalAirport,
      departureCity: d.departureCity ?? null,
      arrivalCity: d.arrivalCity ?? null,
      departureDate,
      durationMinutes: d.durationMinutes ?? null,
      distanceKm: d.distanceKm ?? null,
      seatClass: d.seatClass ?? "economy",
      notes: d.notes ?? null,
      carbonKg,
    })
    .returning();

  res.status(201).json(GetFlightResponse.parse(flight));
});

router.get("/flights/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = GetFlightParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [flight] = await db
    .select()
    .from(flightsTable)
    .where(and(eq(flightsTable.id, params.data.id), eq(flightsTable.userId, userId)));

  if (!flight) {
    res.status(404).json({ error: "Flight not found" });
    return;
  }

  res.json(GetFlightResponse.parse(flight));
});

router.patch("/flights/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = UpdateFlightParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateFlightBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid flight update body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const d = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (d.flightNumber !== undefined) updateData.flightNumber = d.flightNumber;
  if (d.airline !== undefined) updateData.airline = d.airline;
  if (d.aircraftType !== undefined) updateData.aircraftType = d.aircraftType;
  if (d.departureAirport !== undefined) updateData.departureAirport = d.departureAirport;
  if (d.arrivalAirport !== undefined) updateData.arrivalAirport = d.arrivalAirport;
  if (d.departureCity !== undefined) updateData.departureCity = d.departureCity;
  if (d.arrivalCity !== undefined) updateData.arrivalCity = d.arrivalCity;
  if (d.departureDate !== undefined) updateData.departureDate = toDateString(d.departureDate);
  if (d.durationMinutes !== undefined) updateData.durationMinutes = d.durationMinutes;
  if (d.seatClass !== undefined) updateData.seatClass = d.seatClass;
  if (d.notes !== undefined) updateData.notes = d.notes;
  if (d.distanceKm !== undefined) {
    updateData.distanceKm = d.distanceKm;
    updateData.carbonKg = computeCarbonKg(
      d.distanceKm,
      (d.seatClass as string) ?? "economy"
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [flight] = await db
    .update(flightsTable)
    .set(updateData as any)
    .where(and(eq(flightsTable.id, params.data.id), eq(flightsTable.userId, userId)))
    .returning();

  if (!flight) {
    res.status(404).json({ error: "Flight not found" });
    return;
  }

  res.json(UpdateFlightResponse.parse(flight));
});

router.delete("/flights/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = DeleteFlightParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [flight] = await db
    .delete(flightsTable)
    .where(and(eq(flightsTable.id, params.data.id), eq(flightsTable.userId, userId)))
    .returning();

  if (!flight) {
    res.status(404).json({ error: "Flight not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
