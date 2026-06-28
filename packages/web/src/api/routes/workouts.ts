import { Hono } from "hono";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { workouts, getWorkoutById, getWorkoutsForPhase, getDailyWorkout, getSavedayWorkout } from "../data/workouts";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";

export const workoutRoutes = new Hono()
  .use("*", authMiddleware)
  .get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const profile = await db.select().from(schema.userProfiles)
      .where(eq(schema.userProfiles.userId, user.id)).get();
    
    const phase = profile?.currentPhase || "fundacao";
    const segment = profile?.segment || "sedentario";
    const dayOfWeek = new Date().getDay();
    
    const daily = getDailyWorkout(phase, segment, dayOfWeek);
    const allForPhase = getWorkoutsForPhase(phase);
    const saveday = getSavedayWorkout();
    
    return c.json({ daily, allForPhase, saveday }, 200);
  })
  .get("/all", requireAuth, async (c) => {
    const adminWorkouts = await db.select().from(schema.adminWorkouts).all();
    const merged = [
      ...workouts,
      ...adminWorkouts.map(w => ({
        id: `admin-${w.id}`,
        title: w.name,
        description: w.description || "",
        phase: w.phase || "all",
        duration: w.durationMinutes || 0,
        type: w.type,
        exercises: (() => { try { return JSON.parse(w.exercises as string); } catch { return []; } })(),
        finishMessage: w.finishMessage,
        adminAdded: true,
      })),
    ];
    return c.json({ workouts: merged }, 200);
  })
  .get("/:id", requireAuth, async (c) => {
    const { id } = c.req.param();
    const workout = getWorkoutById(id);
    if (!workout) return c.json({ message: "Not found" }, 404);
    return c.json({ workout }, 200);
  });
