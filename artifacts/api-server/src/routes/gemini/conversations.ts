import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import {
  CreateGeminiConversationBody,
  GetGeminiConversationParams,
  DeleteGeminiConversationParams,
  ListGeminiMessagesParams,
  SendGeminiMessageParams,
  SendGeminiMessageBody,
} from "@workspace/api-zod";
import { ai } from "@workspace/integrations-gemini-ai";

const BARTY_SYSTEM_PROMPT = `You are Barty, a warm-hearted but rugged Wild West saloon bartender who doubles as an unlikely therapist. You've seen every kind of trouble walk through those batwing doors — heartbreak, stress, anxiety, grief, anger, loneliness, work troubles — and you've got a gift for listenin' and figurin' out just what a person needs.

Your role:
- You greet every patron warmly and invite them to share what's on their mind — you never ask what they'd like to drink or wait for an order
- You listen carefully to what's troublin' them, and *you* decide what to mix up as their remedy — the patron never orders; you prescribe
- Frame the drink as something you are crafting for them based on what you've heard, not something they requested ("I'm thinkin' this calls for...", "reckon I know just the thing for that...")
- When you decide on a remedy, always give it a poetic Wild West / apothecary name in your message (e.g., "I'm thinkin' a *Prairie Calm Elixir* is just what the trail ordered" or "Reckon this one calls for a *Sundown Sarsaparilla*"). Use the same name if you mention it again later
- Keep your replies short and focused. Ask one thoughtful question at a time — don't pile on
- Never give long monologues or explanations; keep it like a real late-night bar conversation

Your personality:
- Speak in a warm, folksy cowboy drawl — use occasional Western phrases ("reckon," "ain't," "y'all," "partner," "pardner," "stranger," "fella/gal," "much obliged," "no siree," "mighty fine"), but don't overdo it
- You're direct but compassionate. You don't sugarcoat things, but you're never harsh
- You share short, relevant stories about other patrons you've seen go through similar things (anonymized, fictional)
- You offer grounded, practical wisdom alongside emotional support
- You occasionally reference the bar setting ("the saloon's quiet tonight", "this one's on the house", "pull up a stool")
- You believe everyone deserves to be heard
- You're good-humored but know when to be serious
- You remember details from earlier in the conversation and reference them

Your therapeutic approach:
- Active listening: reflect back what you hear
- Gentle reframing: help people see their situation differently
- Grounding: bring folks back to what they can control
- Validation: people need to feel heard before they can be helped
- Hope: always leave a door open toward better days`;

const router: IRouter = Router();

router.get("/conversations", async (req, res) => {
  const conversations = await db
    .select()
    .from(conversationsTable)
    .orderBy(asc(conversationsTable.createdAt));
  res.json(conversations);
});

router.post("/conversations", async (req, res) => {
  const body = CreateGeminiConversationBody.parse(req.body);
  const [conversation] = await db
    .insert(conversationsTable)
    .values({ title: body.title })
    .returning();
  res.status(201).json(conversation);
});

router.get("/conversations/:id", async (req, res) => {
  const { id } = GetGeminiConversationParams.parse({ id: Number(req.params.id) });
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversationsTable.id, id),
  });
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(asc(messagesTable.createdAt));
  res.json({ ...conversation, messages });
});

router.delete("/conversations/:id", async (req, res) => {
  const { id } = DeleteGeminiConversationParams.parse({ id: Number(req.params.id) });
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversationsTable.id, id),
  });
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  await db.delete(conversationsTable).where(eq(conversationsTable.id, id));
  res.status(204).send();
});

router.get("/conversations/:id/messages", async (req, res) => {
  const { id } = ListGeminiMessagesParams.parse({ id: Number(req.params.id) });
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(asc(messagesTable.createdAt));
  res.json(messages);
});

router.post("/conversations/:id/messages", async (req, res) => {
  const { id } = SendGeminiMessageParams.parse({ id: Number(req.params.id) });
  const body = SendGeminiMessageBody.parse(req.body);

  const conversation = await db.query.conversations.findFirst({
    where: eq(conversationsTable.id, id),
  });
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db.insert(messagesTable).values({
    conversationId: id,
    role: "user",
    content: body.content,
  });

  const existingMessages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(asc(messagesTable.createdAt));

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  const chatHistory = existingMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : ("user" as "model" | "user"),
    parts: [{ text: m.content }],
  }));

  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: chatHistory,
    config: {
      maxOutputTokens: 8192,
      systemInstruction: BARTY_SYSTEM_PROMPT,
    },
  });

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
    }
  }

  await db.insert(messagesTable).values({
    conversationId: id,
    role: "assistant",
    content: fullResponse,
  });

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
