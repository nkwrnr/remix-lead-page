import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { Lead } from "../types";
import { makeId, type LeadStore } from "./store";

/**
 * LocalStore — persists leads to a SQLite file. Zero external accounts.
 * This is the default dev backend and the local audit copy in production-style runs.
 */
export class LocalStore implements LeadStore {
  readonly name = "local";
  private db: Database.Database;

  constructor(dbPath = process.env.LEADS_DB_PATH || "data/leads.db") {
    const dir = dirname(dbPath);
    if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        zip TEXT,
        served INTEGER NOT NULL,
        matched_store TEXT,
        product_interest TEXT,
        utm_source TEXT, utm_medium TEXT, utm_campaign TEXT,
        utm_content TEXT, utm_term TEXT,
        consent INTEGER NOT NULL,
        consent_version TEXT,
        referrer TEXT,
        page_variant TEXT,
        created_at TEXT NOT NULL,
        session_id TEXT,
        captured_zip TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_leads_zip ON leads(zip);
      CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
    `);
    // Idempotent migrations for existing DB files that pre-date these columns.
    for (const col of [
      "ALTER TABLE leads ADD COLUMN session_id TEXT",
      "ALTER TABLE leads ADD COLUMN captured_zip TEXT",
    ]) {
      try {
        this.db.exec(col);
      } catch {
        // Column already exists — safe to ignore.
      }
    }
  }

  async save(lead: Lead): Promise<{ id: string }> {
    const id = lead.id || makeId();
    this.db
      .prepare(
        `INSERT INTO leads (id, email, zip, served, matched_store, product_interest,
          utm_source, utm_medium, utm_campaign, utm_content, utm_term,
          consent, consent_version, referrer, page_variant, created_at,
          session_id, captured_zip)
         VALUES (@id, @email, @zip, @served, @matched_store, @product_interest,
          @utm_source, @utm_medium, @utm_campaign, @utm_content, @utm_term,
          @consent, @consent_version, @referrer, @page_variant, @created_at,
          @session_id, @captured_zip)`,
      )
      .run({
        id,
        email: lead.email,
        zip: lead.zip,
        served: lead.served ? 1 : 0,
        matched_store: lead.matchedStore,
        product_interest: lead.productInterest,
        utm_source: lead.utmSource,
        utm_medium: lead.utmMedium,
        utm_campaign: lead.utmCampaign,
        utm_content: lead.utmContent,
        utm_term: lead.utmTerm,
        consent: lead.consent ? 1 : 0,
        consent_version: lead.consentVersion,
        referrer: lead.referrer,
        page_variant: lead.pageVariant,
        created_at: lead.createdAt,
        session_id: lead.sessionId,
        captured_zip: lead.capturedZip,
      });
    return { id };
  }

  async list(): Promise<Lead[]> {
    const rows = this.db
      .prepare(`SELECT * FROM leads ORDER BY created_at DESC`)
      .all() as Record<string, unknown>[];
    return rows.map(rowToLead);
  }
}

function rowToLead(r: Record<string, unknown>): Lead {
  return {
    id: r.id as string,
    email: r.email as string,
    zip: (r.zip as string) ?? null,
    served: !!r.served,
    matchedStore: (r.matched_store as string) ?? null,
    productInterest: (r.product_interest as string) ?? "unset",
    utmSource: (r.utm_source as string) ?? null,
    utmMedium: (r.utm_medium as string) ?? null,
    utmCampaign: (r.utm_campaign as string) ?? null,
    utmContent: (r.utm_content as string) ?? null,
    utmTerm: (r.utm_term as string) ?? null,
    consent: !!r.consent,
    consentVersion: (r.consent_version as string) ?? "",
    referrer: (r.referrer as string) ?? null,
    pageVariant: (r.page_variant as string) ?? null,
    createdAt: r.created_at as string,
    sessionId: (r.session_id as string) ?? null,
    capturedZip: (r.captured_zip as string) ?? null,
  };
}
