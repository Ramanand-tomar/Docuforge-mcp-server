import { z } from "zod";

export const CreateDocumentSchema = z.object({
  title: z.string().min(1).describe("Document title"),
  format: z
    .enum(["markdown", "latex", "plain"])
    .describe("Document format: markdown, latex, or plain"),
});

export const AppendContentSchema = z.object({
  document_id: z.string().uuid().describe("Document ID"),
  section: z.string().min(1).describe("Section title"),
  content: z.string().describe("Section content"),
});

export const EditContentSchema = z.object({
  document_id: z.string().uuid().describe("Document ID"),
  section_id: z.string().uuid().describe("Section ID to edit"),
  new_content: z.string().describe("New content for the section"),
});

export const FormatDocumentSchema = z.object({
  document_id: z.string().uuid().describe("Document ID"),
  style: z
    .enum(["academic", "resume", "report", "blog", "research", "ieee"])
    .describe("Document style to apply"),
});

export const ExportPdfSchema = z.object({
  document_id: z.string().uuid().describe("Document ID"),
});

export const GetDocumentSchema = z.object({
  document_id: z.string().uuid().describe("Document ID"),
});
