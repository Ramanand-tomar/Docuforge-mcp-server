import type { Document, DocumentSummary } from "../types.js";
import type { IStorage } from "./storage.interface.js";

export class MemoryStorage implements IStorage {
  private documents = new Map<string, Document>();

  async createDocument(doc: Document): Promise<string> {
    this.documents.set(doc.id, structuredClone(doc));
    return doc.id;
  }

  async getDocument(id: string): Promise<Document | null> {
    const doc = this.documents.get(id);
    return doc ? structuredClone(doc) : null;
  }

  async updateDocument(id: string, doc: Document): Promise<void> {
    this.documents.set(id, structuredClone(doc));
  }

  async listDocuments(userId?: string): Promise<DocumentSummary[]> {
    const docs = Array.from(this.documents.values());
    const filtered = userId ? docs.filter((d) => d.userId === userId) : docs;
    return filtered.map((d) => ({
      id: d.id,
      title: d.title,
      format: d.format,
      style: d.style,
      sectionCount: d.sections.length,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
  }
}
