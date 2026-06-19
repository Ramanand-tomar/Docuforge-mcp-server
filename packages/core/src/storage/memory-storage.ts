import type { Document, DocumentSummary, SearchResult } from "../types.js";
import type { IStorage } from "./storage.interface.js";
import type { Citation } from "../citation-manager.js";

export class MemoryStorage implements IStorage {
  private documents = new Map<string, Document>();
  private versions = new Map<string, Array<{ id: string; document_id: string; version: number; snapshot: Document; created_at: string }>>();
  private citations = new Map<string, Citation[]>();

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
    this.versions.delete(id);
  }

  async saveVersion(documentId: string, version: number, snapshot: Document): Promise<void> {
    if (!this.versions.has(documentId)) {
      this.versions.set(documentId, []);
    }
    const { v4: uuidv4 } = await import("uuid");
    this.versions.get(documentId)!.push({
      id: uuidv4(),
      document_id: documentId,
      version,
      snapshot: structuredClone(snapshot),
      created_at: new Date().toISOString()
    });
  }

  async getVersions(documentId: string): Promise<Array<{ id: string; version: number; created_at: string }>> {
    const versions = this.versions.get(documentId) || [];
    return versions.map(v => ({ id: v.id, version: v.version, created_at: v.created_at })).reverse();
  }

  async getVersion(documentId: string, version: number): Promise<Document | null> {
    const versions = this.versions.get(documentId) || [];
    const v = versions.find(v => v.version === version);
    return v ? structuredClone(v.snapshot) : null;
  }

  async searchDocuments(query: string, limit: number = 10): Promise<SearchResult[]> {
    const q = query.toLowerCase();
    const results: SearchResult[] = [];
    
    for (const doc of this.documents.values()) {
      for (const section of doc.sections) {
        if (section.title.toLowerCase().includes(q) || section.content.toLowerCase().includes(q)) {
          const matchIndex = section.content.toLowerCase().indexOf(q);
          const snippetStart = Math.max(0, matchIndex - 30);
          const snippet = section.content.substring(snippetStart, snippetStart + 100) + "...";
          
          results.push({
            documentId: doc.id,
            sectionId: section.id,
            sectionTitle: section.title,
            snippet,
            rank: 0
          });
        }
      }
    }
    
    
    return results.slice(0, limit);
  }

  async addCitation(citation: Citation): Promise<Citation> {
    const docCitations = this.citations.get(citation.documentId) || [];
    docCitations.push(structuredClone(citation));
    this.citations.set(citation.documentId, docCitations);
    return citation;
  }

  async getCitations(documentId: string): Promise<Citation[]> {
    const citations = this.citations.get(documentId) || [];
    return citations.map(c => structuredClone(c));
  }

  async removeCitation(documentId: string, citationId: string): Promise<void> {
    const docCitations = this.citations.get(documentId) || [];
    this.citations.set(
      documentId,
      docCitations.filter(c => c.id !== citationId)
    );
  }
}
