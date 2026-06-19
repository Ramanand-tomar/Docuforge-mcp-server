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
  ): boolean {
    if (!aiService) {
      res.status(503).json({
        error: "AI integration not configured. Set GEMINI_API_KEY.",
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

  router.post("/:id/ai/paraphrase/:sid", async (req, res, next) => {
    try {
      if (!requireAi(req, res)) return;
      const { style } = req.body;
      const doc = await docService.getDocument(req.params.id);
      const section = doc.sections.find((s) => s.id === req.params.sid);
      if (!section) return res.status(404).json({ error: "Section not found" });

      const prompt = `Paraphrase the following text in a ${style || 'academic'} style, preserving all factual content and citations:\n\n${section.content}`;
      const newContent = await aiService!.provider.generateContent(prompt);
      await docService.editContent({ documentId: req.params.id, sectionId: req.params.sid, newContent });
      
      res.json({ success: true, section_id: req.params.sid, original_length: section.content.length, new_length: newContent.length });
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/ai/expand/:sid", async (req, res, next) => {
    try {
      if (!requireAi(req, res)) return;
      const { instructions } = req.body;
      const doc = await docService.getDocument(req.params.id);
      const section = doc.sections.find((s) => s.id === req.params.sid);
      if (!section) return res.status(404).json({ error: "Section not found" });

      const prompt = `Expand the following section with more detail, examples, and supporting evidence. ${instructions || ""}\n\n${section.content}`;
      const newContent = await aiService!.provider.generateContent(prompt);
      await docService.editContent({ documentId: req.params.id, sectionId: req.params.sid, newContent });
      
      res.json({ success: true, section_id: req.params.sid, original_length: section.content.length, new_length: newContent.length });
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/ai/compress/:sid", async (req, res, next) => {
    try {
      if (!requireAi(req, res)) return;
      const { target_words } = req.body;
      const doc = await docService.getDocument(req.params.id);
      const section = doc.sections.find((s) => s.id === req.params.sid);
      if (!section) return res.status(404).json({ error: "Section not found" });

      const prompt = `Compress the following section to key points while preserving academic tone.${target_words ? ` Target around ${target_words} words.` : ""}\n\n${section.content}`;
      const newContent = await aiService!.provider.generateContent(prompt);
      await docService.editContent({ documentId: req.params.id, sectionId: req.params.sid, newContent });
      
      res.json({ success: true, section_id: req.params.sid, original_length: section.content.length, new_length: newContent.length });
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/ai/review", async (req, res, next) => {
    try {
      if (!requireAi(req, res)) return;
      const { review_type } = req.body;
      const rendered = await docService.renderDocumentContent(req.params.id);
      const prompt = `Review the following document for ${review_type || 'all'}. Return structured suggestions strictly as a JSON array of objects with keys: "section_title", "issue", "suggestion", "severity". Do not wrap in markdown code blocks if returning pure JSON.\n\n${rendered}`;
      
      let result = await aiService!.provider.generateContent(prompt);
      result = result.replace(/^```json/, "").replace(/```$/, "").trim();

      await docService.appendContent({
        documentId: req.params.id,
        section: "AI Review Feedback",
        content: `\`\`\`json\n${result}\n\`\`\``
      });

      res.json({ suggestions: JSON.parse(result || "[]") });
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/ai/translate", async (req, res, next) => {
    try {
      if (!requireAi(req, res)) return;
      const { target_language, section_id } = req.body;
      const doc = await docService.getDocument(req.params.id);

      if (section_id) {
        const section = doc.sections.find((s) => s.id === section_id);
        if (!section) return res.status(404).json({ error: "Section not found" });
        const prompt = `Translate the following text into ${target_language}. Preserve markdown formatting, citation placeholders, and Mermaid blocks:\n\n${section.content}`;
        const newContent = await aiService!.provider.generateContent(prompt);
        await docService.editContent({ documentId: req.params.id, sectionId: section_id, newContent });
        res.json({ success: true, updated_section_id: section_id, target_language });
      } else {
        const newDocId = await docService.createDocument({ title: `${doc.title} (${target_language})`, format: doc.format });
        for (const section of doc.sections) {
          const prompt = `Translate the following text into ${target_language}. Preserve markdown formatting, citation placeholders, and Mermaid blocks:\n\n${section.content}`;
          const newContent = await aiService!.provider.generateContent(prompt);
          await docService.appendContent({ documentId: newDocId, section: section.title, content: newContent });
        }
        res.json({ success: true, new_document_id: newDocId, target_language });
      }
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/ai/abstract", async (req, res, next) => {
    try {
      if (!requireAi(req, res)) return;
      const { word_limit } = req.body;
      const rendered = await docService.renderDocumentContent(req.params.id);
      const prompt = `Generate a structured abstract for the following document. Include: Background, Objective, Methods, Results, Conclusion. Keep it under ${word_limit || 250} words:\n\n${rendered}`;
      const abstractContent = await aiService!.provider.generateContent(prompt);
      
      const newSection = await docService.appendContent({
        documentId: req.params.id,
        section: "Abstract",
        content: abstractContent,
      });

      const doc = await docService.getDocument(req.params.id);
      doc.sections.forEach(s => {
        if (s.id === newSection.id) s.order = 0;
        else s.order += 1;
      });
      if ((docService as any).storage?.updateDocument) {
        await (docService as any).storage.updateDocument(doc.id, doc);
      }

      res.json({ success: true, abstract_section_id: newSection.id });
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/ai/keywords", async (req, res, next) => {
    try {
      if (!requireAi(req, res)) return;
      const { count } = req.body;
      const rendered = await docService.renderDocumentContent(req.params.id);
      const prompt = `Suggest ${count || 8} academic keywords for indexing the following document. Output only a comma-separated list of keywords:\n\n${rendered}`;
      const result = await aiService!.provider.generateContent(prompt);
      const keywords = result.split(",").map((k) => k.trim());
      
      res.json({ keywords });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
