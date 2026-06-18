import { Router } from "express";
import { existsSync } from "fs";
import type { PdfGenerator } from "@docuforge/pdf-engine";

export function createPdfRoutes(pdfGenerator: PdfGenerator): Router {
  const router = Router();

  // Export document as PDF
  router.post("/:id/export-pdf", async (req, res, next) => {
    try {
      const pdfPath = await pdfGenerator.generate(req.params.id);
      res.json({ success: true, pdf_path: pdfPath });
    } catch (err) {
      next(err);
    }
  });

  // Download PDF (serves the file)
  router.get("/:id/download-pdf", async (req, res, next) => {
    try {
      const pdfPath = await pdfGenerator.generate(req.params.id);
      if (!existsSync(pdfPath)) {
        res.status(404).json({ error: "PDF not found. Export first." });
        return;
      }
      res.download(pdfPath);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
