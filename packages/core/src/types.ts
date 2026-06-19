export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export type DocumentFormat = "markdown" | "latex" | "plain";
export type DocumentStyle = "academic" | "resume" | "report" | "blog" | "research" | "ieee";

export interface Document {
  id: string;
  title: string;
  format: DocumentFormat;
  style?: DocumentStyle;
  sections: DocumentSection[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
  version: number;
}

export interface DocumentSummary {
  id: string;
  title: string;
  format: DocumentFormat;
  style?: DocumentStyle;
  sectionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  documentId: string;
  sectionId: string;
  sectionTitle: string;
  snippet: string;
  rank: number;
}

export interface CreateDocumentInput {
  title: string;
  format: DocumentFormat;
}

export interface AppendContentInput {
  documentId: string;
  section: string;
  content: string;
}

export interface EditContentInput {
  documentId: string;
  sectionId: string;
  newContent: string;
}

export interface FormatDocumentInput {
  documentId: string;
  style: DocumentStyle;
}
