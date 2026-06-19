import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge-mcp/core";

export function registerTocTool(server: McpServer, docService: DocumentService) {
  server.tool(
    "generate_toc",
    "Generate a Table of Contents for the document",
    {
      document_id: z.string().uuid().describe("Document ID"),
      append_as_section: z.boolean().optional().describe("If true, appends TOC as the first section"),
    },
    async ({ document_id, append_as_section }) => {
      const toc = await docService.generateToc(document_id);
      
      if (append_as_section) {
        const newSection = await docService.appendContent({
          documentId: document_id,
          section: "Table of Contents",
          content: toc,
        });

        const doc = await docService.getDocument(document_id);
        doc.sections.forEach(s => {
          if (s.id === newSection.id) s.order = 0;
          else s.order += 1;
        });
        if ((docService as any).storage?.updateDocument) {
          await (docService as any).storage.updateDocument(doc.id, doc);
        }
      }

      return {
        content: [{ type: "text" as const, text: toc }],
      };
    }
  );
}
