import { resolve } from "path";
import { mkdir } from "fs/promises";
import type { Document, DocumentService } from "@docuforge-mcp/core";
import { renderMarkdownToHtml } from "./markdown-renderer.js";
import { wrapHtmlWithTemplate } from "./html-templates.js";
import { htmlToPdf } from "./puppeteer-pdf.js";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

export class PdfGenerator {
  constructor(
    private docService: DocumentService,
    private outputDir: string = "./output",
  ) {}

  async generate(documentId: string): Promise<string> {
    const doc = await this.docService.getDocument(documentId);
    const content = await this.docService.renderDocumentContent(documentId);
    const html = this.contentToHtml(doc, content);
    const fullHtml = wrapHtmlWithTemplate(html, doc.title, doc.style, doc.style === "research" || doc.style === "ieee");

    await mkdir(this.outputDir, { recursive: true });
    const sanitizedTitle = doc.title.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${sanitizedTitle}_${Date.now()}.pdf`;
    const outputPath = resolve(this.outputDir, filename);

    await htmlToPdf(fullHtml, outputPath);
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log(`Cloudinary credentials not fully configured. Returning local path: ${outputPath}`);
      return outputPath;
    }
    
    console.log(`Uploading PDF to Cloudinary...`);
    const uploadResult = await cloudinary.uploader.upload(outputPath, {
      resource_type: "raw", // PDFs should be uploaded as 'raw' to serve correctly in browser
      public_id: `docuforge_papers/${sanitizedTitle}_${Date.now()}.pdf`
    });

    return uploadResult.secure_url;
  }

  private contentToHtml(doc: Document, renderedContent: string): string {
    switch (doc.format) {
      case "markdown":
        return renderMarkdownToHtml(renderedContent);
      case "latex":
        return this.latexToHtml(doc);
      case "plain":
        return this.plainToHtml(doc);
      default:
        return renderMarkdownToHtml(renderedContent);
    }
  }

  private latexToHtml(doc: Document): string {
    // Basic LaTeX to HTML conversion (strips LaTeX commands)
    const parts: string[] = [`<h1>${escapeHtml(doc.title)}</h1>`];
    for (const section of doc.sections) {
      parts.push(`<h2>${escapeHtml(section.title)}</h2>`);
      let content = section.content;
      // Strip common LaTeX commands
      content = content.replace(/\\textbf\{([^}]+)\}/g, "<strong>$1</strong>");
      content = content.replace(/\\textit\{([^}]+)\}/g, "<em>$1</em>");
      content = content.replace(/\\emph\{([^}]+)\}/g, "<em>$1</em>");
      content = content.replace(/\\[a-zA-Z]+\{([^}]*)\}/g, "$1");
      content = content.replace(/\\[a-zA-Z]+/g, "");
      content = content
        .split("\n\n")
        .map((p) => `<p>${p.trim()}</p>`)
        .join("\n");
      parts.push(content);
    }
    return parts.join("\n");
  }

  private plainToHtml(doc: Document): string {
    const parts: string[] = [`<h1>${escapeHtml(doc.title)}</h1>`];
    for (const section of doc.sections) {
      parts.push(`<h2>${escapeHtml(section.title)}</h2>`);
      const paragraphs = section.content
        .split("\n\n")
        .map((p) => `<p>${escapeHtml(p.trim())}</p>`);
      parts.push(paragraphs.join("\n"));
    }
    return parts.join("\n");
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
