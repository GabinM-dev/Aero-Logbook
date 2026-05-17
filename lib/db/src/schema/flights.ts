import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const flightsTable = pgTable("flights", {
  id: serial("id").primaryKey(),
  flightNumber: text("flight_number"),
  airline: text("airline").notNull(),
  aircraftType: text("aircraft_type"),
  departureAirport: text("departure_airport").notNull(),
  arrivalAirport: text("arrival_airport").notNull(),
  departureCity: text("departure_city"),
  arrivalCity: text("arrival_city"),
  departureDate: text("departure_date").notNull(),
  durationMinutes: integer("duration_minutes"),
  distanceKm: integer("distance_km"),
  seatClass: text("seat_class").notNull().default("economy"),
  notes: text("notes"),
  carbonKg: real("carbon_kg"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFlightSchema = createInsertSchema(flightsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertFlight = z.infer<typeof insertFlightSchema>;
export type Flight = typeof flightsTable.$inferSelect;
