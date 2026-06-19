# @docuforge-mcp/pdf-engine

This package powers the **document compilation** for the **DocuForge** ecosystem. It converts highly structured HTML/CSS templates (like our built-in IEEE two-column layout) into production-ready PDF files using a headless Chromium browser (Puppeteer).

## Features

- **Puppeteer Rendering**: Generates pixel-perfect PDFs exactly as they would appear in a modern browser.
- **CSS Formatting Injection**: Automatically injects global CSS (like the `index.css` IEEE styles) into the HTML before rendering to ensure styling is applied.
- **Cloudinary Integration**: Rather than just saving a `.pdf` file to disk, if Cloudinary API keys are provided in your environment, the PDF is autonomously uploaded to the cloud, returning a secure, shareable URL.

## Installation

```bash
npm install @docuforge-mcp/pdf-engine @docuforge-mcp/core
```

> **Note on Dependencies:** This package relies on `puppeteer`. During installation, it will attempt to download a local Chromium binary. If deploying to cloud environments (like Render or Heroku), ensure you have the necessary OS dependencies for Chromium.

## Basic Usage

```typescript
import { PdfGenerator } from "@docuforge-mcp/pdf-engine";
import { DocumentService, SqliteStorage } from "@docuforge-mcp/core";

// 1. Setup Document Service
const docService = new DocumentService(new SqliteStorage("./data.db"));

// 2. Initialize the PDF Generator
// The second argument is the output directory where local PDFs are saved.
const pdfGenerator = new PdfGenerator(docService, "./output_pdfs");

// 3. Generate a PDF from an existing Document ID
// If Cloudinary environment variables are set, this returns a public URL!
// Otherwise, it returns the absolute local file path.
const resultUrlOrPath = await pdfGenerator.generate("my-document-123");
console.log("PDF successfully compiled:", resultUrlOrPath);
```

## Cloudinary Configuration

To enable automatic cloud hosting of generated PDFs, add these environment variables to your project:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
