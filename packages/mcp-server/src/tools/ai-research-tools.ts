import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge/core";
import type { AiService } from "@docuforge/ai-integration";
import { buildDocContext } from "@docuforge/ai-integration";

export function registerAiResearchTools(
  server: McpServer,
  docService: DocumentService,
  aiService: AiService | null
) {
  server.tool(
    "ai_paraphrase_section",
    "Paraphrase a section using a specific style.",
    {
      document_id: z.string().describe("Document ID"),
      section_id: z.string().describe("Section ID"),
      style: z.enum(["academic", "simpler", "formal", "concise"]).describe("Target style"),
    },
    async ({ document_id, section_id, style }) => {
      if (!aiService) return { content: [{ type: "text" as const, text: "AI not configured." }] };
      const doc = await docService.getDocument(document_id);
      const section = doc.sections.find((s) => s.id === section_id);
      if (!section) return { content: [{ type: "text" as const, text: "Section not found." }] };

      const prompt = `Paraphrase the following text in a ${style} style, preserving all factual content and citations:\n\n${section.content}`;
      const newContent = await aiService.provider.generateContent(prompt);
      
      await docService.editContent({ documentId: document_id, sectionId: section_id, newContent });
      
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ success: true, section_id, original_length: section.content.length, new_length: newContent.length }) }]
      };
    }
  );

  server.tool(
    "ai_expand_section",
    "Expand a section with more detail, examples, and supporting evidence.",
    {
      document_id: z.string().describe("Document ID"),
      section_id: z.string().describe("Section ID"),
      instructions: z.string().optional().describe("Additional instructions"),
    },
    async ({ document_id, section_id, instructions }) => {
      if (!aiService) return { content: [{ type: "text" as const, text: "AI not configured." }] };
      const doc = await docService.getDocument(document_id);
      const section = doc.sections.find((s) => s.id === section_id);
      if (!section) return { content: [{ type: "text" as const, text: "Section not found." }] };

      const prompt = `Expand the following section with more detail, examples, and supporting evidence. ${instructions || ""}\n\n${section.content}`;
      const newContent = await aiService.provider.generateContent(prompt);
      
      await docService.editContent({ documentId: document_id, sectionId: section_id, newContent });
      
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ success: true, section_id, original_length: section.content.length, new_length: newContent.length }) }]
      };
    }
  );

  server.tool(
    "ai_compress_section",
    "Compress a section to key points while preserving academic tone.",
    {
      document_id: z.string().describe("Document ID"),
      section_id: z.string().describe("Section ID"),
      target_words: z.number().optional().describe("Target word count"),
    },
    async ({ document_id, section_id, target_words }) => {
      if (!aiService) return { content: [{ type: "text" as const, text: "AI not configured." }] };
      const doc = await docService.getDocument(document_id);
      const section = doc.sections.find((s) => s.id === section_id);
      if (!section) return { content: [{ type: "text" as const, text: "Section not found." }] };

      const prompt = `Compress the following section to key points while preserving academic tone.${target_words ? ` Target around ${target_words} words.` : ""}\n\n${section.content}`;
      const newContent = await aiService.provider.generateContent(prompt);
      
      await docService.editContent({ documentId: document_id, sectionId: section_id, newContent });
      
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ success: true, section_id, original_length: section.content.length, new_length: newContent.length }) }]
      };
    }
  );

  server.tool(
    "ai_review_document",
    "Review a document for grammar, clarity, academic tone, or structure.",
    {
      document_id: z.string().describe("Document ID"),
      review_type: z.enum(["grammar", "clarity", "academic_tone", "structure", "all"]).describe("Type of review"),
    },
    async ({ document_id, review_type }) => {
      if (!aiService) return { content: [{ type: "text" as const, text: "AI not configured." }] };
      
      const rendered = await docService.renderDocumentContent(document_id);
      const prompt = `Review the following document for ${review_type}. Return structured suggestions strictly as a JSON array of objects with keys: "section_title", "issue", "suggestion", "severity". Do not wrap in markdown code blocks if returning pure JSON.\n\n${rendered}`;
      
      let result = await aiService.provider.generateContent(prompt);
      
      // Attempt to clean JSON
      result = result.replace(/^```json/, "").replace(/```$/, "").trim();

      await docService.appendContent({
        documentId: document_id,
        section: "AI Review Feedback",
        content: `\`\`\`json\n${result}\n\`\`\``
      });

      return {
        content: [{ type: "text" as const, text: result }]
      };
    }
  );

  server.tool(
    "ai_translate_document",
    "Translate a document or section.",
    {
      document_id: z.string().describe("Document ID"),
      target_language: z.string().describe("Target language"),
      section_id: z.string().optional().describe("Optional section ID to translate only one section"),
    },
    async ({ document_id, target_language, section_id }) => {
      if (!aiService) return { content: [{ type: "text" as const, text: "AI not configured." }] };
      const doc = await docService.getDocument(document_id);

      if (section_id) {
        const section = doc.sections.find((s) => s.id === section_id);
        if (!section) return { content: [{ type: "text" as const, text: "Section not found." }] };
        const prompt = `Translate the following text into ${target_language}. Preserve markdown formatting, citation placeholders, and Mermaid blocks:\n\n${section.content}`;
        const newContent = await aiService.provider.generateContent(prompt);
        await docService.editContent({ documentId: document_id, sectionId: section_id, newContent });
        return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, updated_section_id: section_id, target_language }) }] };
      } else {
        const newDocId = await docService.createDocument({ title: `${doc.title} (${target_language})`, format: doc.format });
        for (const section of doc.sections) {
          const prompt = `Translate the following text into ${target_language}. Preserve markdown formatting, citation placeholders, and Mermaid blocks:\n\n${section.content}`;
          const newContent = await aiService.provider.generateContent(prompt);
          await docService.appendContent({ documentId: newDocId, section: section.title, content: newContent });
        }
        return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, new_document_id: newDocId, target_language }) }] };
      }
    }
  );

  server.tool(
    "ai_generate_abstract",
    "Generate a structured abstract.",
    {
      document_id: z.string().describe("Document ID"),
      word_limit: z.number().default(250).describe("Word limit"),
    },
    async ({ document_id, word_limit }) => {
      if (!aiService) return { content: [{ type: "text" as const, text: "AI not configured." }] };
      const rendered = await docService.renderDocumentContent(document_id);
      const prompt = `Generate a structured abstract for the following document. Include: Background, Objective, Methods, Results, Conclusion. Keep it under ${word_limit} words:\n\n${rendered}`;
      const abstractContent = await aiService.provider.generateContent(prompt);
      
      const newSection = await docService.appendContent({
        documentId: document_id,
        section: "Abstract",
        content: abstractContent,
      });

      const doc = await docService.getDocument(document_id);
      doc.sections.forEach(s => {
        if (s.id === newSection.id) s.order = 0;
        else s.order += 1;
      });
      // Force update to save order
      if ((docService as any).storage?.updateDocument) {
        await (docService as any).storage.updateDocument(doc.id, doc);
      }

      return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, abstract_section_id: newSection.id }) }] };
    }
  );

  server.tool(
    "ai_suggest_keywords",
    "Suggest academic keywords.",
    {
      document_id: z.string().describe("Document ID"),
      count: z.number().default(8).describe("Number of keywords"),
    },
    async ({ document_id, count }) => {
      if (!aiService) return { content: [{ type: "text" as const, text: "AI not configured." }] };
      const rendered = await docService.renderDocumentContent(document_id);
      const prompt = `Suggest ${count} academic keywords for indexing the following document. Output only a comma-separated list of keywords:\n\n${rendered}`;
      const result = await aiService.provider.generateContent(prompt);
      const keywords = result.split(",").map((k) => k.trim());
      
      return { content: [{ type: "text" as const, text: JSON.stringify({ keywords }) }] };
    }
  );
}
