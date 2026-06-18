import type { Document, DocumentSummary } from "../types.js";

export interface IStorage {
  createDocument(doc: Document): Promise<string>;
  getDocument(id: string): Promise<Document | null>;
  updateDocument(id: string, doc: Document): Promise<void>;
  listDocuments(userId?: string): Promise<DocumentSummary[]>;
  deleteDocument(id: string): Promise<void>;
}
