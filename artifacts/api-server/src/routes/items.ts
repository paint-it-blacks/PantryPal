import { Router } from "express";
import { db, itemsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateItemBody,
  UpdateItemBody,
  UpdateItemParams,
  DeleteItemParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/items", async (req, res) => {
  try {
    const items = await db
      .select()
      .from(itemsTable)
      .orderBy(desc(itemsTable.updatedAt));
    res.json(
      items.map((item) => ({
        ...item,
        updatedAt: item.updatedAt.toISOString(),
        createdAt: item.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list items");
    res.status(500).json({ error: "Failed to list items" });
  }
});

router.post("/items", async (req, res) => {
  const parsed = CreateItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, quantity = 1, unit = "pcs" } = parsed.data;
  try {
    const [item] = await db
      .insert(itemsTable)
      .values({ name, quantity, unit })
      .returning();
    res.status(201).json({
      ...item,
      updatedAt: item.updatedAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create item");
    res.status(500).json({ error: "Failed to create item" });
  }
});

router.patch("/items/:id", async (req, res) => {
  const paramsParsed = UpdateItemParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid item id" });
    return;
  }
  const bodyParsed = UpdateItemBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }
  const id = paramsParsed.data.id;
  const updates = bodyParsed.data;
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }
  try {
    const [item] = await db
      .update(itemsTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(itemsTable.id, id))
      .returning();
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    res.json({
      ...item,
      updatedAt: item.updatedAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update item");
    res.status(500).json({ error: "Failed to update item" });
  }
});

router.delete("/items/:id", async (req, res) => {
  const paramsParsed = DeleteItemParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid item id" });
    return;
  }
  const id = paramsParsed.data.id;
  try {
    const [deleted] = await db
      .delete(itemsTable)
      .where(eq(itemsTable.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete item");
    res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;
