import { v4 as uuidv4 } from "uuid";
import type {
  Document,
  DocumentSummary,
  CreateDocumentInput,
  AppendContentInput,
  EditContentInput,
  FormatDocumentInput,
  DocumentSection,
  SearchResult,
} from "./types.js";
import type { IStorage } from "./storage/storage.interface.js";
import { DocumentNotFoundError, SectionNotFoundError } from "./errors.js";
import { citationManager } from "./citation-manager.js";

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
    await this.storage.saveVersion(doc.id, doc.version, doc);
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
    await this.storage.saveVersion(doc.id, doc.version, doc);
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
    await this.storage.saveVersion(doc.id, doc.version, doc);
  }

  async formatDocument(input: FormatDocumentInput): Promise<Document> {
    const doc = await this.getDocumentOrThrow(input.documentId);
    doc.style = input.style;
    doc.updatedAt = new Date().toISOString();
    doc.version++;
    await this.storage.updateDocument(doc.id, doc);
    await this.storage.saveVersion(doc.id, doc.version, doc);
    return doc;
  }

  async getDocument(id: string): Promise<Document> {
    return this.getDocumentOrThrow(id);
  }

  async listDocuments(userId?: string): Promise<DocumentSummary[]> {
    return this.storage.listDocuments(userId);
  }

  async generateToc(id: string): Promise<string> {
    const doc = await this.getDocumentOrThrow(id);
    const tocParts: string[] = [];
    doc.sections.forEach((section, index) => {
      tocParts.push(`${index + 1}. ${section.title}`);
    });
    return tocParts.join("\\n");
  }

  async searchDocuments(query: string, limit?: number): Promise<SearchResult[]> {
    return this.storage.searchDocuments(query, limit);
  }

  async getDocumentHistory(id: string): Promise<Array<{ id: string; version: number; created_at: string }>> {
    return this.storage.getVersions(id);
  }

  async restoreVersion(id: string, version: number): Promise<Document> {
    const snapshot = await this.storage.getVersion(id, version);
    if (!snapshot) throw new Error(`Version ${version} not found for document ${id}`);
    
    const currentDoc = await this.getDocumentOrThrow(id);
    snapshot.version = currentDoc.version + 1;
    snapshot.updatedAt = new Date().toISOString();
    
    await this.storage.updateDocument(id, snapshot);
    await this.storage.saveVersion(id, snapshot.version, snapshot);
    return snapshot;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.getDocumentOrThrow(id);
    await this.storage.deleteDocument(id);
  }

  async renderDocumentContent(id: string): Promise<string> {
    const doc = await this.getDocumentOrThrow(id);
    const parts: string[] = [];

    const citationMap = new Map<string, number>();
    const orderedCitations: string[] = [];
    let figCount = 1;
    let tableCount = 1;

    const processContent = (content: string) => {
      let processed = content;
      // Resolve citations [cite:UUID]
      processed = processed.replace(/\[cite:([a-zA-Z0-9-]+)\]/g, (match, citationId) => {
        if (!citationMap.has(citationId)) {
          citationMap.set(citationId, citationMap.size + 1);
          orderedCitations.push(citationId);
        }
        return `[${citationMap.get(citationId)}]`;
      });
      // Resolve figure captions [figcap:Caption]
      processed = processed.replace(/\[figcap:(.*?)\]/g, (match, caption) => {
        return `<div class="diagram-caption">Fig. ${figCount++}. ${caption}</div>`;
      });
      // Resolve table captions [tabcap:Caption]
      processed = processed.replace(/\[tabcap:(.*?)\]/g, (match, caption) => {
        const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][tableCount - 1] || tableCount.toString();
        tableCount++;
        return `<div class="table-caption">TABLE ${roman}. ${caption}</div>`;
      });
      return processed;
    };

    if (doc.format === "markdown") {
      parts.push(`# ${doc.title}\n`);
      for (const section of doc.sections) {
        if (doc.style === "ieee" && section.title.toLowerCase() === "abstract") {
          parts.push(`<div class="abstract">`);
          parts.push(processContent(section.content));
          parts.push(`</div>`);
        } else {
          parts.push(`## ${section.title}\n`);
          parts.push(processContent(section.content));
        }
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
        parts.push(processContent(section.content));
        parts.push("");
      }
    }

    if (orderedCitations.length > 0 && doc.style === "ieee") {
      const allCitations = await citationManager.getCitations(id);
      parts.push(`<div class="references">`);
      parts.push(`## References\n`);
      for (const cid of orderedCitations) {
        const citation = allCitations.find(c => c.id === cid);
        if (citation) {
          const num = citationMap.get(cid);
          parts.push(`<p>[${num}] ${citationManager.formatCitation(citation, "ieee")}</p>`);
        }
      }
      parts.push(`</div>`);
    }

    return parts.join("\n");
  }

  private async getDocumentOrThrow(id: string): Promise<Document> {
    const doc = await this.storage.getDocument(id);
    if (!doc) throw new DocumentNotFoundError(id);
    return doc;
  }
}
