interface DocuForgeDocument {
  id: string;
  title: string;
  format: string;
  style?: string;
  sections: Array<{ id: string; title: string; content: string; order: number }>;
  rendered_content: string;
  version: number;
}

interface DocumentSummary {
  id: string;
  title: string;
  format: string;
  style?: string;
  sectionCount: number;
  createdAt: string;
  updatedAt: string;
}

export class DocuForgeClient {
  constructor(private baseUrl: string) {}

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
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

  async health(): Promise<{ status: string }> {
    return this.request("/api/health");
  }

  async listDocuments(): Promise<DocumentSummary[]> {
    return this.request("/api/documents");
  }

  async createDocument(title: string, format: string): Promise<{ document_id: string }> {
    return this.request("/api/documents", {
      method: "POST",
      body: JSON.stringify({ title, format }),
    });
  }

  async getDocument(id: string): Promise<DocuForgeDocument> {
    return this.request(`/api/documents/${id}`);
  }

  async appendSection(docId: string, section: string, content: string): Promise<{ section_id: string }> {
    return this.request(`/api/documents/${docId}/sections`, {
      method: "POST",
      body: JSON.stringify({ section, content }),
    });
  }

  async exportPdf(docId: string): Promise<{ pdf_path: string }> {
    return this.request(`/api/documents/${docId}/export-pdf`, {
      method: "POST",
    });
  }

  async aiGenerate(docId: string, sectionTitle: string, prompt: string): Promise<{ section_id: string }> {
    return this.request(`/api/documents/${docId}/ai/generate`, {
      method: "POST",
      body: JSON.stringify({ section_title: sectionTitle, prompt }),
    });
  }
}
