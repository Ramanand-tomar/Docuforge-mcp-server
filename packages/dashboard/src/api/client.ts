const BASE_URL = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface DocumentSummary {
  id: string;
  title: string;
  format: string;
  style?: string;
  sectionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface FullDocument {
  id: string;
  title: string;
  format: string;
  style?: string;
  sections: DocSection[];
  rendered_content: string;
  version: number;
}

export const api = {
  listDocuments: () => request<DocumentSummary[]>("/documents"),

  createDocument: (title: string, format: string) =>
    request<{ document_id: string }>("/documents", {
      method: "POST",
      body: JSON.stringify({ title, format }),
    }),

  getDocument: (id: string) => request<FullDocument>(`/documents/${id}`),

  deleteDocument: (id: string) =>
    request<{ success: boolean }>(`/documents/${id}`, { method: "DELETE" }),

  appendSection: (docId: string, section: string, content: string) =>
    request<{ section_id: string }>(`/documents/${docId}/sections`, {
      method: "POST",
      body: JSON.stringify({ section, content }),
    }),

  editSection: (docId: string, sectionId: string, newContent: string) =>
    request<{ success: boolean }>(`/documents/${docId}/sections/${sectionId}`, {
      method: "PUT",
      body: JSON.stringify({ new_content: newContent }),
    }),

  formatDocument: (docId: string, style: string) =>
    request<FullDocument>(`/documents/${docId}/format`, {
      method: "POST",
      body: JSON.stringify({ style }),
    }),

  exportPdf: (docId: string) =>
    request<{ success: boolean; pdf_path: string }>(
      `/documents/${docId}/export-pdf`,
      { method: "POST" },
    ),

  aiGenerate: (docId: string, sectionTitle: string, prompt: string) =>
    request<{ section_id: string }>(`/documents/${docId}/ai/generate`, {
      method: "POST",
      body: JSON.stringify({ section_title: sectionTitle, prompt }),
    }),

  aiSummarize: (docId: string) =>
    request<{ summary: string }>(`/documents/${docId}/ai/summarize`, {
      method: "POST",
    }),
};
