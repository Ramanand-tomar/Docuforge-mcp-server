# DocuForge Setup Guide

## Prerequisites

- Node.js >= 20.0.0
- pnpm (install: `npm install -g pnpm`)

## Installation

```bash
cd pdf-mcp-serve
pnpm install
```

This will install all workspace dependencies including Puppeteer's Chromium (~300MB download on first install).

## Running Locally

### Option 1: MCP Server (for Claude Desktop / IDE)

```bash
pnpm dev:mcp
```

The server runs on stdio and exposes all 9 tools.

### Option 2: REST API Server

```bash
# With in-memory storage (data lost on restart)
pnpm dev:api

# With SQLite persistence
STORAGE_TYPE=sqlite pnpm dev:api
```

Server starts at http://localhost:3000.

### Option 3: Full Stack (API + Dashboard)

Terminal 1:
```bash
STORAGE_TYPE=sqlite pnpm dev:api
```

Terminal 2:
```bash
cd packages/dashboard
pnpm dev
```

Dashboard at http://localhost:5173, API at http://localhost:3000.

## Enabling AI Features

Set your Anthropic API key:

```bash
GEMINI_API_KEY=sk-ant-... pnpm dev:api
# or
GEMINI_API_KEY=sk-ant-... pnpm dev:mcp
```

## Claude Desktop Integration

1. Open Claude Desktop settings
2. Edit `claude_desktop_config.json`
3. Add the DocuForge server:

```json
{
  "mcpServers": {
    "docuforge": {
      "command": "npx",
      "args": ["tsx", "/full/path/to/packages/mcp-server/src/index.ts"],
      "env": {
        "GEMINI_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

4. Restart Claude Desktop
5. You should see DocuForge tools in the tools menu

### Connecting to a Remote Hosted MCP Server

If you have deployed DocuForge to the cloud (via Docker), you can connect Claude Desktop (or Cursor) to it securely over HTTP SSE using an intermediary bridge like `mcp-cli` or similar tools that support SSE:

```json
{
  "mcpServers": {
    "docuforge-remote": {
      "command": "npx",
      "args": ["@modelcontextprotocol/client-cli", "http://your-cloud-domain.com/mcp"],
      "env": {
        "Authorization": "Bearer YOUR_MCP_API_KEY"
      }
    }
  }
}
```

## VS Code Extension

```bash
cd packages/vscode-extension
pnpm install
pnpm build
```

To debug: open the extension folder in VS Code, press F5.

To install: package with `npx vsce package` and install the `.vsix` file.

**Note**: The REST API server must be running for the extension to work.

## Cloud Deployment

For deploying to cloud providers like AWS ECS or Google Cloud Run, DocuForge is equipped with a multi-stage production Dockerfile and an NGINX reverse proxy setup.

1. **Build and Push Images:**
   ```bash
   docker compose -f docker/docker-compose.yml build
   docker tag docker-docuforge-server:latest your-registry/docuforge-server:latest
   docker push your-registry/docuforge-server:latest
   ```
2. **Deploy via your Orchestrator:**
   Deploy the images mounting a persistent volume (EFS / Filestore) to `/app/data` (for SQLite) and `/app/output` (for PDFs).

### Connecting to a Hosted Server
Once hosted, your web dashboard is accessible at your NGINX entrypoint:
`http://your-server-ip:80` (or your configured domain).

The remote MCP HTTP endpoint will be available at:
`http://your-server-ip:80/mcp`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Set to `production` in live environments. |
| `STORAGE_TYPE` | `sqlite` or `memory`. |
| `SQLITE_PATH` | Path to the `.db` file (e.g. `./data/docuforge.db`). |
| `JWT_SECRET` | Required in production. Keep it highly secure! |
| `MCP_API_KEY` | Required in production. Authenticates remote MCP clients. |
| `GEMINI_API_KEY` | Your Gemini API Key for AI generation. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name for image hosting. |
| `CLOUDINARY_API_KEY` | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET`| Cloudinary API Secret. |

## Testing

```bash
# Test MCP server end-to-end
pnpm test:mcp

# Run unit tests
pnpm test
```

## Troubleshooting

### Puppeteer fails to launch
- Ensure Chromium was downloaded: check `~/.cache/puppeteer/`
- On Linux/Docker: install `chromium` and set `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`

### SQLite errors
- Ensure the `data/` directory exists and is writable
- Delete `data/docuforge.db` to reset the database

### MCP connection issues
- Check that the server path in claude_desktop_config.json is absolute
- Use `npx tsx` (not `ts-node`) as the runner
- Check server stderr output for errors
