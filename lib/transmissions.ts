import fs from "node:fs";
import path from "node:path";

export interface Transmission {
  id: string;
  timestamp: string;
  content: string;
  tag?: string;
}

const FILE_PATH = path.join(process.cwd(), "content", "transmissions.json");

export function getTransmissions(): Transmission[] {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Failed to read transmissions:", error);
    return [];
  }
}

export function saveTransmission(content: string, tag: string = "LOG"): Transmission {
  const list = getTransmissions();
  const newTx: Transmission = {
    id: `tx-${Date.now()}`,
    timestamp: new Date().toISOString(),
    content: content.trim(),
    tag: tag.trim() || "LOG",
  };

  const updated = [newTx, ...list];
  fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2), "utf8");
  return newTx;
}

export function deleteTransmission(id: string): boolean {
  const list = getTransmissions();
  const filtered = list.filter((tx) => tx.id !== id);
  if (filtered.length === list.length) {
    return false;
  }
  fs.writeFileSync(FILE_PATH, JSON.stringify(filtered, null, 2), "utf8");
  return true;
}
