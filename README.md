# DocuForge MCP Server

AI-powered document creation, editing, and PDF generation via MCP (Model Context Protocol). **DocuForge** allows AI agents, IDEs, and user-facing dashboards to programmatically orchestrate the creation of complex documents (specifically tailored for **IEEE Research Papers**), compile them to PDFs via Puppeteer, and host them.

## 🚀 Features Added in this Project

DocuForge has been heavily upgraded with production-ready features tailored for academic and professional document workflows:

1. **IEEE Research Paper Pipeline**: Full support for formatting documents into the official IEEE template (two-column, justified, specialized Abstract/Index Terms, and Reference sections).
2. **Citation Management**: Native support for BibTeX importing/exporting, and inline citation marker resolution (e.g. `[cite:jones2023]` auto-converts to `[1]` with an aggregated References list).
3. **SQLite Persistence**: Transitioned from purely in-memory storage to a production-ready SQLite database for documents, citations, and versions.
4. **Cloudinary Asset Hosting**: Automatically uploads generated PDFs to Cloudinary when API keys are provided, returning public URLs instead of local file paths.
5. **Remote MCP via HTTP/SSE**: Run the MCP server remotely behind an Express REST API with token authentication, allowing secure remote integration with clients like Claude Desktop.
6. **Multi-stage Docker Builds**: Optimized `Dockerfile` and `docker-compose.yml` for running the REST API and MCP services side-by-side in production.
7. **VS Code Extension**: A functional VS Code extension bundled into the repository for IDE integration.

## 🤖 Quick Start for Claude Desktop (Local MCP)

Want to give Claude (or Cursor) the ability to autonomously format IEEE papers, manage citations, and export PDFs? You can run DocuForge directly via NPM!

### 1. Connect to Claude Desktop

Open your Claude Desktop configuration file:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the `docuforge` tool to your `mcpServers` list and add your own Gemini API key!

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
        "STORAGE_TYPE": "sqlite",
        "GEMINI_API_KEY": "your_gemini_api_key_here"
      }
    }
  }
}
```

### 2. Start Creating!
Restart Claude Desktop. You will see a plug icon indicating the tools are loaded! You can now type:
> *"Create a new IEEE format research paper about Neural Networks, add a few sections, and export it to a PDF."*

---

## 🛠 Local Development & Dashboard

If you want to run the full dashboard and REST API locally:

```bash
# Run the local REST API
pnpm dev:api

# In a new terminal, run the React frontend dashboard
cd packages/dashboard
pnpm dev
```

## ☁️ Cloud Deployment (Render)

This repository includes a `render.yaml` Blueprint file, making it extremely easy to deploy to [Render](https://render.com).

1. Push this code to your GitHub repository.
2. Sign in to Render and click **New+** -> **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and provision the web services.
5. Set your secret environment variables (`MCP_API_KEY`, `JWT_SECRET`, `CLOUDINARY_*`) in the Render dashboard for the service.

## 📦 NPM Packages

DocuForge is published on NPM and split into several modular packages:
- [`@docuforge-mcp/core`](https://www.npmjs.com/package/@docuforge-mcp/core): Document/citation models, SQLite storage layer, and IEEE rendering engine.
- [`@docuforge-mcp/pdf-engine`](https://www.npmjs.com/package/@docuforge-mcp/pdf-engine): Puppeteer-based HTML-to-PDF compilation.
- [`@docuforge-mcp/ai-integration`](https://www.npmjs.com/package/@docuforge-mcp/ai-integration): Gemini LLM wrapper for autonomous document improvements.
- [`@docuforge-mcp/mcp-server`](https://www.npmjs.com/package/@docuforge-mcp/mcp-server): Registers 9+ core MCP tools (e.g. `create_ieee_paper`, `import_bibtex`, `export_pdf`).

## 🏗 System Architecture

The overarching monorepo also includes web-facing functionality:
- **`@docuforge-mcp/rest-api`**: Express app serving the REST endpoints and the MCP SSE `/mcp` proxy.
- **`@docuforge-mcp/dashboard`**: Vite + React frontend.
- **`docuforge-vscode`**: VS Code extension client.

## 🧪 Testing

The repository features comprehensive testing via Vitest, encompassing unit tests, citation integration tests, and HTTP endpoint verification.

```bash
pnpm test
```

## 📄 License
MIT
