import Database from "better-sqlite3";
import type { Document, DocumentSection, DocumentSummary } from "../types.js";
import type { IStorage } from "./storage.interface.js";

export class SqliteStorage implements IStorage {
  private db: Database.Database;

  constructor(dbPath: string = "./data/docuforge.db") {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.initTables();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        format TEXT NOT NULL CHECK(format IN ('markdown', 'latex', 'plain')),
        style TEXT CHECK(style IN ('academic', 'resume', 'report', 'blog', NULL)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        user_id TEXT,
        version INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS sections (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        order_num INTEGER NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_sections_doc ON sections(document_id);
      CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
    `);
  }

  async createDocument(doc: Document): Promise<string> {
    const insertDoc = this.db.prepare(`
      INSERT INTO documents (id, title, format, style, created_at, updated_at, user_id, version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertSection = this.db.prepare(`
      INSERT INTO sections (id, document_id, title, content, order_num)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction(() => {
      insertDoc.run(
        doc.id,
        doc.title,
        doc.format,
        doc.style ?? null,
        doc.createdAt,
        doc.updatedAt,
        doc.userId ?? null,
        doc.version,
      );
      for (const section of doc.sections) {
        insertSection.run(
          section.id,
          doc.id,
          section.title,
          section.content,
          section.order,
        );
      }
    });
    transaction();
    return doc.id;
  }

  async getDocument(id: string): Promise<Document | null> {
    const row = this.db
      .prepare("SELECT * FROM documents WHERE id = ?")
      .get(id) as DocumentRow | undefined;
    if (!row) return null;

    const sections = this.db
      .prepare(
        "SELECT * FROM sections WHERE document_id = ? ORDER BY order_num",
      )
      .all(id) as SectionRow[];

    return this.rowToDocument(row, sections);
  }

  async updateDocument(id: string, doc: Document): Promise<void> {
    const updateDoc = this.db.prepare(`
      UPDATE documents SET title = ?, format = ?, style = ?, updated_at = ?, version = ?
      WHERE id = ?
    `);
    const deleteSections = this.db.prepare(
      "DELETE FROM sections WHERE document_id = ?",
    );
    const insertSection = this.db.prepare(`
      INSERT INTO sections (id, document_id, title, content, order_num)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction(() => {
      updateDoc.run(
        doc.title,
        doc.format,
        doc.style ?? null,
        doc.updatedAt,
        doc.version,
        id,
      );
      deleteSections.run(id);
      for (const section of doc.sections) {
        insertSection.run(
          section.id,
          id,
          section.title,
          section.content,
          section.order,
        );
      }
    });
    transaction();
  }

  async listDocuments(userId?: string): Promise<DocumentSummary[]> {
    let rows: DocumentRow[];
    if (userId) {
      rows = this.db
        .prepare("SELECT * FROM documents WHERE user_id = ? ORDER BY updated_at DESC")
        .all(userId) as DocumentRow[];
    } else {
      rows = this.db
        .prepare("SELECT * FROM documents ORDER BY updated_at DESC")
        .all() as DocumentRow[];
    }

    const countStmt = this.db.prepare(
      "SELECT COUNT(*) as cnt FROM sections WHERE document_id = ?",
    );

    return rows.map((row) => {
      const countRow = countStmt.get(row.id) as { cnt: number };
      return {
        id: row.id,
        title: row.title,
        format: row.format as Document["format"],
        style: (row.style as Document["style"]) ?? undefined,
        sectionCount: countRow.cnt,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });
  }

  async deleteDocument(id: string): Promise<void> {
    this.db.prepare("DELETE FROM documents WHERE id = ?").run(id);
  }

  close() {
    this.db.close();
  }

  private rowToDocument(
    row: DocumentRow,
    sectionRows: SectionRow[],
  ): Document {
    return {
      id: row.id,
      title: row.title,
      format: row.format as Document["format"],
      style: (row.style as Document["style"]) ?? undefined,
      sections: sectionRows.map((s) => ({
        id: s.id,
        title: s.title,
        content: s.content,
        order: s.order_num,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id ?? undefined,
      version: row.version,
    };
  }
}

interface DocumentRow {
  id: string;
  title: string;
  format: string;
  style: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  version: number;
}

interface SectionRow {
  id: string;
  document_id: string;
  title: string;
  content: string;
  order_num: number;
}
