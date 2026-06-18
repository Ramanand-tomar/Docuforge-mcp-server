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
ANTHROPIC_API_KEY=sk-ant-... pnpm dev:api
# or
ANTHROPIC_API_KEY=sk-ant-... pnpm dev:mcp
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
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

4. Restart Claude Desktop
5. You should see DocuForge tools in the tools menu

## VS Code Extension

```bash
cd packages/vscode-extension
pnpm install
pnpm build
```

To debug: open the extension folder in VS Code, press F5.

To install: package with `npx vsce package` and install the `.vsix` file.

**Note**: The REST API server must be running for the extension to work.

## Docker Deployment

```bash
cd docker
docker compose up --build
```

- API: http://localhost:3000
- Dashboard: http://localhost:5173

To set the API key:
```bash
ANTHROPIC_API_KEY=sk-ant-... docker compose up --build
```

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
