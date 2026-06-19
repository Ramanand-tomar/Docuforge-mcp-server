# @docuforge-mcp/core

This is the core logic and storage layer for **DocuForge**, a powerful AI document formatting and generation engine. It provides the essential services and interfaces required for document management, academic formatting (such as IEEE standards), and citation handling.

## Features

- **Document Service**: Create, update, and manage versions of complex documents.
- **Format Service**: Transform plain text or markdown into highly structured templates like the two-column **IEEE Research Paper format**.
- **Citation Manager**: Built-in support for importing/exporting `.bib` (BibTeX) files and automatically resolving inline citations (e.g., `[cite:smith2023]`) into perfectly formatted reference blocks.
- **Storage Adapters**: Includes production-ready persistence using `better-sqlite3`, alongside an in-memory storage fallback for testing.
- **Importers**: Native utilities for safely importing text from external formats (Markdown, PDF, DOCX).

## Installation

```bash
npm install @docuforge-mcp/core
```

## Basic Usage

```typescript
import { DocumentService, SqliteStorage, FormatService } from "@docuforge-mcp/core";

// 1. Initialize storage and services
const storage = new SqliteStorage("./docuforge.db");
const docService = new DocumentService(storage);
const formatService = new FormatService();

// 2. Create a new document
const doc = await docService.createDocument({
  title: "My Research Paper",
  content: "Abstract\\nThis paper discusses neural networks...",
  metadata: {
    author: "Jane Doe"
  }
});

// 3. Format it for an academic standard
const formattedDoc = formatService.format(doc, "ieee");
```

## Related Packages

This package is part of the DocuForge ecosystem:
- `@docuforge-mcp/mcp-server` - Exposes this core logic to AI Agents (like Claude) via the Model Context Protocol.
- `@docuforge-mcp/pdf-engine` - Converts formatted documents to PDFs.
- `@docuforge-mcp/ai-integration` - Bridges document context to LLMs like Gemini.
