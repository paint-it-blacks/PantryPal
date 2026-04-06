import { pgTable, serial, text, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const itemsTable = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: doublePrecision("quantity").notNull().default(1),
  unit: text("unit").notNull().default("pcs"),
  location: text("location").notNull().default("Pantry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertItemSchema = createInsertSchema(itemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof itemsTable.$inferSelect;
