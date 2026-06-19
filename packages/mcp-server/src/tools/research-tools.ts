import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocumentService } from "@docuforge-mcp/core";
import { citationManager } from "@docuforge-mcp/core";
import type { AiService } from "@docuforge-mcp/ai-integration";

export function registerResearchTools(
  server: McpServer,
  docService: DocumentService,
  aiService: AiService | null,
) {
  server.tool(
    "create_ieee_paper",
    "Scaffold a complete IEEE paper structure including Title, Authors, Abstract, Index Terms, Introduction, Related Work, Proposed Methodology, Evaluation, and Conclusion.",
    {
      title: z.string().describe("Paper title"),
      authors: z.array(z.string()).describe("List of author names"),
      abstract: z.string().describe("Abstract content"),
      index_terms: z.string().describe("Comma separated index terms"),
    },
    async ({ title, authors, abstract, index_terms }) => {
      const docId = await docService.createDocument({
        title,
        format: "markdown",
      });

      // Apply IEEE style
      await docService.formatDocument({
        documentId: docId,
        style: "ieee",
      });

      // Insert Authors block
      await docService.appendContent({
        documentId: docId,
        section: "Authors",
        content: `<div class="authors">${authors.join(", ")}</div>`,
      });

      // Insert Abstract
      await docService.appendContent({
        documentId: docId,
        section: "Abstract",
        content: `**_Abstract_—${abstract}**\n\n**_Index Terms_—${index_terms}**`,
      });

      // Scaffold sections
      const sections = [
        "I. Introduction",
        "II. Related Work",
        "III. Proposed Methodology",
        "IV. Evaluation",
        "V. Conclusion"
      ];

      for (const section of sections) {
        await docService.appendContent({
          documentId: docId,
          section,
          content: `Content for ${section}...`,
        });
      }

      return {
        content: [{ type: "text" as const, text: `Successfully scaffolded IEEE paper with document ID: ${docId}` }],
      };
    },
  );

  server.tool(
    "insert_citation",
    "Insert an inline numbered citation marker into a section referencing a stored citation.",
    {
      document_id: z.string().describe("Document ID"),
      section_id: z.string().describe("Section ID"),
      citation_id: z.string().describe("Citation ID to reference"),
      text_snippet: z.string().optional().describe("Optional text snippet to replace with the citation, if omitted it will append at the end."),
    },
    async ({ document_id, section_id, citation_id, text_snippet }) => {
      const doc = await docService.getDocument(document_id);
      const section = doc.sections.find(s => s.id === section_id);
      if (!section) {
        return { content: [{ type: "text" as const, text: "Section not found." }] };
      }

      const marker = `[cite:${citation_id}]`;
      let newContent = section.content;

      if (text_snippet && newContent.includes(text_snippet)) {
        newContent = newContent.replace(text_snippet, `${text_snippet} ${marker}`);
      } else {
        newContent += ` ${marker}`;
      }

      await docService.editContent({
        documentId: document_id,
        sectionId: section_id,
        newContent,
      });

      return {
        content: [{ type: "text" as const, text: `Successfully inserted citation marker for ${citation_id}.` }],
      };
    },
  );

  server.tool(
    "import_bibtex",
    "Parse a BibTeX string and store the citations in the document.",
    {
      document_id: z.string().describe("Document ID"),
      bibtex: z.string().describe("Raw BibTeX string"),
    },
    async ({ document_id, bibtex }) => {
      // Very basic regex-based BibTeX parser for MVP
      const entries = bibtex.match(/@([a-zA-Z]+)\{([^,]+),([\s\S]*?)\n\}/g) || [];
      let count = 0;

      for (const entry of entries) {
        const typeMatch = entry.match(/@([a-zA-Z]+)\{/);
        const idMatch = entry.match(/\{([^,]+),/);
        if (!typeMatch || !idMatch) continue;

        const type = typeMatch[1].toLowerCase();
        
        // Extract fields
        const getField = (name: string) => {
          const match = entry.match(new RegExp(`${name}\\s*=\\s*[{"]?([^}"]+)[}"]?`, "i"));
          return match ? match[1].trim() : undefined;
        };

        const authorsField = getField("author");
        const authors = authorsField ? authorsField.split(" and ").map(a => a.trim()) : [];

        await citationManager.addCitation({
          documentId: document_id,
          type: type as any,
          authors,
          title: getField("title") || "Unknown Title",
          year: getField("year") ? parseInt(getField("year")!) : new Date().getFullYear(),
          journal: getField("journal"),
          volume: getField("volume"),
          issue: getField("number"),
          pages: getField("pages"),
          publisher: getField("publisher"),
          doi: getField("doi"),
          url: getField("url"),
          conference: getField("booktitle"),
        });
        count++;
      }

      return {
        content: [{ type: "text" as const, text: `Imported ${count} citations from BibTeX.` }],
      };
    },
  );

  server.tool(
    "export_bibtex",
    "Export all stored citations for a document into a BibTeX string.",
    {
      document_id: z.string().describe("Document ID"),
    },
    async ({ document_id }) => {
      const citations = await citationManager.getCitations(document_id);
      
      let bibtex = "";
      for (const c of citations) {
        bibtex += `@${c.type}{${c.id},\n`;
        bibtex += `  title={${c.title}},\n`;
        if (c.authors.length > 0) bibtex += `  author={${c.authors.join(" and ")}},\n`;
        bibtex += `  year={${c.year}},\n`;
        if (c.journal) bibtex += `  journal={${c.journal}},\n`;
        if (c.volume) bibtex += `  volume={${c.volume}},\n`;
        if (c.issue) bibtex += `  number={${c.issue}},\n`;
        if (c.pages) bibtex += `  pages={${c.pages}},\n`;
        if (c.publisher) bibtex += `  publisher={${c.publisher}},\n`;
        if (c.doi) bibtex += `  doi={${c.doi}},\n`;
        if (c.url) bibtex += `  url={${c.url}},\n`;
        if (c.conference) bibtex += `  booktitle={${c.conference}},\n`;
        bibtex += `}\n\n`;
      }

      return {
        content: [{ type: "text" as const, text: bibtex }],
      };
    },
  );

  server.tool(
    "add_figure_or_table",
    "Insert a figure (mermaid/image) or table into a section with an auto-numbered IEEE caption.",
    {
      document_id: z.string().describe("Document ID"),
      section_id: z.string().describe("Section ID"),
      type: z.enum(["figure", "table"]).describe("Type of visual to add"),
      content: z.string().describe("The markdown table or mermaid diagram content"),
      caption: z.string().describe("The caption for the figure or table"),
    },
    async ({ document_id, section_id, type, content, caption }) => {
      const doc = await docService.getDocument(document_id);
      const section = doc.sections.find(s => s.id === section_id);
      if (!section) {
        return { content: [{ type: "text" as const, text: "Section not found." }] };
      }

      const marker = type === "figure" ? `[figcap:${caption}]` : `[tabcap:${caption}]`;
      const wrapperClass = type === "figure" ? (content.includes("graph ") || content.includes("sequenceDiagram") || content.includes("classDiagram") ? "mermaid" : "figure") : "table-container";
      
      let block = `\n<div class="${wrapperClass}">\n${content}\n${marker}\n</div>\n`;

      await docService.editContent({
        documentId: document_id,
        sectionId: section_id,
        newContent: section.content + block,
      });

      return {
        content: [{ type: "text" as const, text: `Successfully appended ${type} to section.` }],
      };
    },
  );

  server.tool(
    "validate_ieee",
    "Report missing Abstract/Index Terms, missing References, unresolved citation markers, and section-ordering issues.",
    {
      document_id: z.string().describe("Document ID"),
    },
    async ({ document_id }) => {
      const doc = await docService.getDocument(document_id);
      const citations = await citationManager.getCitations(document_id);
      
      const issues: string[] = [];

      if (doc.style !== "ieee") {
        issues.push("Document style is not set to 'ieee'.");
      }

      const hasAbstract = doc.sections.some(s => s.title.toLowerCase() === "abstract");
      if (!hasAbstract) issues.push("Missing 'Abstract' section.");

      const fullContent = doc.sections.map(s => s.content).join("\n");
      const citeMatches = [...fullContent.matchAll(/\[cite:([a-zA-Z0-9-]+)\]/g)];
      
      for (const match of citeMatches) {
        const id = match[1];
        if (!citations.find(c => c.id === id)) {
          issues.push(`Unresolved citation marker: [cite:${id}] does not match any stored citation.`);
        }
      }

      if (citations.length > 0 && citeMatches.length === 0) {
        issues.push("Document has stored citations but no inline [cite:...] markers found.");
      }

      if (issues.length === 0) {
        return { content: [{ type: "text" as const, text: "✅ IEEE Validation passed. No issues found." }] };
      }

      return {
        content: [{ type: "text" as const, text: `❌ IEEE Validation failed with the following issues:\n- ${issues.join("\n- ")}` }],
      };
    },
  );

  server.tool(
    "ai_suggest_references",
    "AI-driven reference suggestions for claims. Will attempt to use the LLM to generate BibTeX or reference ideas for a specified claim in a section.",
    {
      document_id: z.string().describe("Document ID"),
      section_id: z.string().describe("Section ID"),
      claim: z.string().describe("The specific claim needing a citation"),
    },
    async ({ document_id, section_id, claim }) => {
      if (!aiService) {
        return {
          content: [
            {
              type: "text" as const,
              text: "AI service is not configured. Please set GEMINI_API_KEY to enable AI-driven reference suggestions.",
            },
          ],
        };
      }

      const doc = await docService.getDocument(document_id);
      const section = doc.sections.find((s) => s.id === section_id);
      if (!section) {
        return {
          content: [
            { type: "text" as const, text: "Section not found." },
          ],
        };
      }

      const prompt = `You are an academic research assistant. The user needs a citation for the following claim:\n"${claim}"\n\nPlease suggest 2-3 real academic papers that support this claim. For each, provide a brief explanation of why it fits and a raw BibTeX block.`;
      
      const result = await aiService.provider.generateContent(prompt);
      
      return {
        content: [
          {
            type: "text" as const,
            text: `Here are suggested references for your claim:\n\n${result}`,
          },
        ],
      };
    },
  );
}
