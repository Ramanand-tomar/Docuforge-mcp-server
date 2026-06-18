import { Router } from "express";
import type { DocumentService } from "@docuforge/core";
import type { AiService } from "@docuforge/ai-integration";
import { buildDocContext } from "@docuforge/ai-integration";

export function createAiRoutes(
  docService: DocumentService,
  aiService: AiService | null,
): Router {
  const router = Router();

  function requireAi(
    _req: unknown,
    res: { status: (code: number) => { json: (body: unknown) => void } },
  ): aiService is AiService {
    if (!aiService) {
      res.status(503).json({
        error: "AI integration not configured. Set ANTHROPIC_API_KEY.",
      });
      return false;
    }
    return true;
  }

  // Generate a section using AI
  router.post("/:id/ai/generate", async (req, res, next) => {
    try {
      if (!requireAi(req, res)) return;

      const { section_title, prompt } = req.body;
      if (!section_title || !prompt) {
        res
          .status(400)
          .json({ error: "section_title and prompt are required" });
        return;
      }

      const doc = await docService.getDocument(req.params.id);
      const rendered = await docService.renderDocumentContent(req.params.id);
      const context = buildDocContext(doc, rendered);
      const content = await aiService!.generateSection(prompt, context);

      const section = await docService.appendContent({
        documentId: req.params.id,
        section: section_title,
        content,
      });

      res.status(201).json({
        success: true,
        section_id: section.id,
        generated_length: content.length,
      });
    } catch (err) {
      next(err);
    }
  });

  // Rewrite a section using AI
  router.post("/:id/ai/rewrite/:sectionId", async (req, res, next) => {
    try {
      if (!requireAi(req, res)) return;

      const { instructions } = req.body;
      if (!instructions) {
        res.status(400).json({ error: "instructions are required" });
        return;
      }

      const doc = await docService.getDocument(req.params.id);
      const section = doc.sections.find(
        (s) => s.id === req.params.sectionId,
      );
      if (!section) {
        res.status(404).json({ error: "Section not found" });
        return;
      }

      const rendered = await docService.renderDocumentContent(req.params.id);
      const context = buildDocContext(doc, rendered);
      const rewritten = await aiService!.rewriteContent(
        section.content,
        instructions,
        context,
      );

      await docService.editContent({
        documentId: req.params.id,
        sectionId: req.params.sectionId,
        newContent: rewritten,
      });

      res.json({ success: true, rewritten_length: rewritten.length });
    } catch (err) {
      next(err);
    }
  });

  // Summarize document using AI
  router.post("/:id/ai/summarize", async (req, res, next) => {
    try {
      if (!requireAi(req, res)) return;

      const rendered = await docService.renderDocumentContent(req.params.id);
      const summary = await aiService!.summarize(rendered);
      res.json({ success: true, summary });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
