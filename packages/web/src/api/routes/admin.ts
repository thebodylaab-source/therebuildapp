import { Hono } from "hono";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const ADMIN_EMAIL = "thebodylaab@gmail.com";

// Middleware que verifica se é admin
const requireAdmin = async (c: any, next: any) => {
  const user = c.get("user");
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  if (user.email !== ADMIN_EMAIL) return c.json({ message: "Forbidden" }, 403);
  return next();
};

export const adminRoutes = new Hono()
  .use("*", authMiddleware)

  // ── WORKOUTS ─────────────────────────────────────────────────────────────

  .get("/workouts", requireAuth, requireAdmin, async (c) => {
    const rows = await db.select().from(schema.adminWorkouts).all();
    return c.json({ workouts: rows }, 200);
  })

  .post("/workouts", requireAuth, requireAdmin, async (c) => {
    const body = await c.req.json();
    const { name, phase, type, durationMinutes, description, exercises, finishMessage } = body;
    if (!name || !phase || !type || !durationMinutes || !description || !exercises || !finishMessage) {
      return c.json({ message: "Campos em falta" }, 400);
    }
    const id = nanoid();
    await db.insert(schema.adminWorkouts).values({
      id,
      name,
      phase,
      type,
      durationMinutes: Number(durationMinutes),
      description,
      exercises: typeof exercises === "string" ? exercises : JSON.stringify(exercises),
      finishMessage,
    });
    return c.json({ id }, 201);
  })

  .put("/workouts/:id", requireAuth, requireAdmin, async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { name, phase, type, durationMinutes, description, exercises, finishMessage } = body;
    await db.update(schema.adminWorkouts)
      .set({
        name, phase, type,
        durationMinutes: Number(durationMinutes),
        description,
        exercises: typeof exercises === "string" ? exercises : JSON.stringify(exercises),
        finishMessage,
        updatedAt: new Date(),
      })
      .where(eq(schema.adminWorkouts.id, id));
    return c.json({ ok: true }, 200);
  })

  .delete("/workouts/:id", requireAuth, requireAdmin, async (c) => {
    const { id } = c.req.param();
    await db.delete(schema.adminWorkouts).where(eq(schema.adminWorkouts.id, id));
    return c.json({ ok: true }, 200);
  })

  // ── DOCUMENTS ────────────────────────────────────────────────────────────

  .get("/documents", requireAuth, async (c) => {
    const rows = await db.select().from(schema.adminDocuments).all();
    return c.json({ documents: rows }, 200);
  })

  .post("/documents", requireAuth, requireAdmin, async (c) => {
    const body = await c.req.json();
    const { title, description, fileUrl, fileType, phase } = body;
    if (!title || !fileUrl) return c.json({ message: "Campos em falta" }, 400);
    const id = nanoid();
    await db.insert(schema.adminDocuments).values({
      id, title,
      description: description || "",
      fileUrl,
      fileType: fileType || "pdf",
      phase: phase || "todas",
    });
    return c.json({ id }, 201);
  })

  .delete("/documents/:id", requireAuth, requireAdmin, async (c) => {
    const { id } = c.req.param();
    await db.delete(schema.adminDocuments).where(eq(schema.adminDocuments.id, id));
    return c.json({ ok: true }, 200);
  })

  // ── VIDEOS ────────────────────────────────────────────────────────────────

  .get("/videos", requireAuth, async (c) => {
    const rows = await db.select().from(schema.adminVideos).all();
    return c.json({ videos: rows }, 200);
  })

  .post("/videos", requireAuth, requireAdmin, async (c) => {
    const body = await c.req.json();
    const { title, description, videoUrl, phase, category } = body;
    if (!title || !videoUrl) return c.json({ message: "Campos em falta" }, 400);
    const id = nanoid();
    await db.insert(schema.adminVideos).values({
      id, title,
      description: description || "",
      videoUrl,
      phase: phase || "todas",
      category: category || "tecnica",
    });
    return c.json({ id }, 201);
  })

  .delete("/videos/:id", requireAuth, requireAdmin, async (c) => {
    const { id } = c.req.param();
    await db.delete(schema.adminVideos).where(eq(schema.adminVideos.id, id));
    return c.json({ ok: true }, 200);
  })

  // ── ADMIN WORKOUTS para utilizadores (combinado com estáticos) ───────────

  .get("/all-workouts", requireAuth, async (c) => {
    const rows = await db.select().from(schema.adminWorkouts).all();
    return c.json({ workouts: rows }, 200);
  });
