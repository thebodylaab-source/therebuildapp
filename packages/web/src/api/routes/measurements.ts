import { Hono } from "hono";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const measurementRoutes = new Hono()
  .use("*", authMiddleware)

  // Histórico de medições
  .get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const rows = await db
      .select()
      .from(schema.bodyMeasurements)
      .where(eq(schema.bodyMeasurements.userId, user.id))
      .orderBy(desc(schema.bodyMeasurements.date))
      .limit(50)
      .all();
    return c.json({ measurements: rows }, 200);
  })

  // Nova medição
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const { date, peito, bracos, abdominal, peso } = await c.req.json();
    if (!date) return c.json({ message: "Data em falta" }, 400);

    const id = nanoid();
    await db.insert(schema.bodyMeasurements).values({
      id,
      userId: user.id,
      date,
      peito: peito ?? null,
      bracos: bracos ?? null,
      abdominal: abdominal ?? null,
      peso: peso ?? null,
    });

    return c.json({ id }, 201);
  })

  // Apagar medição
  .delete("/:id", requireAuth, async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.param();
    await db
      .delete(schema.bodyMeasurements)
      .where(eq(schema.bodyMeasurements.id, id))
      .run();
    return c.json({ ok: true }, 200);
  });
