# DocuForge REST API

This package is a standalone REST API server for DocuForge built with **Fastify**. It exposes all DocuForge features (document management, AI integration, and PDF compilation) over standard HTTP endpoints.

## Why a REST API?
While the `@docuforge-mcp/mcp-server` package allows AI agents to control DocuForge locally, the `rest-api` allows you to deploy DocuForge to the web (e.g., Render, Heroku) so that external web applications, mobile apps, or custom frontends can interface with it.

## Getting Started

From the root of the monorepo:

```bash
pnpm install
pnpm -r run build
cd packages/rest-api

# Start the server
pnpm start
```

## Environment Variables

Create a `.env` file in the `packages/rest-api` directory:

```env
PORT=3000
HOST=0.0.0.0
STORAGE_TYPE=sqlite
GEMINI_API_KEY=your_key_here

# Optional: Cloudinary configuration for hosting exported PDFs
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
```

## Available Endpoints

- `GET /health` - Healthcheck
- `POST /api/documents` - Create a document
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get a document by ID
- `PUT /api/documents/:id` - Update a document
- `POST /api/documents/:id/format` - Format a document (e.g., IEEE style)
- `POST /api/documents/:id/pdf` - Export a document to PDF
- `POST /api/documents/:id/rewrite` - Trigger AI to rewrite the document
