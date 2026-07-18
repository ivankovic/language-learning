import { db } from "../index";
import type { CardState } from "../../types/user";

export function getCardState(itemId: string): Promise<CardState | undefined> {
  return db.cardStates.get(itemId);
}

export function getCardStatesByLang(lang: string): Promise<CardState[]> {
  return db.cardStates.where("lang").equals(lang).toArray();
}

export async function getDueCardStates(lang: string, now = new Date()): Promise<CardState[]> {
  const nowIso = now.toISOString();
  const all = await db.cardStates
    .where("lang")
    .equals(lang)
    .filter((c) => c.state !== "new" && c.due <= nowIso)
    .toArray();
  return all.sort((a, b) => a.due.localeCompare(b.due));
}

export async function getTrackedItemIds(lang: string): Promise<Set<string>> {
  const rows = await db.cardStates.where("lang").equals(lang).primaryKeys();
  return new Set(rows);
}

export async function upsertCardState(card: CardState): Promise<void> {
  await db.cardStates.put(card);
}
