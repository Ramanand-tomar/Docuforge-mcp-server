# docuforge-vscode

The official **VS Code Extension** for DocuForge. Write, format, and compile your documents directly from your favorite editor without ever switching context.

## Features

- **Side Panel Tree View**: Manage your DocuForge documents in a dedicated VS Code side panel.
- **Write with AI**: Highlight text in your editor and right-click to trigger "Write with DocuForge AI" to automatically rewrite or expand your content.
- **Export to PDF**: Right-click any document to instantly export it to a beautifully formatted PDF (e.g., IEEE style).
- **Direct MCP Integration**: The extension acts as an MCP Client and connects directly to your local DocuForge MCP Server.

## Installation

You can install this extension locally or publish it to the VS Code extension marketplace.

To run it locally in development mode:

1. Open the monorepo root in VS Code.
2. Navigate to `packages/vscode-extension`.
3. Press `F5` to open a new VS Code window with the extension loaded.

## How it works

The extension communicates via the Model Context Protocol (MCP) using Stdio. It spawns the DocuForge MCP Server in the background when activated, allowing it to issue tool calls (`docuforge_create_document`, `docuforge_export_pdf`, etc.) exactly like an AI agent would.
