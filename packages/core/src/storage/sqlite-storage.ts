import Database from "better-sqlite3";
import type { Document, DocumentSection, DocumentSummary, SearchResult } from "../types.js";
import type { IStorage } from "./storage.interface.js";
import type { Citation } from "../citation-manager.js";

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
      PRAGMA foreign_keys=off;
      CREATE TABLE IF NOT EXISTS documents_new (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        format TEXT NOT NULL CHECK(format IN ('markdown', 'latex', 'plain')),
        style TEXT CHECK(style IN ('academic', 'resume', 'report', 'blog', 'research', 'ieee', NULL)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        user_id TEXT,
        version INTEGER NOT NULL DEFAULT 1
      );
      INSERT OR IGNORE INTO documents_new SELECT * FROM documents;
      DROP TABLE documents;
      ALTER TABLE documents_new RENAME TO documents;
      PRAGMA foreign_keys=on;

      CREATE TABLE IF NOT EXISTS citations (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        type TEXT NOT NULL,
        authors TEXT NOT NULL,
        title TEXT NOT NULL,
        year INTEGER NOT NULL,
        journal TEXT,
        volume TEXT,
        issue TEXT,
        pages TEXT,
        publisher TEXT,
        doi TEXT,
        url TEXT,
        accessDate TEXT,
        conference TEXT,
        institution TEXT,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_citations_doc ON citations(document_id);

      CREATE TABLE IF NOT EXISTS sections (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        order_num INTEGER NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS document_versions (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        snapshot TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      );

      CREATE VIRTUAL TABLE IF NOT EXISTS sections_fts USING fts5(
        document_id UNINDEXED,
        section_id UNINDEXED,
        title,
        content
      );

      CREATE INDEX IF NOT EXISTS idx_sections_doc ON sections(document_id);
      CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
      CREATE INDEX IF NOT EXISTS idx_document_versions_doc ON document_versions(document_id);
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
        this.db.prepare(`
          INSERT INTO sections_fts (document_id, section_id, title, content)
          VALUES (?, ?, ?, ?)
        `).run(doc.id, section.id, section.title, section.content);
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
      this.db.prepare("DELETE FROM sections_fts WHERE document_id = ?").run(id);
      for (const section of doc.sections) {
        insertSection.run(
          section.id,
          id,
          section.title,
          section.content,
          section.order,
        );
        this.db.prepare(`
          INSERT INTO sections_fts (document_id, section_id, title, content)
          VALUES (?, ?, ?, ?)
        `).run(id, section.id, section.title, section.content);
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
    const transaction = this.db.transaction(() => {
      this.db.prepare("DELETE FROM documents WHERE id = ?").run(id);
      this.db.prepare("DELETE FROM sections_fts WHERE document_id = ?").run(id);
    });
    transaction();
  }

  close() {
    this.db.close();
  }

  async saveVersion(documentId: string, version: number, snapshot: Document): Promise<void> {
    const insertVersion = this.db.prepare(`
      INSERT INTO document_versions (id, document_id, version, snapshot, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const { v4: uuidv4 } = await import("uuid");
    insertVersion.run(
      uuidv4(),
      documentId,
      version,
      JSON.stringify(snapshot),
      new Date().toISOString()
    );
  }

  async getVersions(documentId: string): Promise<Array<{ id: string; version: number; created_at: string }>> {
    const rows = this.db.prepare(`
      SELECT id, version, created_at FROM document_versions
      WHERE document_id = ? ORDER BY version DESC
    `).all(documentId) as any[];
    return rows;
  }

  async getVersion(documentId: string, version: number): Promise<Document | null> {
    const row = this.db.prepare(`
      SELECT snapshot FROM document_versions
      WHERE document_id = ? AND version = ?
    `).get(documentId, version) as any;
    if (!row) return null;
    return JSON.parse(row.snapshot);
  }

  async searchDocuments(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      const rows = this.db.prepare(`
        SELECT 
          document_id, 
          section_id, 
          title, 
          snippet(sections_fts, 3, '<b>', '</b>', '...', 64) as snippet,
          rank 
        FROM sections_fts 
        WHERE sections_fts MATCH ? 
        ORDER BY rank 
        LIMIT ?
      `).all(query, limit) as any[];

      return rows.map(r => ({
        documentId: r.document_id,
        sectionId: r.section_id,
        sectionTitle: r.title,
        snippet: r.snippet,
        rank: r.rank
      }));
    } catch (err) {
      return [];
    }
  }

  async addCitation(citation: Citation): Promise<Citation> {
    const insert = this.db.prepare(`
      INSERT INTO citations (
        id, document_id, type, authors, title, year, journal, volume, issue, pages,
        publisher, doi, url, accessDate, conference, institution
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      citation.id, citation.documentId, citation.type, JSON.stringify(citation.authors),
      citation.title, citation.year, citation.journal ?? null, citation.volume ?? null,
      citation.issue ?? null, citation.pages ?? null, citation.publisher ?? null,
      citation.doi ?? null, citation.url ?? null, citation.accessDate ?? null,
      citation.conference ?? null, citation.institution ?? null
    );
    return citation;
  }

  async getCitations(documentId: string): Promise<Citation[]> {
    const rows = this.db.prepare("SELECT * FROM citations WHERE document_id = ?").all(documentId) as any[];
    return rows.map(r => ({
      id: r.id,
      documentId: r.document_id,
      type: r.type as Citation["type"],
      authors: JSON.parse(r.authors),
      title: r.title,
      year: r.year,
      journal: r.journal ?? undefined,
      volume: r.volume ?? undefined,
      issue: r.issue ?? undefined,
      pages: r.pages ?? undefined,
      publisher: r.publisher ?? undefined,
      doi: r.doi ?? undefined,
      url: r.url ?? undefined,
      accessDate: r.accessDate ?? undefined,
      conference: r.conference ?? undefined,
      institution: r.institution ?? undefined,
    }));
  }

  async removeCitation(documentId: string, citationId: string): Promise<void> {
    this.db.prepare("DELETE FROM citations WHERE document_id = ? AND id = ?").run(documentId, citationId);
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
