import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { makeId, type Capture, type CaptureStore } from "./store";

/**
 * LocalCaptureStore — persists capture events to SQLite.
 * Stored in the same DB file as leads for easy cross-table queries.
 */
export class LocalCaptureStore implements CaptureStore {
  readonly name = "local-capture";
  private db: Database.Database;

  constructor(dbPath = process.env.LEADS_DB_PATH || "data/leads.db") {
    const dir = dirname(dbPath);
    if (dir && dir !== "." && !existsSync(dir)) mkdirSync(dir, { recursive: true });
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS captures (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        event TEXT NOT NULL,
        zip TEXT,
        served INTEGER NOT NULL,
        page_variant TEXT,
        referrer TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        utm_content TEXT,
        utm_term TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_captures_session ON captures(session_id);
      CREATE INDEX IF NOT EXISTS idx_captures_created ON captures(created_at);
    `);
  }

  async record(c: Capture): Promise<{ id: string }> {
    const id = c.id || makeId();
    this.db
      .prepare(
        `INSERT INTO captures (id, session_id, event, zip, served,
          page_variant, referrer,
          utm_source, utm_medium, utm_campaign, utm_content, utm_term,
          created_at)
         VALUES (@id, @session_id, @event, @zip, @served,
          @page_variant, @referrer,
          @utm_source, @utm_medium, @utm_campaign, @utm_content, @utm_term,
          @created_at)`,
      )
      .run({
        id,
        session_id: c.sessionId,
        event: c.event,
        zip: c.zip,
        served: c.served ? 1 : 0,
        page_variant: c.pageVariant,
        referrer: c.referrer,
        utm_source: c.utmSource,
        utm_medium: c.utmMedium,
        utm_campaign: c.utmCampaign,
        utm_content: c.utmContent,
        utm_term: c.utmTerm,
        created_at: c.createdAt,
      });
    return { id };
  }

  async latestZipForSession(sessionId: string): Promise<string | null> {
    const row = this.db
      .prepare(
        `SELECT zip FROM captures
         WHERE session_id = ? AND zip IS NOT NULL
         ORDER BY created_at DESC
         LIMIT 1`,
      )
      .get(sessionId) as { zip: string } | undefined;
    return row?.zip ?? null;
  }
}
