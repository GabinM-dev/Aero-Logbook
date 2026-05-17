import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import {
  UpdateProfileBody,
  GetProfileResponse,
  UpdateProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureProfile() {
  const profiles = await db.select().from(profilesTable).limit(1);
  if (profiles.length === 0) {
    const [profile] = await db
      .insert(profilesTable)
      .values({ name: "Aviation Enthusiast", homeAirport: null, bio: null, avatarInitials: "AE" })
      .returning();
    return profile;
  }
  return profiles[0];
}

router.get("/profile", async (req, res): Promise<void> => {
  const profile = await ensureProfile();
  res.json(GetProfileResponse.parse(profile));
});

router.put("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid profile body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await ensureProfile();

  const [profile] = await db
    .update(profilesTable)
    .set(parsed.data)
    .where(eq(profilesTable.id, existing.id))
    .returning();

  res.json(UpdateProfileResponse.parse(profile));
});

export default router;
