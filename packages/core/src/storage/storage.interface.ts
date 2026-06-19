import type { Document, DocumentSummary, SearchResult } from "../types.js";
import type { Citation } from "../citation-manager.js";

export interface IStorage {
  createDocument(doc: Document): Promise<string>;
  getDocument(id: string): Promise<Document | null>;
  updateDocument(id: string, doc: Document): Promise<void>;
  listDocuments(userId?: string): Promise<DocumentSummary[]>;
  deleteDocument(id: string): Promise<void>;
  saveVersion(documentId: string, version: number, snapshot: Document): Promise<void>;
  getVersions(documentId: string): Promise<Array<{ id: string; version: number; created_at: string }>>;
  getVersion(documentId: string, version: number): Promise<Document | null>;
  searchDocuments(query: string, limit?: number): Promise<SearchResult[]>;
  
  // Citations
  addCitation(citation: Citation): Promise<Citation>;
  getCitations(documentId: string): Promise<Citation[]>;
  removeCitation(documentId: string, citationId: string): Promise<void>;
}
