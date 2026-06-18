# DocuForge MCP

AI-powered document creation, editing, and PDF generation via MCP (Model Context Protocol).

## Quick Start

```bash
# Install dependencies
pnpm install

# Run MCP server (stdio - for Claude Desktop / IDE integration)
pnpm dev:mcp

# Run REST API server (port 3000)
STORAGE_TYPE=sqlite pnpm dev:api

# Run React dashboard (port 5173)
cd packages/dashboard && pnpm dev

# Test MCP server
pnpm test:mcp
```

## System Architecture

```mermaid
graph TB
  subgraph CLIENT["CLIENT LAYER"]
    VSC["VS Code Extension"]
    DASH["React Dashboard<br/><i>Vite + TailwindCSS</i>"]
    AI_CLIENT["Claude Desktop /<br/>AI Agents / Antigravity"]
  end

  subgraph SERVER["SERVER LAYER"]
    REST["REST API<br/><b>Express 5</b><br/>JWT Auth | Rate Limiting<br/>CORS | Helmet"]
    MCP["MCP Server<br/><b>@modelcontextprotocol/sdk</b><br/>9 Tools Registered"]
  end

  subgraph CORE["CORE SERVICE LAYER"]
    DOC["Document Service<br/><i>CRUD + Render + Format</i>"]
    FMT["Format Service<br/><i>4 Style Templates</i>"]
    AI_SVC["AI Service<br/><i>Claude API Provider</i>"]
  end

  subgraph ENGINE["ENGINE LAYER"]
    PDF["PDF Engine<br/><b>Puppeteer + markdown-it</b><br/>HTML → PDF"]
    PPT["PPT Engine<br/><b>pptxgenjs</b><br/><i>Coming Soon</i>"]
  end

  subgraph STORAGE["STORAGE LAYER"]
    MEM["In-Memory Storage<br/><i>Development</i>"]
    SQL["SQLite Storage<br/><b>better-sqlite3</b><br/><i>Production</i>"]
    FS["File System<br/><i>PDFs, Assets</i>"]
  end

  VSC -->|HTTP| REST
  DASH -->|HTTP| REST
  AI_CLIENT -->|stdio / HTTP| MCP

  REST --> DOC
  REST --> AI_SVC
  MCP --> DOC
  MCP --> AI_SVC

  DOC --> FMT
  DOC --> PDF
  DOC --> PPT

  AI_SVC -->|"Anthropic API"| CLAUDE["Claude AI"]

  DOC --> MEM
  DOC --> SQL
  PDF --> FS
  PPT --> FS

  style CLIENT fill:#e8f4fd,stroke:#1a73e8,stroke-width:2px
  style SERVER fill:#fef7e0,stroke:#f9ab00,stroke-width:2px
  style CORE fill:#e8f5e9,stroke:#34a853,stroke-width:2px
  style ENGINE fill:#fce4ec,stroke:#ea4335,stroke-width:2px
  style STORAGE fill:#f3e5f5,stroke:#9334e6,stroke-width:2px
  style CLAUDE fill:#fff3e0,stroke:#ff6d00,stroke-width:1px
```

## Data Flow

```mermaid
sequenceDiagram
    actor User
    participant Client as VS Code / Dashboard / AI Agent
    participant API as REST API / MCP Server
    participant Core as Document Service
    participant AI as Claude AI
    participant PDF as PDF Engine
    participant DB as SQLite

    User->>Client: "Create a report about AI"
    Client->>API: create_document(title, format)
    API->>Core: createDocument()
    Core->>DB: INSERT document
    DB-->>Core: document_id
    Core-->>API: document_id
    API-->>Client: { document_id }

    Client->>API: ai_generate_section(doc_id, prompt)
    API->>Core: getDocument(doc_id)
    Core->>DB: SELECT document
    API->>AI: generateContent(prompt, context)
    AI-->>API: generated text
    API->>Core: appendContent(doc_id, section, content)
    Core->>DB: INSERT section
    API-->>Client: { section_id }

    Client->>API: export_pdf(doc_id)
    API->>Core: renderDocumentContent(doc_id)
    Core->>DB: SELECT document + sections
    Core-->>API: rendered markdown
    API->>PDF: generate(doc_id)
    PDF->>PDF: markdown → HTML → Puppeteer → PDF
    PDF-->>API: /output/file.pdf
    API-->>Client: { pdf_path }
    Client-->>User: PDF ready!
```

## Package Structure

```mermaid
graph LR
  subgraph Packages
    CORE["@docuforge/core"]
    PDF_E["@docuforge/pdf-engine"]
    MCP_S["@docuforge/mcp-server"]
    REST_A["@docuforge/rest-api"]
    AI_I["@docuforge/ai-integration"]
    VSC_E["docuforge-vscode"]
    DASH_B["@docuforge/dashboard"]
  end

  MCP_S --> CORE
  MCP_S --> PDF_E
  MCP_S --> AI_I
  REST_A --> CORE
  REST_A --> PDF_E
  REST_A --> AI_I
  PDF_E --> CORE
  AI_I --> CORE
  VSC_E -.->|HTTP| REST_A
  DASH_B -.->|HTTP| REST_A

  style CORE fill:#d4edda,stroke:#28a745,stroke-width:2px
  style PDF_E fill:#f8d7da,stroke:#dc3545,stroke-width:2px
  style MCP_S fill:#fff3cd,stroke:#ffc107,stroke-width:2px
  style REST_A fill:#fff3cd,stroke:#ffc107,stroke-width:2px
  style AI_I fill:#d1ecf1,stroke:#17a2b8,stroke-width:2px
  style VSC_E fill:#e2e3e5,stroke:#6c757d,stroke-width:2px
  style DASH_B fill:#e2e3e5,stroke:#6c757d,stroke-width:2px
```

## MCP Tools

```mermaid
graph LR
  subgraph DOCUMENT["Document Tools"]
    T1["create_document"]
    T2["append_content"]
    T3["edit_content"]
    T4["format_document"]
    T5["get_document"]
    T6["export_pdf"]
  end

  subgraph AI_TOOLS["AI Tools"]
    T7["ai_generate_section"]
    T8["ai_rewrite_section"]
    T9["ai_summarize"]
  end

  T1 -->|returns| ID["document_id"]
  T2 -->|returns| SID["section_id"]
  T6 -->|returns| PATH["pdf_path"]
  T7 -->|calls| CLAUDE["Claude API"]

  style DOCUMENT fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
  style AI_TOOLS fill:#e3f2fd,stroke:#2196f3,stroke-width:2px
```

## PDF Generation Pipeline

```mermaid
flowchart LR
  A["Document<br/>(sections)"] --> B["Render Content<br/><i>markdown / latex / plain</i>"]
  B --> C{"Format?"}
  C -->|Markdown| D["markdown-it<br/>→ HTML"]
  C -->|LaTeX| E["Strip commands<br/>→ HTML"]
  C -->|Plain| F["Paragraphs<br/>→ HTML"]
  D --> G["Apply Style Template<br/><i>academic / resume /<br/>report / blog</i>"]
  E --> G
  F --> G
  G --> H["Full HTML Page<br/><i>with embedded CSS</i>"]
  H --> I["Puppeteer<br/><b>page.pdf()</b>"]
  I --> J["PDF File<br/><i>./output/*.pdf</i>"]

  style A fill:#fff3e0,stroke:#ff9800
  style G fill:#e8f5e9,stroke:#4caf50
  style I fill:#fce4ec,stroke:#e91e63
  style J fill:#e8eaf6,stroke:#3f51b5
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant API as REST API
    participant Auth as Auth Middleware
    participant JWT as jose (JWT)

    User->>API: POST /api/auth/register {email, password}
    API->>API: Hash password (SHA-256)
    API->>JWT: Sign token (HS256, 24h expiry)
    JWT-->>API: JWT token
    API-->>User: { user_id, token }

    User->>API: GET /api/documents [Bearer token]
    API->>Auth: Verify Authorization header
    Auth->>JWT: jwtVerify(token, secret)
    JWT-->>Auth: { sub: userId, email }
    Auth->>API: req.user = { userId, email }
    API-->>User: [documents...]

    User->>API: GET /api/documents [no token]
    API->>Auth: Verify Authorization header
    Auth-->>User: 401 Unauthorized
```

## Deployment Architecture

```mermaid
graph TB
  subgraph DOCKER["Docker Compose"]
    subgraph SVC1["docuforge-server"]
      API2["Express + MCP<br/>Port 3000"]
      CHROME["Chromium<br/><i>for Puppeteer</i>"]
      DB2["SQLite<br/><i>/app/data/</i>"]
    end
    subgraph SVC2["docuforge-dashboard"]
      NGINX["Nginx<br/>Port 80"]
      REACT["React Build<br/><i>Static Files</i>"]
    end
  end

  INTERNET["Internet / Users"] --> NGINX
  NGINX -->|"/api/*"| API2
  NGINX -->|"/*"| REACT
  API2 --> CHROME
  API2 --> DB2

  VOL1[("Volume:<br/>docuforge-data")] --> DB2
  VOL2[("Volume:<br/>docuforge-output")] --> API2

  style DOCKER fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
  style SVC1 fill:#fff8e1,stroke:#f9a825,stroke-width:1px
  style SVC2 fill:#f1f8e9,stroke:#558b2f,stroke-width:1px
```

## IDE Integration

Add to your IDE's MCP config:

### Claude Desktop
`%APPDATA%\Claude\claude_desktop_config.json`

### Google Antigravity
`%USERPROFILE%\.gemini\antigravity\mcp_config.json`

### VS Code (Claude Code)
```bash
claude mcp add docuforge -- npx tsx /path/to/packages/mcp-server/src/index.ts
```

**Config format** (same for all):
```json
{
  "mcpServers": {
    "docuforge": {
      "command": "npx",
      "args": ["tsx", "C:/path/to/pdf-mcp-serve/packages/mcp-server/src/index.ts"],
      "env": {
        "ANTHROPIC_API_KEY": "your-key-here"
      }
    }
  }
}
```

## REST API

Start: `STORAGE_TYPE=sqlite pnpm dev:api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/documents` | List documents |
| POST | `/api/documents` | Create document |
| GET | `/api/documents/:id` | Get document |
| DELETE | `/api/documents/:id` | Delete document |
| POST | `/api/documents/:id/sections` | Add section |
| PUT | `/api/documents/:id/sections/:sid` | Edit section |
| POST | `/api/documents/:id/format` | Apply style |
| POST | `/api/documents/:id/export-pdf` | Export PDF |
| POST | `/api/documents/:id/ai/generate` | AI generate section |
| POST | `/api/documents/:id/ai/rewrite/:sid` | AI rewrite section |
| POST | `/api/documents/:id/ai/summarize` | AI summarize |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STORAGE_TYPE` | `memory` | `memory` or `sqlite` |
| `SQLITE_PATH` | `./data/docuforge.db` | SQLite database path |
| `PDF_OUTPUT_DIR` | `./output` | PDF output directory |
| `PORT` | `3000` | REST API port |
| `ANTHROPIC_API_KEY` | - | Claude API key (enables AI tools) |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-20250514` | AI model |
| `AUTH_ENABLED` | `false` | Enable JWT authentication |
| `JWT_SECRET` | `dev-secret` | JWT signing secret |

## Docker

```bash
cd docker
docker compose up --build
```

## Tech Stack

- **Runtime**: Node.js 22, TypeScript
- **MCP**: @modelcontextprotocol/sdk
- **PDF**: Puppeteer + markdown-it
- **Storage**: SQLite (better-sqlite3) / in-memory
- **API**: Express 5
- **AI**: Anthropic Claude SDK
- **Frontend**: React 19, Vite, TailwindCSS
- **Auth**: JWT (jose)
