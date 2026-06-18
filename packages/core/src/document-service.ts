import { v4 as uuidv4 } from "uuid";
import type {
  Document,
  DocumentSummary,
  CreateDocumentInput,
  AppendContentInput,
  EditContentInput,
  FormatDocumentInput,
  DocumentSection,
} from "./types.js";
import type { IStorage } from "./storage/storage.interface.js";
import { DocumentNotFoundError, SectionNotFoundError } from "./errors.js";

export class DocumentService {
  constructor(private storage: IStorage) {}

  async createDocument(input: CreateDocumentInput): Promise<string> {
    const now = new Date().toISOString();
    const doc: Document = {
      id: uuidv4(),
      title: input.title,
      format: input.format,
      sections: [],
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    await this.storage.createDocument(doc);
    return doc.id;
  }

  async appendContent(input: AppendContentInput): Promise<DocumentSection> {
    const doc = await this.getDocumentOrThrow(input.documentId);
    const section: DocumentSection = {
      id: uuidv4(),
      title: input.section,
      content: input.content,
      order: doc.sections.length,
    };
    doc.sections.push(section);
    doc.updatedAt = new Date().toISOString();
    doc.version++;
    await this.storage.updateDocument(doc.id, doc);
    return section;
  }

  async editContent(input: EditContentInput): Promise<void> {
    const doc = await this.getDocumentOrThrow(input.documentId);
    const section = doc.sections.find((s) => s.id === input.sectionId);
    if (!section) {
      throw new SectionNotFoundError(input.sectionId, input.documentId);
    }
    section.content = input.newContent;
    doc.updatedAt = new Date().toISOString();
    doc.version++;
    await this.storage.updateDocument(doc.id, doc);
  }

  async formatDocument(input: FormatDocumentInput): Promise<Document> {
    const doc = await this.getDocumentOrThrow(input.documentId);
    doc.style = input.style;
    doc.updatedAt = new Date().toISOString();
    doc.version++;
    await this.storage.updateDocument(doc.id, doc);
    return doc;
  }

  async getDocument(id: string): Promise<Document> {
    return this.getDocumentOrThrow(id);
  }

  async listDocuments(userId?: string): Promise<DocumentSummary[]> {
    return this.storage.listDocuments(userId);
  }

  async deleteDocument(id: string): Promise<void> {
    await this.getDocumentOrThrow(id);
    await this.storage.deleteDocument(id);
  }

  async renderDocumentContent(id: string): Promise<string> {
    const doc = await this.getDocumentOrThrow(id);
    const parts: string[] = [];

    if (doc.format === "markdown") {
      parts.push(`# ${doc.title}\n`);
      for (const section of doc.sections) {
        parts.push(`## ${section.title}\n`);
        parts.push(section.content);
        parts.push("");
      }
    } else if (doc.format === "latex") {
      parts.push(`\\documentclass{article}`);
      parts.push(`\\title{${doc.title}}`);
      parts.push(`\\begin{document}`);
      parts.push(`\\maketitle`);
      for (const section of doc.sections) {
        parts.push(`\\section{${section.title}}`);
        parts.push(section.content);
        parts.push("");
      }
      parts.push(`\\end{document}`);
    } else {
      parts.push(doc.title);
      parts.push("=".repeat(doc.title.length));
      parts.push("");
      for (const section of doc.sections) {
        parts.push(section.title);
        parts.push("-".repeat(section.title.length));
        parts.push(section.content);
        parts.push("");
      }
    }

    return parts.join("\n");
  }

  private async getDocumentOrThrow(id: string): Promise<Document> {
    const doc = await this.storage.getDocument(id);
    if (!doc) throw new DocumentNotFoundError(id);
    return doc;
  }
}
