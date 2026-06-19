import { Router } from "express";
import type { DocumentService } from "@docuforge-mcp/core";
import { citationManager } from "@docuforge-mcp/core";

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

  // Import document
  router.post("/import", async (req, res, next) => {
    try {
      const { file_path, format } = req.body;
      if (!file_path || !format) {
        res.status(400).json({ error: "file_path and format are required" });
        return;
      }
      
      const { importMarkdown, importDocx, importPdf } = await import("@docuforge-mcp/core");
      
      let importedDoc;
      switch (format) {
        case "markdown":
        case "txt":
          importedDoc = await importMarkdown(file_path);
          break;
        case "docx":
          importedDoc = await importDocx(file_path);
          break;
        case "pdf":
          importedDoc = await importPdf(file_path);
          break;
        default:
          res.status(400).json({ error: `Unsupported format: ${format}` });
          return;
      }

      const docId = await docService.createDocument({ title: importedDoc.title, format: "markdown" });

      for (const section of importedDoc.sections) {
        await docService.appendContent({
          documentId: docId,
          section: section.title,
          content: section.content,
        });
      }

      res.status(201).json({ 
        document_id: docId, 
        title: importedDoc.title,
        sections_imported: importedDoc.sections.length 
      });
    } catch (err) {
      next(err);
    }
  });

  // Search documents
  router.get("/search", async (req, res, next) => {
    try {
      const q = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      if (!q) {
        res.status(400).json({ error: "q query parameter is required" });
        return;
      }
      const results = await docService.searchDocuments(q, limit);
      res.json({ results, total: results.length });
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

  // Add citation
  router.post("/:id/citations", async (req, res, next) => {
    try {
      const citation = citationManager.addCitation({ ...req.body, documentId: req.params.id });
      res.status(201).json(citation);
    } catch (err) {
      next(err);
    }
  });

  // List citations
  router.get("/:id/citations", async (req, res, next) => {
    try {
      res.json(citationManager.getCitations(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  // Remove citation
  router.delete("/:id/citations/:cid", async (req, res, next) => {
    try {
      citationManager.removeCitation(req.params.id, req.params.cid);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  // Generate bibliography
  router.get("/:id/bibliography", async (req, res, next) => {
    try {
      const style = (req.query.style as any) || "apa";
      const bib = citationManager.generateBibliography(req.params.id, style);
      res.json({ bibliography: bib });
    } catch (err) {
      next(err);
    }
  });

  // Export DOCX
  router.get("/:id/export-docx", async (req, res, next) => {
    try {
      const doc = await docService.getDocument(req.params.id);
      const { exportToDocx } = await import("@docuforge-mcp/pdf-engine");
      const { mkdir } = await import("fs/promises");
      await mkdir("./data", { recursive: true });
      const filePath = await exportToDocx(doc, "./data");
      res.download(filePath);
    } catch (err) {
      next(err);
    }
  });

  // Export HTML
  router.get("/:id/export-html", async (req, res, next) => {
    try {
      const doc = await docService.getDocument(req.params.id);
      const markdown = await docService.renderDocumentContent(req.params.id);
      const { renderMarkdownToHtml, wrapHtmlWithTemplate } = await import("@docuforge-mcp/pdf-engine");
      const htmlContent = renderMarkdownToHtml(markdown);
      const fullHtml = wrapHtmlWithTemplate(htmlContent, doc.title, doc.style);
      
      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");
      await mkdir("./data", { recursive: true });
      const filePath = path.join("./data", `${doc.id}.html`);
      await writeFile(filePath, fullHtml);
      res.download(filePath);
    } catch (err) {
      next(err);
    }
  });

  // Export Markdown
  router.get("/:id/export-md", async (req, res, next) => {
    try {
      const doc = await docService.getDocument(req.params.id);
      const markdown = await docService.renderDocumentContent(req.params.id);
      
      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");
      await mkdir("./data", { recursive: true });
      const filePath = path.join("./data", `${doc.id}.md`);
      await writeFile(filePath, markdown);
      res.download(filePath);
    } catch (err) {
      next(err);
    }
  });

  // Get history
  router.get("/:id/history", async (req, res, next) => {
    try {
      const versions = await docService.getDocumentHistory(req.params.id);
      res.json({ document_id: req.params.id, versions });
    } catch (err) {
      next(err);
    }
  });

  // Restore version
  router.post("/:id/restore/:version", async (req, res, next) => {
    try {
      const version = parseInt(req.params.version, 10);
      if (isNaN(version)) {
        res.status(400).json({ error: "Version must be a number" });
        return;
      }
      const doc = await docService.restoreVersion(req.params.id, version);
      res.json({ success: true, document_id: doc.id, restored_to_version: parseInt(req.params.version, 10), new_version: doc.version });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
