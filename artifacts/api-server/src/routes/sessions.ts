import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sessionsTable, conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import { GetSessionParams, GenerateDrinkParams } from "@workspace/api-zod";
import { ai } from "@workspace/integrations-gemini-ai";

const router: IRouter = Router();

router.post("/sessions", async (req, res) => {
  const body = req.body as { conversationId: number };
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversationsTable.id, body.conversationId),
  });
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const existing = await db.select().from(sessionsTable)
    .where(eq(sessionsTable.conversationId, body.conversationId));
  if (existing.length > 0) {
    const s = existing[0];
    const fullSession = {
      id: s.id,
      conversationId: s.conversationId,
      drinkName: s.drinkName,
      drinkDescription: s.drinkDescription,
      drinkIngredients: s.drinkIngredients,
      drinkInstructions: s.drinkInstructions,
      drinkEmoji: s.drinkEmoji,
      createdAt: s.createdAt,
      conversationTitle: conversation.title,
    };
    res.status(200).json(fullSession);
    return;
  }

  const [session] = await db
    .insert(sessionsTable)
    .values({ conversationId: body.conversationId })
    .returning();

  res.status(201).json({
    ...session,
    conversationTitle: conversation.title,
  });
});

router.get("/sessions", async (req, res) => {
  const sessions = await db
    .select({
      id: sessionsTable.id,
      conversationId: sessionsTable.conversationId,
      drinkName: sessionsTable.drinkName,
      drinkDescription: sessionsTable.drinkDescription,
      drinkIngredients: sessionsTable.drinkIngredients,
      drinkInstructions: sessionsTable.drinkInstructions,
      drinkEmoji: sessionsTable.drinkEmoji,
      createdAt: sessionsTable.createdAt,
      conversationTitle: conversationsTable.title,
    })
    .from(sessionsTable)
    .innerJoin(conversationsTable, eq(sessionsTable.conversationId, conversationsTable.id))
    .orderBy(desc(sessionsTable.createdAt));

  res.json(sessions);
});

router.get("/sessions/:id", async (req, res) => {
  const { id } = GetSessionParams.parse({ id: Number(req.params.id) });
  const [session] = await db
    .select({
      id: sessionsTable.id,
      conversationId: sessionsTable.conversationId,
      drinkName: sessionsTable.drinkName,
      drinkDescription: sessionsTable.drinkDescription,
      drinkIngredients: sessionsTable.drinkIngredients,
      drinkInstructions: sessionsTable.drinkInstructions,
      drinkEmoji: sessionsTable.drinkEmoji,
      createdAt: sessionsTable.createdAt,
      conversationTitle: conversationsTable.title,
    })
    .from(sessionsTable)
    .innerJoin(conversationsTable, eq(sessionsTable.conversationId, conversationsTable.id))
    .where(eq(sessionsTable.id, id));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json(session);
});

router.delete("/sessions/:id", async (req, res) => {
  const { id } = GetSessionParams.parse({ id: Number(req.params.id) });

  const [existing] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
  res.status(204).end();
});

router.post("/sessions/:id/generate-drink", async (req, res) => {
  const { id } = GenerateDrinkParams.parse({ id: Number(req.params.id) });

  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, session.conversationId))
    .orderBy(asc(messagesTable.createdAt));

  if (messages.length === 0) {
    res.status(400).json({ error: "No messages to generate a drink from" });
    return;
  }

  const conversationSummary = messages
    .map((m) => `${m.role === "assistant" ? "Barty" : "Patron"}: ${m.content}`)
    .join("\n\n");

  const prompt = `You are Barty, a Wild West saloon bartender and therapist. Based on this conversation with a patron, craft a unique non-alcoholic herbal remedy/tonic that serves as both a summary of what the patron is going through AND a prescription for moving forward.

IMPORTANT — Drink Name Consistency: First, read through Barty's messages in the conversation. If Barty already named or described a specific drink or tonic for this patron (e.g., "I'm thinkin' a Dusty Trail Tonic is what you need" or "reckon this calls for a Prairie Calm Elixir"), you MUST use that exact name (or the closest clear name Barty gave). The remedy card must match what Barty already told the patron. If Barty has not named a specific drink yet, invent one now.

The remedy should:
- Have a poetic Wild West / apothecary-style name that metaphorically captures the core of their situation (matching Barty's named drink if one was given)
- Have a description (2-3 sentences) that first reflects back the patron's central struggle or feeling, then proposes a compassionate path forward or insight
- Include 4-7 symbolic "ingredients" — these are NOT literal drink ingredients but poetic metaphors representing emotions, strengths, or things the patron needs (e.g., "A spoonful of self-compassion", "Three deep breaths of open air", "The patience of an old trail horse")
- Have instructions (1-2 sentences in Barty's voice) that describe the *action* or *practice* the patron should take — a real, grounded suggestion for healing or growth
- Have a fitting emoji (prefer herbs, nature, tea, stars, hearts — NO alcohol glasses)
- Contain ZERO alcohol references in any field

Conversation:
${conversationSummary}

Respond ONLY with a JSON object in this exact format (no markdown, no explanation, no surrounding text):
{
  "name": "The Still Water Tonic",
  "description": "This patron has been carrying a heavy load — the kind that builds up quiet-like, till one day it's hard to breathe. The path forward lies not in doing more, but in learning to set it down, piece by piece, and trust that rest is not defeat.",
  "ingredients": ["A long exhale of unspoken worry", "Two cups of honest self-talk", "The warmth of one trusted friend", "A handful of small, kept promises", "Patience steeped overnight"],
  "instructions": "Take one quiet moment each mornin' before the world gets loud. Write down one true thing — not a task, but a feelin'. Let it sit. Then go easy on yourself for the rest of the day.",
  "emoji": "🌿"
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 8192 },
  });

  const raw = response.text ?? "{}";
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let drinkData: {
    name: string;
    description: string;
    ingredients: string[];
    instructions: string;
    emoji: string;
  };

  try {
    drinkData = JSON.parse(cleaned);
  } catch {
    drinkData = {
      name: "The Mystery Brew",
      description: "A drink as complex and mysterious as the evening's conversation. Some tales don't have tidy endings.",
      ingredients: ["2 oz Unnamed Spirits", "1 dash of Uncertainty", "A Squeeze of Whatever Gets You Through"],
      instructions: "Mix with care and drink slowly.",
      emoji: "🍺",
    };
  }

  await db
    .update(sessionsTable)
    .set({
      drinkName: drinkData.name,
      drinkDescription: drinkData.description,
      drinkIngredients: JSON.stringify(drinkData.ingredients),
      drinkInstructions: drinkData.instructions,
      drinkEmoji: drinkData.emoji,
    })
    .where(eq(sessionsTable.id, id));

  res.json(drinkData);
});

export default router;
