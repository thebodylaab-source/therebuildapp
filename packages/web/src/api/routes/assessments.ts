import { Hono } from "hono";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { generateText } from "ai";
import { gateway } from "../agent/gateway";
import { workouts, getWorkoutsForPhase } from "../data/workouts";

const ADMIN_EMAIL = "thebodylaab@gmail.com";

// Todos os treinos estáticos + admin para contexto IA
async function getAllWorkoutsContext() {
  const adminWs = await db.select().from(schema.adminWorkouts).all();
  const allStatic = workouts.map(w => ({
    name: w.name,
    phase: w.phase,
    type: w.type,
    duration: w.durationMinutes,
    description: w.description,
    exercises: w.exercises?.map((e: any) => e.name).join(", ") || "",
  }));
  const allAdmin = adminWs.map(w => {
    let exs: any[] = [];
    try { exs = JSON.parse(w.exercises as string); } catch {}
    return {
      name: w.name,
      phase: w.phase,
      type: w.type,
      duration: w.durationMinutes,
      description: w.description,
      exercises: exs.map((e: any) => e.name).join(", "),
    };
  });
  return [...allStatic, ...allAdmin];
}

export const assessmentRoutes = new Hono()
  .use("*", authMiddleware)

  // Histórico de avaliações do utilizador
  .get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const rows = await db
      .select()
      .from(schema.assessments)
      .where(eq(schema.assessments.userId, user.id))
      .orderBy(desc(schema.assessments.createdAt))
      .limit(20)
      .all();
    return c.json({ assessments: rows }, 200);
  })

  // Nova avaliação — chama IA
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const { message, userPhase } = await c.req.json();
    if (!message) return c.json({ message: "Mensagem em falta" }, 400);

    // Buscar contexto de treinos
    const allWs = await getAllWorkoutsContext();
    const phaseWs = allWs.filter(w => w.phase === userPhase || w.phase === "all" || w.phase === "todas");

    const workoutContext = phaseWs
      .map(w => `- ${w.name} (${w.type}, ${w.duration}min, ${w.phase}): ${w.description}. Exercícios: ${w.exercises}`)
      .join("\n");

    const systemPrompt = `És um especialista em exercício e reabilitação desportiva integrado no programa "REBUILD" — um programa de fitness progressivo dividido em fases: Fundação, Construção e Força.

O atleta está atualmente na fase: ${userPhase || "fundacao"}.

TREINOS DISPONÍVEIS PARA ESTE ATLETA:
${workoutContext}

A tua função é:
1. Analisar o que o atleta descreve (dores, limitações, lesões, sensações)
2. Recomendar 2-4 treinos do programa que são adequados para a situação
3. Indicar claramente quais exercícios EVITAR e porquê
4. Dar orientações práticas de execução adaptada
5. Se a situação for grave (dor severa, lesão aguda), recomendar consulta médica primeiro

Responde sempre em Português de Portugal. Sê direto, empático e profissional. Usa formatação clara com secções: **Avaliação**, **Treinos Recomendados**, **O Que Evitar**, **Dicas Práticas**.

Nunca inventes treinos que não estejam na lista acima. Apenas referencia os treinos existentes no programa.`;

    try {
      const { text: aiText } = await generateText({
        model: gateway("anthropic/claude-sonnet-4.6"),
        system: systemPrompt,
        prompt: message,
        maxTokens: 1024,
      });

      // Guardar no histórico
      const id = nanoid();
      await db.insert(schema.assessments).values({
        id,
        userId: user.id,
        userMessage: message,
        aiResponse: aiText || "Não foi possível obter resposta da IA.",
      });

      return c.json({ id, aiResponse: aiText }, 201);
    } catch (err) {
      console.error("Assessment AI error:", err);
      return c.json({ message: "Erro ao contactar a IA" }, 500);
    }
  });
