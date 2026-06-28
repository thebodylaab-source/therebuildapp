import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { nanoid } from "nanoid";

export const profileRoutes = new Hono()
  .use("*", authMiddleware)
  .get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const profile = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.userId, user.id)).get();
    return c.json({ profile: profile || null }, 200);
  })
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json();
    
    const existing = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.userId, user.id)).get();
    
    if (existing) {
      const updated = await db.update(schema.userProfiles)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(schema.userProfiles.userId, user.id))
        .returning()
        .get();
      return c.json({ profile: updated }, 200);
    }
    
    const newProfile = await db.insert(schema.userProfiles).values({
      id: nanoid(),
      userId: user.id,
      ...body,
    }).returning().get();
    
    return c.json({ profile: newProfile }, 201);
  });
