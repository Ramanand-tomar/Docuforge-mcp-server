export type DiagramType =
  | "flowchart"
  | "sequence"
  | "class"
  | "state"
  | "er"
  | "gantt"
  | "pie"
  | "mindmap"
  | "timeline"
  | "architecture"
  | "git"
  | "quadrant";

export interface DiagramTemplate {
  type: DiagramType;
  name: string;
  description: string;
  example: string;
}

export const DIAGRAM_TEMPLATES: Record<DiagramType, DiagramTemplate> = {
  flowchart: {
    type: "flowchart",
    name: "Flowchart",
    description: "Process flow with decision points. Use for workflows, algorithms, and system processes.",
    example: `graph TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[Result]
    D --> E
    E --> F[End]

    style A fill:#4CAF50,color:#fff,stroke:#388E3C,stroke-width:2px
    style F fill:#f44336,color:#fff,stroke:#d32f2f,stroke-width:2px
    style B fill:#FF9800,color:#fff,stroke:#F57C00,stroke-width:2px`,
  },

  sequence: {
    type: "sequence",
    name: "Sequence Diagram",
    description: "Interactions between components over time. Use for API flows, protocols, and user journeys.",
    example: `sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant Database

    User->>Frontend: Submit Form
    Frontend->>API: POST /data
    API->>Database: INSERT record
    Database-->>API: Success
    API-->>Frontend: 201 Created
    Frontend-->>User: Show Confirmation`,
  },

  class: {
    type: "class",
    name: "Class Diagram",
    description: "Object-oriented structure. Use for data models, system design, and code architecture.",
    example: `classDiagram
    class Document {
        +String id
        +String title
        +String format
        +Section[] sections
        +create()
        +update()
        +export()
    }
    class Section {
        +String id
        +String title
        +String content
        +int order
    }
    class PdfEngine {
        +generate(docId)
        -contentToHtml()
    }
    Document "1" --> "*" Section : contains
    PdfEngine --> Document : renders`,
  },

  state: {
    type: "state",
    name: "State Diagram",
    description: "State transitions. Use for status workflows, lifecycle management, and FSMs.",
    example: `stateDiagram-v2
    [*] --> Draft
    Draft --> Review: Submit
    Review --> Approved: Accept
    Review --> Draft: Reject
    Approved --> Published: Publish
    Published --> Archived: Archive
    Archived --> [*]

    state Review {
        [*] --> Pending
        Pending --> InReview: Assign Reviewer
        InReview --> [*]
    }`,
  },

  er: {
    type: "er",
    name: "ER Diagram",
    description: "Entity relationships. Use for database schemas and data modeling.",
    example: `erDiagram
    USER ||--o{ DOCUMENT : creates
    DOCUMENT ||--|{ SECTION : contains
    DOCUMENT ||--o{ VERSION : has
    USER ||--o{ COMMENT : writes
    COMMENT }o--|| SECTION : "attached to"

    USER {
        string id PK
        string email
        string name
        date created_at
    }
    DOCUMENT {
        string id PK
        string title
        string format
        string style
        int version
    }
    SECTION {
        string id PK
        string title
        text content
        int order
    }`,
  },

  gantt: {
    type: "gantt",
    name: "Gantt Chart",
    description: "Project timeline. Use for project plans, sprints, and roadmaps.",
    example: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Phase 1
    Core Setup           :done,    p1a, 2024-01-01, 7d
    MCP Tools            :done,    p1b, after p1a, 5d

    section Phase 2
    PDF Engine           :active,  p2a, after p1b, 7d
    REST API             :         p2b, after p2a, 5d

    section Phase 3
    AI Integration       :         p3a, after p2b, 7d
    Dashboard            :         p3b, after p3a, 10d
    Testing              :         p3c, after p3b, 5d`,
  },

  pie: {
    type: "pie",
    name: "Pie Chart",
    description: "Proportional data. Use for distribution, market share, and composition breakdowns.",
    example: `pie title Revenue by Product
    "Enterprise Plan" : 45
    "Pro Plan" : 30
    "Starter Plan" : 15
    "API Access" : 10`,
  },

  mindmap: {
    type: "mindmap",
    name: "Mind Map",
    description: "Hierarchical ideas. Use for brainstorming, topic overviews, and feature breakdowns.",
    example: `mindmap
  root((Project))
    Planning
      Requirements
      Architecture
      Timeline
    Development
      Frontend
        React
        TailwindCSS
      Backend
        Node.js
        Express
      Database
        SQLite
        PostgreSQL
    Deployment
      Docker
      CI/CD
      Monitoring`,
  },

  timeline: {
    type: "timeline",
    name: "Timeline",
    description: "Chronological events. Use for milestones, history, and roadmaps.",
    example: `timeline
    title Product Roadmap 2024
    Q1 2024
      : MVP Launch
      : Core MCP Tools
      : PDF Generation
    Q2 2024
      : AI Integration
      : Dashboard v1
      : VS Code Extension
    Q3 2024
      : PPT Engine
      : Collaboration
      : Premium Templates
    Q4 2024
      : Enterprise Features
      : Global Deployment
      : Mobile Support`,
  },

  architecture: {
    type: "architecture",
    name: "Architecture Diagram",
    description: "System architecture with layers and components. Use for technical documentation.",
    example: `graph TB
    subgraph CLIENT["Client Layer"]
        direction LR
        WEB["Web App"]
        IDE["IDE Extension"]
        CLI["CLI Tool"]
    end

    subgraph API["API Gateway"]
        direction LR
        REST["REST API"]
        MCP["MCP Server"]
    end

    subgraph SERVICES["Service Layer"]
        direction LR
        DOC["Document<br/>Service"]
        AI["AI<br/>Service"]
        PDF["PDF<br/>Engine"]
    end

    subgraph DATA["Data Layer"]
        direction LR
        DB["Database"]
        FS["File Storage"]
        CACHE["Cache"]
    end

    CLIENT --> API
    API --> SERVICES
    SERVICES --> DATA

    style CLIENT fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style API fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style SERVICES fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style DATA fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px`,
  },

  git: {
    type: "git",
    name: "Git Graph",
    description: "Git branch history. Use for branching strategies and release flows.",
    example: `gitGraph
    commit id: "Initial"
    branch develop
    commit id: "Feature A"
    commit id: "Feature B"
    checkout main
    merge develop id: "Release v1.0"
    branch hotfix
    commit id: "Bugfix"
    checkout main
    merge hotfix id: "v1.0.1"
    checkout develop
    commit id: "Feature C"
    checkout main
    merge develop id: "Release v2.0"`,
  },

  quadrant: {
    type: "quadrant",
    name: "Quadrant Chart",
    description: "2x2 matrix analysis. Use for priority matrices, competitive analysis, and categorization.",
    example: `quadrantChart
    title Feature Priority Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Do First
    quadrant-2 Plan Carefully
    quadrant-3 Quick Wins
    quadrant-4 Deprioritize
    PDF Export: [0.3, 0.9]
    AI Generation: [0.7, 0.85]
    Dark Mode: [0.2, 0.3]
    PPT Engine: [0.8, 0.7]
    Templates: [0.2, 0.6]
    Real-time Collab: [0.9, 0.5]`,
  },
};

export function getDiagramTemplate(type: DiagramType): DiagramTemplate {
  return DIAGRAM_TEMPLATES[type];
}

export function listDiagramTypes(): DiagramTemplate[] {
  return Object.values(DIAGRAM_TEMPLATES);
}

export function wrapAsMermaidBlock(mermaidSyntax: string): string {
  return "```mermaid\n" + mermaidSyntax.trim() + "\n```";
}
