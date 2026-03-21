import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sessionsTable, conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import { GetSessionParams, GenerateDrinkParams } from "@workspace/api-zod";
import { ai } from "@workspace/integrations-gemini-ai";

const router: IRouter = Router();

router.post("/sessions", async (req, res) => {
  const body = req.body as { conversationId: number };
  const conversation = await db.query.conversationsTable.findFirst({
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

  const prompt = `You are Barty, a Wild West saloon bartender and therapist. Based on this conversation with a patron, create a unique custom cocktail/mocktail that reflects their mood, problems, and the emotional journey of the conversation.

The drink should:
- Have a creative Wild West / cowboy themed name that metaphorically relates to their situation
- Have a short poetic description (2-3 sentences) that ties to their emotional experience
- Include 4-7 ingredients (can be real or whimsically/poetically named)
- Have brief, flavorful instructions (1-2 sentences in Barty's voice)
- Have a fitting emoji

Conversation:
${conversationSummary}

Respond ONLY with a JSON object in this exact format (no markdown, no explanation, no surrounding text):
{
  "name": "The Dusty Trail Heartbreak",
  "description": "A bittersweet blend for those who've ridden hard and far...",
  "ingredients": ["2 oz Smoky Whiskey", "1 oz Honey Syrup", "Fresh Sage Tears", "A Pinch of Resilience"],
  "instructions": "Combine over ice, stir gently like a slow sunset, and sip while watchin' the horizon.",
  "emoji": "🥃"
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
