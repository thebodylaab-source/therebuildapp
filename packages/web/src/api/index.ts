import { Hono } from 'hono';
import { cors } from "hono/cors";
import { auth } from "./auth";
import { authMiddleware } from "./middleware/auth";
import { profileRoutes } from "./routes/profile";
import { checkInRoutes } from "./routes/checkins";
import { sessionRoutes } from "./routes/sessions";
import { achievementRoutes } from "./routes/achievements";
import { communityRoutes } from "./routes/community";
import { workoutRoutes } from "./routes/workouts";
import { adminRoutes } from "./routes/admin";
import { assessmentRoutes } from "./routes/assessments";
import { measurementRoutes } from "./routes/measurements";

const app = new Hono()
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .basePath('api')
  .use("*", authMiddleware)
  .get('/health', (c) => c.json({ status: 'ok' }, 200))
  .route('/profile', profileRoutes)
  .route('/checkins', checkInRoutes)
  .route('/sessions', sessionRoutes)
  .route('/achievements', achievementRoutes)
  .route('/community', communityRoutes)
  .route('/workouts', workoutRoutes)
  .route('/admin', adminRoutes)
  .route('/assessments', assessmentRoutes)
  .route('/measurements', measurementRoutes);

export type AppType = typeof app;
export default app;
