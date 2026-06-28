import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { nanoid } from "nanoid";

export const achievementRoutes = new Hono()
  .use("*", authMiddleware)
  .get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const achievements = await db.select().from(schema.achievements)
      .where(eq(schema.achievements.userId, user.id));
    return c.json({ achievements }, 200);
  })
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json();
    
    const achievement = await db.insert(schema.achievements).values({
      id: nanoid(),
      userId: user.id,
      ...body,
    }).returning().get();
    
    return c.json({ achievement }, 201);
  });
