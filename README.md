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

## 🛠 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Ramanand-tomar/Docuforge-mcp-server.git
cd Docuforge-mcp-server
```

### 2. Configure Environment

Create a `.env` file in the root based on `.env.example`:

```bash
cp .env.example .env
```

You should configure the following important variables in your `.env`:
- `STORAGE_TYPE=sqlite` (Use sqlite for persistence)
- `MCP_API_KEY=your_secure_mcp_api_key_here` (For remote MCP)
- `JWT_SECRET=your_secure_jwt_secret_here` (For Dashboard auth)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (For PDF uploads)
- `GEMINI_API_KEY` (For AI suggestion capabilities)

### 3. Local Installation & Development

This project uses `pnpm` workspaces.

```bash
# Install dependencies
pnpm install

# Run MCP server (stdio - for local Claude Desktop testing)
pnpm dev:mcp

# Run REST API & Remote MCP HTTP Server
pnpm dev:api

# Run React dashboard
cd packages/dashboard && pnpm dev
```

### 4. Running with Docker Compose

To spin up the entire production stack locally (REST API + MCP SSE server):

```bash
docker compose up --build
```

## ☁️ Cloud Deployment (Render)

This repository includes a `render.yaml` Blueprint file, making it extremely easy to deploy to [Render](https://render.com).

1. Push this code to your GitHub repository.
2. Sign in to Render and click **New+** -> **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and provision the web services.
5. Set your secret environment variables (`MCP_API_KEY`, `JWT_SECRET`, `CLOUDINARY_*`) in the Render dashboard for the service.

## 🔌 Connecting Remote MCP Clients

Once deployed, you can connect AI clients like Claude Desktop to your remote MCP server using the official MCP CLI tool:

```json
{
  "mcpServers": {
    "docuforge": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/inspector",
        "https://your-render-url.onrender.com/mcp"
      ],
      "env": {
        "MCP_API_KEY": "your_secure_mcp_api_key_here"
      }
    }
  }
}
```

## 🏗 System Architecture

DocuForge acts as a multi-tier monorepo:
- **`@docuforge/core`**: Document/citation models, SQLite storage layer, and IEEE rendering engine.
- **`@docuforge/pdf-engine`**: Puppeteer-based HTML-to-PDF compilation.
- **`@docuforge/mcp-server`**: Registers 9+ core MCP tools (e.g. `create_ieee_paper`, `import_bibtex`, `export_pdf`).
- **`@docuforge/rest-api`**: Express app serving the REST endpoints and the MCP SSE `/mcp` proxy.
- **`@docuforge/dashboard`**: Vite + React frontend.
- **`docuforge-vscode`**: VS Code extension client.

## 🧪 Testing

The repository features comprehensive testing via Vitest, encompassing unit tests, citation integration tests, and HTTP endpoint verification.

```bash
pnpm test
```

## 📄 License
MIT
