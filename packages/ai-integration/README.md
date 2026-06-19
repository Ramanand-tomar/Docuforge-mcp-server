# @docuforge-mcp/ai-integration

This package provides native AI capabilities for the **DocuForge** ecosystem. It wraps LLM providers (currently optimized for Google Gemini) to offer powerful, autonomous document rewriting, formatting, and suggestion tools directly within your workflow.

## Features

- **Google Gemini Integration**: Built-in `GeminiProvider` that handles streaming, token limits, and secure API communication.
- **Autonomous Rewriting**: Ability to ask the AI to rewrite specific sections of a document (e.g., expanding on an abstract or clarifying a technical paragraph).
- **Format Conversions**: Intelligently helps map unformatted text or raw notes into structured documents.
- **Service Injection**: Designed to be easily injected into the DocuForge REST API or MCP Server as an optional `AiService`.

## Installation

```bash
npm install @docuforge-mcp/ai-integration @docuforge-mcp/core
```

## Basic Usage

```typescript
import { AiService, GeminiProvider } from "@docuforge-mcp/ai-integration";
import { DocumentService, SqliteStorage } from "@docuforge-mcp/core";

// 1. Initialize your Gemini provider
const provider = new GeminiProvider(
  process.env.GEMINI_API_KEY, // Required
  "gemini-2.5-flash"          // Optional model override
);

// 2. Initialize the AI Service
const aiService = new AiService(provider);

// 3. Initialize your documents
const docService = new DocumentService(new SqliteStorage("./data.db"));
const docId = "my-document-123";

// 4. Have the AI rewrite your document!
const improvedDoc = await aiService.rewriteDocument(
  docId, 
  docService, 
  "Make this research paper sound more professional and academic, and fix all grammar."
);
```

## Related Packages

This package is part of the DocuForge ecosystem:
- `@docuforge-mcp/core` - The underlying document models and storage.
- `@docuforge-mcp/mcp-server` - Exposes this AI logic to Claude Desktop via the Model Context Protocol.
