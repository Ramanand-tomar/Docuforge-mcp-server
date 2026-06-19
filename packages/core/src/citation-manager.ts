import { randomUUID } from "crypto";
import type { IStorage } from "./storage/storage.interface.js";

export type CitationStyle = "apa" | "mla" | "ieee" | "chicago" | "harvard";

export interface Citation {
  id: string;           // UUID
  documentId: string;
  type: "journal" | "book" | "conference" | "website" | "thesis" | "report";
  authors: string[];    // ["Last, First", ...]
  title: string;
  year: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  accessDate?: string;
  conference?: string;
  institution?: string;
}

export class CitationManager {
  private storage?: IStorage;

  setStorage(storage: IStorage) {
    this.storage = storage;
  }

  async addCitation(citation: Omit<Citation, "id"> | Citation): Promise<Citation> {
    const id = (citation as Citation).id || randomUUID();
    const newCitation = { ...citation, id } as Citation;
    if (this.storage) {
      await this.storage.addCitation(newCitation);
    }
    return newCitation;
  }

  async getCitations(documentId: string): Promise<Citation[]> {
    if (this.storage) {
      return await this.storage.getCitations(documentId);
    }
    return [];
  }

  async removeCitation(documentId: string, citationId: string): Promise<void> {
    if (this.storage) {
      await this.storage.removeCitation(documentId, citationId);
    }
  }

  formatCitation(citation: Citation, style: CitationStyle): string {
    let authorsStr = citation.authors.join(", ");
    switch (style) {
      case "apa":
        return `${authorsStr} (${citation.year}). ${citation.title}.${citation.journal ? ` *${citation.journal}*, ${citation.volume ? `${citation.volume}` : ""}${citation.issue ? `(${citation.issue})` : ""}, ${citation.pages ? `${citation.pages}` : ""}.` : ""}${citation.doi ? ` https://doi.org/${citation.doi}` : ""}`;
      case "mla":
        return `${authorsStr}. "${citation.title}." ${citation.journal ? `*${citation.journal}*, vol. ${citation.volume || ""}, no. ${citation.issue || ""}, ${citation.year}, pp. ${citation.pages || ""}.` : ""}`;
      case "ieee": {
        const initAuthors = citation.authors.map(a => {
          const parts = a.split(" ");
          if (parts.length > 1) {
            const last = parts.pop();
            const initials = parts.map(p => p[0].toUpperCase() + ".").join(" ");
            return `${initials} ${last}`;
          }
          return a;
        });
        if (initAuthors.length > 2) {
          authorsStr = initAuthors.slice(0, -1).join(", ") + " and " + initAuthors[initAuthors.length - 1];
        } else {
          authorsStr = initAuthors.join(" and ");
        }
        
        let base = `${authorsStr}, "${citation.title},"`;
        switch (citation.type) {
          case "journal":
            base += ` in *${citation.journal}*, vol. ${citation.volume || ""}, no. ${citation.issue || ""}, pp. ${citation.pages || ""}, ${citation.year}.`;
            break;
          case "conference":
            base += ` presented at the *${citation.conference || "Conference"}*, ${citation.year}.`;
            break;
          case "book":
            base += ` ${citation.publisher || "Publisher"}, ${citation.year}.`;
            break;
          case "website":
            base += ` Accessed on: ${citation.accessDate || citation.year}. [Online]. Available: ${citation.url || ""}`;
            break;
          case "thesis":
            base += ` ${citation.institution || "Institution"}, ${citation.year}.`;
            break;
          case "report":
            base += ` Tech. Rep., ${citation.institution || "Institution"}, ${citation.year}.`;
            break;
          default:
            base += ` ${citation.year}.`;
        }
        if (citation.doi && citation.type !== "website") {
          base += ` doi: ${citation.doi}.`;
        } else if (citation.url && citation.type !== "website") {
          base += ` [Online]. Available: ${citation.url}`;
        }
        return base;
      }
      case "chicago":
        return `${authorsStr}. "${citation.title}." *${citation.journal || ""}* ${citation.volume || ""}, no. ${citation.issue || ""} (${citation.year}): ${citation.pages || ""}.`;
      case "harvard":
        return `${authorsStr}, ${citation.year}. ${citation.title}. ${citation.journal ? `*${citation.journal}*, ${citation.volume || ""}(${citation.issue || ""}), pp.${citation.pages || ""}.` : ""}`;
      default:
        return `${authorsStr} (${citation.year}). ${citation.title}.`;
    }
  }

  async generateBibliography(documentId: string, style: CitationStyle): Promise<string> {
    const citations = await this.getCitations(documentId);
    if (citations.length === 0) return "No citations found.";

    let bib = "## References\n\n";
    
    // Sort by first author's last name
    citations.sort((a, b) => (a.authors[0] || "").localeCompare(b.authors[0] || ""));

    citations.forEach((c, i) => {
      if (style === "ieee") {
        bib += `[${i + 1}] ${this.formatCitation(c, style)}\n\n`;
      } else {
        bib += `- ${this.formatCitation(c, style)}\n\n`;
      }
    });

    return bib.trim();
  }
}

export const citationManager = new CitationManager();
