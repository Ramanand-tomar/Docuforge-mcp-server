import { Router } from "express";
import type { DocumentService } from "@docuforge/core";

export function createDocumentRoutes(docService: DocumentService): Router {
  const router = Router();

  // List documents
  router.get("/", async (_req, res, next) => {
    try {
      const docs = await docService.listDocuments();
      res.json(docs);
    } catch (err) {
      next(err);
    }
  });

  // Create document
  router.post("/", async (req, res, next) => {
    try {
      const { title, format } = req.body;
      if (!title || !format) {
        res.status(400).json({ error: "title and format are required" });
        return;
      }
      const id = await docService.createDocument({ title, format });
      res.status(201).json({ document_id: id });
    } catch (err) {
      next(err);
    }
  });

  // Get document
  router.get("/:id", async (req, res, next) => {
    try {
      const doc = await docService.getDocument(req.params.id);
      const rendered = await docService.renderDocumentContent(req.params.id);
      res.json({ ...doc, rendered_content: rendered });
    } catch (err) {
      next(err);
    }
  });

  // Delete document
  router.delete("/:id", async (req, res, next) => {
    try {
      await docService.deleteDocument(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  // Append section
  router.post("/:id/sections", async (req, res, next) => {
    try {
      const { section, content } = req.body;
      if (!section) {
        res.status(400).json({ error: "section title is required" });
        return;
      }
      const newSection = await docService.appendContent({
        documentId: req.params.id,
        section,
        content: content || "",
      });
      res.status(201).json({ success: true, section_id: newSection.id });
    } catch (err) {
      next(err);
    }
  });

  // Edit section
  router.put("/:id/sections/:sectionId", async (req, res, next) => {
    try {
      const { new_content } = req.body;
      await docService.editContent({
        documentId: req.params.id,
        sectionId: req.params.sectionId,
        newContent: new_content || "",
      });
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  // Format document
  router.post("/:id/format", async (req, res, next) => {
    try {
      const { style } = req.body;
      if (!style) {
        res.status(400).json({ error: "style is required" });
        return;
      }
      const doc = await docService.formatDocument({
        documentId: req.params.id,
        style,
      });
      const rendered = await docService.renderDocumentContent(doc.id);
      res.json({ ...doc, rendered_content: rendered });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
