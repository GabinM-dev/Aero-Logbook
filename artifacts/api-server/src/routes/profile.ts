import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import { requireAuth, getUserId } from "../middlewares/requireAuth";
import {
  UpdateProfileBody,
  GetProfileResponse,
  UpdateProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureProfile(userId: string, displayName?: string) {
  const [existing] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, userId))
    .limit(1);

  if (existing) return existing;

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AV";

  const [profile] = await db
    .insert(profilesTable)
    .values({
      userId,
      name: displayName ?? "Aviation Enthusiast",
      homeAirport: null,
      bio: null,
      avatarInitials: initials,
    })
    .returning();
  return profile;
}

router.get("/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const displayName = req.headers["x-clerk-display-name"] as string | undefined;
  const profile = await ensureProfile(userId, displayName);
  res.json(GetProfileResponse.parse(profile));
});

router.put("/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid profile body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await ensureProfile(userId);

  const [profile] = await db
    .update(profilesTable)
    .set(parsed.data)
    .where(eq(profilesTable.id, existing.id))
    .returning();

  res.json(UpdateProfileResponse.parse(profile));
});

export default router;
