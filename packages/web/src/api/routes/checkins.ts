import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { nanoid } from "nanoid";

export const checkInRoutes = new Hono()
  .use("*", authMiddleware)
  .get("/today", requireAuth, async (c) => {
    const user = c.get("user")!;
    const today = new Date().toISOString().split("T")[0];
    const checkIn = await db.select().from(schema.checkIns)
      .where(and(eq(schema.checkIns.userId, user.id), eq(schema.checkIns.date, today)))
      .get();
    return c.json({ checkIn: checkIn || null }, 200);
  })
  .get("/recent", requireAuth, async (c) => {
    const user = c.get("user")!;
    const checkIns = await db.select().from(schema.checkIns)
      .where(eq(schema.checkIns.userId, user.id))
      .orderBy(desc(schema.checkIns.createdAt))
      .limit(14);
    return c.json({ checkIns }, 200);
  })
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json();
    const today = new Date().toISOString().split("T")[0];
    
    // Upsert today's check-in
    const existing = await db.select().from(schema.checkIns)
      .where(and(eq(schema.checkIns.userId, user.id), eq(schema.checkIns.date, today)))
      .get();
    
    if (existing) {
      const updated = await db.update(schema.checkIns)
        .set(body)
        .where(and(eq(schema.checkIns.userId, user.id), eq(schema.checkIns.date, today)))
        .returning()
        .get();
      return c.json({ checkIn: updated }, 200);
    }
    
    const checkIn = await db.insert(schema.checkIns).values({
      id: nanoid(),
      userId: user.id,
      date: today,
      ...body,
    }).returning().get();
    
    return c.json({ checkIn }, 201);
  })
  .delete("/today", requireAuth, async (c) => {
    const user = c.get("user")!;
    const today = new Date().toISOString().split("T")[0];
    await db.delete(schema.checkIns)
      .where(and(eq(schema.checkIns.userId, user.id), eq(schema.checkIns.date, today)));
    return c.json({ ok: true }, 200);
  });
