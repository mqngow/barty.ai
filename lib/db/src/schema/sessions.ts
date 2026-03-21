import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  drinkName: text("drink_name"),
  drinkDescription: text("drink_description"),
  drinkIngredients: text("drink_ingredients"),
  drinkInstructions: text("drink_instructions"),
  drinkEmoji: text("drink_emoji"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, createdAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
