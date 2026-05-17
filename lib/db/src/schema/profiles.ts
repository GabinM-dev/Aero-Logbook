import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  name: text("name").notNull(),
  homeAirport: text("home_airport"),
  bio: text("bio"),
  avatarInitials: text("avatar_initials"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
