import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export * from "./auth-schema";

// User profiles (extends Better Auth user)
export const userProfiles = sqliteTable("user_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  segment: text("segment").notNull().default("sedentario"), // ocupado | regressado | sedentario
  age: integer("age"),
  currentPhase: text("current_phase").notNull().default("fundacao"), // fundacao | construcao | forca
  phaseWeek: integer("phase_week").notNull().default(1),
  onboardingDone: integer("onboarding_done", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Daily check-ins
export const checkIns = sqliteTable("check_ins", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  sleepQuality: integer("sleep_quality"), // 1-5
  stressLevel: integer("stress_level"), // 1-3: 1=sem stress 2=normal 3=stressado
  energyLevel: integer("energy_level"), // 1-5
  timeAvailable: text("time_available"), // "pouco" | "normal" | "muito"
  mode: text("mode").notNull().default("normal"), // normal | manutencao
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Training sessions
export const trainingSessions = sqliteTable("training_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  workoutId: text("workout_id").notNull(),
  workoutName: text("workout_name").notNull(),
  workoutType: text("workout_type").notNull(), // forca | recuperacao | cardio | reset
  durationMinutes: integer("duration_minutes").notNull(),
  effortRating: text("effort_rating"), // facil | ok | demais
  painReported: integer("pain_reported", { mode: "boolean" }).notNull().default(false),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  date: text("date").notNull(), // YYYY-MM-DD
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Functional achievements
export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  achievementKey: text("achievement_key").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  unlockedAt: integer("unlocked_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Vitality scores (weekly)
export const vitalityScores = sqliteTable("vitality_scores", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  weekNumber: integer("week_number").notNull(),
  score: real("score").notNull(), // 0-100
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Community posts
export const communityPosts = sqliteTable("community_posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("geral"), // geral | vitoria | regressei | duvida
  likesCount: integer("likes_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Community post likes
export const communityLikes = sqliteTable("community_likes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  postId: text("post_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Admin-managed workouts (DB, not static JSON)
export const adminWorkouts = sqliteTable("admin_workouts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phase: text("phase").notNull(), // fundacao | construcao | forca
  type: text("type").notNull(),   // forca | recuperacao | cardio | reset
  durationMinutes: integer("duration_minutes").notNull(),
  description: text("description").notNull(),
  exercises: text("exercises").notNull(), // JSON string
  finishMessage: text("finish_message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Admin-managed documents
export const adminDocuments = sqliteTable("admin_documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  fileUrl: text("file_url").notNull(), // URL (upload ou externo)
  fileType: text("file_type").notNull().default("pdf"), // pdf | doc | other
  phase: text("phase").notNull().default("todas"), // fundacao | construcao | forca | todas
  tags: text("tags").notNull().default(""), // JSON array ex: ["sono","hormonas"]
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Admin-managed videos
export const adminVideos = sqliteTable("admin_videos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  videoUrl: text("video_url").notNull(), // YouTube URL ou direto
  phase: text("phase").notNull().default("todas"),
  category: text("category").notNull().default("tecnica"), // tecnica | nutricao | motivacao | outro
  tags: text("tags").notNull().default(""), // JSON array ex: ["sono","treino"]
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// AI Assessments — dores e recomendações
export const assessments = sqliteTable("assessments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userMessage: text("user_message").notNull(),
  aiResponse: text("ai_response").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Body measurements tracking
export const bodyMeasurements = sqliteTable("body_measurements", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  peito: real("peito"),    // cm
  bracos: real("bracos"),  // cm
  abdominal: real("abdominal"), // cm
  peso: real("peso"),      // kg (optional)
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
