import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge/core";
import { citationManager, type CitationStyle } from "@docuforge/core";
import type { AiService } from "@docuforge/ai-integration";

export function registerCitationTools(
  server: McpServer,
  docService: DocumentService,
  aiService: AiService | null
) {
  server.tool(
    "add_citation",
    "Add a citation to a document.",
    {
      document_id: z.string().describe("Document ID"),
      type: z.enum(["journal", "book", "conference", "website", "thesis", "report"]),
      authors: z.array(z.string()).describe("List of authors"),
      title: z.string().describe("Title of the work"),
      year: z.number().describe("Year of publication"),
      journal: z.string().optional(),
      volume: z.string().optional(),
      issue: z.string().optional(),
      pages: z.string().optional(),
      publisher: z.string().optional(),
      doi: z.string().optional(),
      url: z.string().optional(),
      accessDate: z.string().optional(),
      conference: z.string().optional(),
      institution: z.string().optional(),
    },
    async (params) => {
      const citation = await citationManager.addCitation({
        documentId: params.document_id,
        type: params.type,
        authors: params.authors,
        title: params.title,
        year: params.year,
        journal: params.journal,
        volume: params.volume,
        issue: params.issue,
        pages: params.pages,
        publisher: params.publisher,
        doi: params.doi,
        url: params.url,
        accessDate: params.accessDate,
        conference: params.conference,
        institution: params.institution,
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ citation_id: citation.id }) }],
      };
    }
  );

  server.tool(
    "list_citations",
    "List all citations for a document.",
    {
      document_id: z.string().describe("Document ID"),
    },
    async ({ document_id }) => {
      const citations = await citationManager.getCitations(document_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(citations, null, 2) }],
      };
    }
  );

  server.tool(
    "remove_citation",
    "Remove a citation from a document.",
    {
      document_id: z.string().describe("Document ID"),
      citation_id: z.string().describe("Citation ID to remove"),
    },
    async ({ document_id, citation_id }) => {
      await citationManager.removeCitation(document_id, citation_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ success: true }) }],
      };
    }
  );

  server.tool(
    "format_citation",
    "Format a citation using a specific style.",
    {
      document_id: z.string().describe("Document ID"),
      citation_id: z.string().describe("Citation ID"),
      style: z.enum(["apa", "mla", "ieee", "chicago", "harvard"]),
    },
    async ({ document_id, citation_id, style }) => {
      const citations = await citationManager.getCitations(document_id);
      const citation = citations.find((c) => c.id === citation_id);
      if (!citation) {
        return { content: [{ type: "text" as const, text: "Citation not found." }] };
      }
      const formatted = citationManager.formatCitation(citation, style as CitationStyle);
      return {
        content: [{ type: "text" as const, text: formatted }],
      };
    }
  );

  server.tool(
    "generate_bibliography",
    "Generate a bibliography for a document.",
    {
      document_id: z.string().describe("Document ID"),
      style: z.enum(["apa", "mla", "ieee", "chicago", "harvard"]),
      append_to_document: z.boolean().optional().describe("Append to document"),
    },
    async ({ document_id, style, append_to_document }) => {
      const bib = await citationManager.generateBibliography(document_id, style as CitationStyle);
      if (append_to_document) {
        await docService.appendContent({
          documentId: document_id,
          section: "References",
          content: bib,
        });
      }
      return {
        content: [{ type: "text" as const, text: bib }],
      };
    }
  );

  server.tool(
    "ai_suggest_citations",
    "Analyze section content and suggest citation placeholders.",
    {
      document_id: z.string().describe("Document ID"),
      section_id: z.string().describe("Section ID"),
    },
    async ({ document_id, section_id }) => {
      if (!aiService) {
        return { content: [{ type: "text" as const, text: "AI not configured." }] };
      }
      const doc = await docService.getDocument(document_id);
      const section = doc.sections.find((s) => s.id === section_id);
      if (!section) {
        return { content: [{ type: "text" as const, text: "Section not found." }] };
      }
      
      const prompt = `Analyze the following section content and suggest where citations are needed. 
For each claim that needs a citation, provide a placeholder like "[Author, Year]" and a recommended search query for Google Scholar or PubMed.
Section content:
${section.content}

Output format as JSON array:
[
  { "text_snippet": "...", "placeholder": "[Author, Year]", "search_query": "..." }
]`;

      const result = await aiService.provider.generateContent(prompt);
      return {
        content: [{ type: "text" as const, text: result }],
      };
    }
  );
}
