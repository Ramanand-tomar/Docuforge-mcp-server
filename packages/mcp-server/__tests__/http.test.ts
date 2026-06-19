import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MemoryStorage, DocumentService } from "@docuforge-mcp/core";
import { PdfGenerator } from "@docuforge-mcp/pdf-engine";
import { createApp } from "../src/http";
import * as http from "http";

describe("MCP HTTP Server", () => {
  let server: http.Server;
  let port: number;

  beforeAll(async () => {
    const storage = new MemoryStorage();
    const docService = new DocumentService(storage);
    const pdfGenerator = new PdfGenerator(docService, "./output");
    
    // Pass mock config
    const app = createApp(storage, pdfGenerator, null);
    
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        port = (server.address() as any).port;
        resolve();
      });
    });
  });

  afterAll(() => {
    server.close();
  });

  it("should return 200 OK for /health", async () => {
    const res = await fetch(`http://localhost:${port}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });

  it("should return 401 Unauthorized for /mcp without API key in production mode", async () => {
    const oldEnv = process.env.NODE_ENV;
    const oldKey = process.env.MCP_API_KEY;
    
    process.env.NODE_ENV = "production";
    process.env.MCP_API_KEY = "test-secret-key";

    try {
      const res = await fetch(`http://localhost:${port}/mcp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toEqual({ error: "Unauthorized" });
    } finally {
      process.env.NODE_ENV = oldEnv;
      process.env.MCP_API_KEY = oldKey;
    }
  });

  it("should allow /mcp POST with correct API key", async () => {
    const oldEnv = process.env.NODE_ENV;
    const oldKey = process.env.MCP_API_KEY;
    
    process.env.NODE_ENV = "production";
    process.env.MCP_API_KEY = "test-secret-key";

    try {
      const res = await fetch(`http://localhost:${port}/mcp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer test-secret-key"
        },
        // Minimum valid JSON-RPC request just to pass the guard
        body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 })
      });

      // The server will try to process it as an SSE stream request (which we aren't fully formatting),
      // but it should NOT return 401. It will likely return 200 or 400.
      expect(res.status).not.toBe(401);
    } finally {
      process.env.NODE_ENV = oldEnv;
      process.env.MCP_API_KEY = oldKey;
    }
  });
});
