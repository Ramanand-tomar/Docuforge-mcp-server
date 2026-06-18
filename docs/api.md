# DocuForge REST API Documentation

Base URL: `http://localhost:3000`

## Authentication

When `AUTH_ENABLED=true`, all `/api/documents` endpoints require a Bearer token:

```
Authorization: Bearer <jwt-token>
```

### POST /api/auth/register
```json
// Request
{ "email": "user@example.com", "password": "password123" }

// Response 201
{ "user_id": "uuid", "token": "jwt-token" }
```

### POST /api/auth/login
```json
// Request
{ "email": "user@example.com", "password": "password123" }

// Response
{ "user_id": "uuid", "token": "jwt-token" }
```

## Documents

### GET /api/documents
List all documents.

```json
// Response
[
  {
    "id": "uuid",
    "title": "My Document",
    "format": "markdown",
    "style": "academic",
    "sectionCount": 3,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/documents
```json
// Request
{ "title": "My Document", "format": "markdown" }

// Response 201
{ "document_id": "uuid" }
```

### GET /api/documents/:id
```json
// Response
{
  "id": "uuid",
  "title": "My Document",
  "format": "markdown",
  "style": "academic",
  "sections": [
    { "id": "uuid", "title": "Introduction", "content": "...", "order": 0 }
  ],
  "rendered_content": "# My Document\n\n## Introduction\n...",
  "version": 3
}
```

### DELETE /api/documents/:id
```json
// Response
{ "success": true }
```

### POST /api/documents/:id/sections
```json
// Request
{ "section": "Introduction", "content": "Content here..." }

// Response 201
{ "success": true, "section_id": "uuid" }
```

### PUT /api/documents/:id/sections/:sectionId
```json
// Request
{ "new_content": "Updated content..." }

// Response
{ "success": true }
```

### POST /api/documents/:id/format
```json
// Request
{ "style": "academic" }  // academic | resume | report | blog

// Response
{ "id": "uuid", "title": "...", "style": "academic", "sections": [...], "rendered_content": "..." }
```

## PDF Export

### POST /api/documents/:id/export-pdf
```json
// Response
{ "success": true, "pdf_path": "/absolute/path/to/file.pdf" }
```

### GET /api/documents/:id/download-pdf
Downloads the PDF file directly.

## AI Integration

Requires `ANTHROPIC_API_KEY` to be set.

### POST /api/documents/:id/ai/generate
```json
// Request
{ "section_title": "Introduction", "prompt": "Write an introduction about..." }

// Response 201
{ "success": true, "section_id": "uuid", "generated_length": 1234 }
```

### POST /api/documents/:id/ai/rewrite/:sectionId
```json
// Request
{ "instructions": "Make it more formal and concise" }

// Response
{ "success": true, "rewritten_length": 890 }
```

### POST /api/documents/:id/ai/summarize
```json
// Response
{ "success": true, "summary": "This document covers..." }
```

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| General | 100 requests / 15 min |
| PDF Export | 10 requests / 1 min |
| AI Endpoints | 20 requests / 1 min |
