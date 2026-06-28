import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { nanoid } from "nanoid";

export const sessionRoutes = new Hono()
  .use("*", authMiddleware)
  .get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const sessions = await db.select().from(schema.trainingSessions)
      .where(eq(schema.trainingSessions.userId, user.id))
      .orderBy(desc(schema.trainingSessions.createdAt))
      .limit(30);
    return c.json({ sessions }, 200);
  })
  .get("/stats", requireAuth, async (c) => {
    const user = c.get("user")!;
    const allSessions = await db.select().from(schema.trainingSessions)
      .where(eq(schema.trainingSessions.userId, user.id));
    
    const completed = allSessions.filter(s => s.completed);
    const totalMinutes = completed.reduce((acc, s) => acc + s.durationMinutes, 0);
    const thisWeek = completed.filter(s => {
      const sessionDate = new Date(s.date);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return sessionDate >= weekStart;
    });
    
    return c.json({
      totalSessions: completed.length,
      totalMinutes,
      thisWeekSessions: thisWeek.length,
      thisWeekMinutes: thisWeek.reduce((acc, s) => acc + s.durationMinutes, 0),
    }, 200);
  })
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json();
    const today = new Date().toISOString().split("T")[0];
    
    const session = await db.insert(schema.trainingSessions).values({
      id: nanoid(),
      userId: user.id,
      date: today,
      ...body,
    }).returning().get();
    
    return c.json({ session }, 201);
  })
  .patch("/:id", requireAuth, async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.param();
    const body = await c.req.json();
    
    const session = await db.update(schema.trainingSessions)
      .set(body)
      .where(eq(schema.trainingSessions.id, id))
      .returning()
      .get();
    
    return c.json({ session }, 200);
  });
