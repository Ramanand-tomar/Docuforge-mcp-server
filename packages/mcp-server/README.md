# @docuforge-mcp/mcp-server

This package is the **Model Context Protocol (MCP)** server for DocuForge. It exposes the entire DocuForge ecosystem—document creation, academic formatting, AI-driven rewriting, and PDF generation—directly to AI agents and desktop apps like Claude Desktop.

By installing this tool, you grant your AI assistant the ability to autonomously generate, edit, and compile complex research papers, reports, and formatted documents.

## Installation for Claude Desktop

If you are using Claude Desktop, you do not need to clone this repository. You can run the server directly via `npx`.

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "docuforge": {
      "command": "npx",
      "args": [
        "-y",
        "@docuforge-mcp/mcp-server"
      ],
      "env": {
        "GEMINI_API_KEY": "your_gemini_api_key_here",
        "STORAGE_TYPE": "sqlite",
        "CLOUDINARY_CLOUD_NAME": "optional_cloud_name",
        "CLOUDINARY_API_KEY": "optional_api_key",
        "CLOUDINARY_API_SECRET": "optional_api_secret"
      }
    }
  }
}
```

## Available MCP Tools

Once connected, your AI assistant will have access to the following tools:

- `docuforge_create_document`: Create a new document with title, content, and metadata.
- `docuforge_get_document`: Retrieve a document's content and formatted version.
- `docuforge_list_documents`: List all available documents.
- `docuforge_update_document`: Edit an existing document's content.
- `docuforge_format_document`: Format a document into a specific template (e.g., `ieee`).
- `docuforge_add_citation`: Add a BibTeX citation to a document.
- `docuforge_rewrite_with_ai`: Ask Gemini to rewrite or expand upon a document's content.
- `docuforge_export_pdf`: Compile the document into a high-quality PDF. If Cloudinary keys are provided, the PDF will be uploaded to the cloud and a public URL will be returned.

## Local Development

If you are developing or testing locally:

```bash
git clone https://github.com/Ramanand-tomar/Docuforge-mcp-server.git
cd Docuforge-mcp-server
pnpm install
pnpm -r run build
cd packages/mcp-server
pnpm start
```
