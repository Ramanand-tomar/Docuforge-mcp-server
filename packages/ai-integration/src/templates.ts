export const DOC_TEMPLATES = {
  prd: `Generate a comprehensive Product Requirements Document (PRD) with these sections:

# [Product Name] - Product Requirements Document
**Version:** 1.0 | **Date:** [Today] | **Author:** DocuForge AI

## 1. Executive Summary
## 2. Problem Statement
## 3. Goals & Success Metrics (with specific KPIs)
## 4. User Personas (at least 2)
## 5. User Stories & Requirements
   - Use format: "As a [user], I want [action] so that [benefit]"
   - Include acceptance criteria for each
## 6. Feature Requirements
   - P0 (Must Have)
   - P1 (Should Have)
   - P2 (Nice to Have)
## 7. Technical Requirements
## 8. Non-Functional Requirements (performance, security, scalability)
## 9. Timeline & Milestones
## 10. Risks & Mitigations
## 11. Appendix`,

  srs: `Generate a detailed Software Requirements Specification (SRS) following IEEE 830 standard:

# [System Name] - Software Requirements Specification
**Version:** 1.0 | **Date:** [Today] | **Prepared by:** DocuForge AI

## 1. Introduction
### 1.1 Purpose
### 1.2 Scope
### 1.3 Definitions, Acronyms, and Abbreviations
### 1.4 References
### 1.5 Overview

## 2. Overall Description
### 2.1 Product Perspective (include system context diagram in mermaid)
### 2.2 Product Functions
### 2.3 User Characteristics
### 2.4 Constraints
### 2.5 Assumptions and Dependencies

## 3. Specific Requirements
### 3.1 Functional Requirements (FR-001, FR-002, etc.)
### 3.2 External Interface Requirements
### 3.3 Performance Requirements
### 3.4 Design Constraints
### 3.5 Software System Attributes (reliability, availability, security)

## 4. Data Model (include ER diagram in mermaid)
## 5. Use Cases (include sequence diagrams in mermaid)
## 6. Appendices`,

  project_proposal: `Generate a professional Project Proposal:

# [Project Name] - Project Proposal
**Submitted by:** [Team] | **Date:** [Today]

## 1. Executive Summary (1 paragraph, compelling hook)
## 2. Problem Statement (data-backed)
## 3. Proposed Solution
## 4. Objectives & Deliverables
## 5. Technical Approach (include architecture diagram in mermaid)
## 6. Project Scope
   - In Scope
   - Out of Scope
## 7. Timeline (include Gantt chart in mermaid)
## 8. Resource Requirements
## 9. Budget Estimate
## 10. Risk Assessment (include risk matrix)
## 11. Success Criteria
## 12. Conclusion`,

  technical_doc: `Generate comprehensive Technical Documentation:

# [System/API Name] - Technical Documentation
**Version:** 1.0 | **Last Updated:** [Today]

## 1. Overview
## 2. Architecture (include system architecture diagram in mermaid)
## 3. Technology Stack (with justification)
## 4. Setup & Installation
## 5. Configuration
## 6. API Reference (with request/response examples)
## 7. Data Models (include ER diagram in mermaid)
## 8. Authentication & Authorization Flow (include sequence diagram)
## 9. Error Handling
## 10. Deployment (include deployment diagram in mermaid)
## 11. Monitoring & Logging
## 12. Troubleshooting
## 13. Contributing Guide`,

  hld: `Generate a High-Level Design (HLD) document:

# [System Name] - High-Level Design Document
**Version:** 1.0 | **Date:** [Today]

## 1. Introduction & Goals
## 2. System Architecture (MUST include mermaid architecture diagram)
## 3. Component Overview (include component diagram in mermaid)
## 4. Data Flow (include data flow diagram in mermaid)
## 5. Technology Stack Selection (with comparison table)
## 6. API Design (REST/GraphQL/gRPC endpoints)
## 7. Database Design (include ER diagram in mermaid)
## 8. Caching Strategy
## 9. Message Queue / Event System
## 10. Security Architecture
## 11. Scalability Plan (include scaling diagram)
## 12. Deployment Architecture (include deployment diagram in mermaid)
## 13. Monitoring & Alerting
## 14. Disaster Recovery`,

  lld: `Generate a Low-Level Design (LLD) document:

# [Component/Module Name] - Low-Level Design
**Version:** 1.0 | **Date:** [Today]

## 1. Component Overview
## 2. Class Diagram (MUST include mermaid class diagram)
## 3. Detailed Module Design
   - For each module: responsibility, interfaces, dependencies
## 4. Data Structures & Algorithms
## 5. Database Schema (include mermaid ER diagram with all fields)
## 6. API Contracts (request/response for each endpoint)
## 7. Sequence Diagrams (MUST include mermaid sequence diagram for key flows)
## 8. State Machine (include state diagram for stateful components)
## 9. Error Handling Strategy
## 10. Configuration Management
## 11. Unit Test Strategy
## 12. Performance Considerations`,

  bug_report: `Generate structured Bug Reports:

For each bug, use this format:

### BUG-[ID]: [Title]
- **Severity:** Critical / High / Medium / Low
- **Priority:** P0 / P1 / P2 / P3
- **Status:** Open
- **Reporter:** QA Agent | **Date:** [Today]
- **Environment:** [OS, Browser, Version]
- **Component:** [Module/Feature]

**Description:**
[Clear, concise description]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Additional Info:**
- Screenshots: [placeholder]
- Logs: [relevant log snippets]
- Workaround: [if any]`,

  test_cases: `Generate comprehensive Test Cases in a structured format:

# Test Plan: [Feature/Module Name]
**Version:** 1.0 | **Date:** [Today] | **Prepared by:** QA Agent

## Test Summary
- Total Test Cases: [N]
- P0 (Critical): [N]
- P1 (High): [N]
- P2 (Medium): [N]

## Test Cases

For each test case use this format:

| Field | Value |
|-------|-------|
| **TC-ID** | TC-001 |
| **Title** | [Descriptive title] |
| **Priority** | P0/P1/P2/P3 |
| **Type** | Functional / Integration / E2E / Security / Performance |
| **Preconditions** | [Setup required] |
| **Steps** | 1. [Step] 2. [Step] 3. [Step] |
| **Expected Result** | [Clear expected outcome] |
| **Test Data** | [Specific test data needed] |

Include categories: Happy Path, Negative Testing, Boundary Values, Security, Performance, Edge Cases`,

  edge_cases: `Perform exhaustive Edge Case Analysis:

# Edge Case Analysis: [Feature/System Name]
**Date:** [Today] | **Analyst:** QA Agent

## Categories of Edge Cases:

### 1. Input Validation Edge Cases
### 2. Boundary Value Edge Cases
### 3. Concurrency & Race Condition Edge Cases
### 4. Error Handling Edge Cases
### 5. Security Edge Cases
### 6. Performance & Load Edge Cases
### 7. Data Edge Cases (null, empty, max length, special chars, unicode)
### 8. Integration Edge Cases
### 9. State Machine Edge Cases
### 10. Environment Edge Cases

For each edge case:
- **ID:** EC-001
- **Category:** [Category]
- **Scenario:** [Description]
- **Input:** [Specific input]
- **Expected Behavior:** [What should happen]
- **Risk Level:** High / Medium / Low
- **Mitigation:** [How to handle]`,

  hackathon_pitch: `Generate a Hackathon Pitch Deck (10-12 slides):

# [Project Name] - Hackathon Pitch

## Slide 1: Title
- Project name, tagline, team name, hackathon name

## Slide 2: The Problem (Hook the judges)
- Pain point with data/statistics
- Who suffers from this?

## Slide 3: Our Solution
- One-line description
- Key insight that makes this work

## Slide 4: Live Demo Flow
- Screenshot descriptions / demo script
- Key features to showcase

## Slide 5: How It Works (include architecture diagram in mermaid)
- Tech architecture (simplified)
- Key technical innovation

## Slide 6: Technology Stack
- Why these choices?
- What makes this technically impressive?

## Slide 7: Impact & Use Cases
- Real-world applications
- Potential user base

## Slide 8: What We Built in [X] Hours
- Timeline of development
- Challenges overcome

## Slide 9: Future Roadmap
- Next features
- Scaling plan

## Slide 10: Team
- Members and roles

## Slide 11: Q&A / Call to Action

For each slide: provide exact text content + speaker notes`,

  startup_pitch: `Generate an Investor Pitch Deck (12-15 slides, Sequoia format):

# [Company Name] - Series [A/Seed] Pitch Deck

## Slide 1: Cover
- Company name, logo, one-line description, presenter name

## Slide 2: Problem
- Market pain point with $$ impact
- Current solutions and why they fail

## Slide 3: Solution
- Your product in one sentence
- 3 key differentiators

## Slide 4: Market Size (TAM/SAM/SOM)
- Total Addressable Market
- Serviceable Addressable Market
- Serviceable Obtainable Market
- Include market sizing methodology

## Slide 5: Product
- Key features and user benefits
- Product screenshots/mockup descriptions

## Slide 6: Business Model
- Revenue model (include business model diagram in mermaid)
- Pricing tiers
- Unit economics

## Slide 7: Traction
- Key metrics (MRR, users, growth rate)
- Notable customers/partners

## Slide 8: Go-to-Market Strategy
- Customer acquisition channels
- Sales cycle and CAC/LTV

## Slide 9: Competition
- Competitive landscape (include quadrant chart in mermaid)
- Your unfair advantage

## Slide 10: Team
- Founders and key hires
- Relevant experience and achievements

## Slide 11: Financials
- Revenue projections (3 years)
- Key assumptions
- Path to profitability

## Slide 12: The Ask
- Funding amount
- Use of funds breakdown (include pie chart in mermaid)
- Milestones this funding achieves

For each slide: exact content + speaker notes + suggested visuals`,

  market_research: `Generate a comprehensive Market Research Report:

# Market Research Report: [Industry/Product]
**Date:** [Today] | **Prepared by:** Research Agent

## 1. Executive Summary
## 2. Market Overview
   - Market size and growth rate
   - Key trends and drivers
   - Market segmentation
## 3. Target Audience Analysis
   - Demographics
   - Psychographics
   - Pain points and needs
## 4. Competitive Landscape
   - Direct competitors (feature comparison table)
   - Indirect competitors
   - Market positioning map (include quadrant chart in mermaid)
## 5. SWOT Analysis
## 6. Porter's Five Forces Analysis
## 7. Pricing Analysis
## 8. Distribution Channels
## 9. Regulatory Environment
## 10. Market Opportunities & Threats
## 11. Recommendations
## 12. Sources & Methodology`,

  competitor_analysis: `Generate a detailed Competitor Analysis:

# Competitor Analysis: [Your Product] vs Market
**Date:** [Today]

## 1. Executive Summary
## 2. Competitor Overview
   For each competitor:
   - Company overview
   - Product offering
   - Pricing model
   - Target market
   - Strengths & Weaknesses
   - Market share estimate

## 3. Feature Comparison Matrix (detailed table)
## 4. Pricing Comparison
## 5. Positioning Map (include quadrant chart in mermaid)
## 6. Technology Comparison
## 7. Go-to-Market Strategy Comparison
## 8. Competitive Advantages & Gaps
## 9. Strategic Recommendations`,

  feasibility_study: `Generate a Feasibility Study:

# Feasibility Study: [Project Name]
**Date:** [Today]

## 1. Executive Summary
## 2. Project Description
## 3. Technical Feasibility
   - Technology assessment
   - Architecture viability (include diagram in mermaid)
   - Resource requirements
   - Technical risks
## 4. Economic Feasibility
   - Cost-benefit analysis
   - ROI projection
   - Break-even analysis
## 5. Operational Feasibility
   - Process changes required
   - Training needs
   - Organizational impact
## 6. Schedule Feasibility (include gantt chart in mermaid)
## 7. Legal & Regulatory Feasibility
## 8. Risk Assessment
## 9. Recommendation (Go / No-Go with justification)`,

  readme: `Generate a professional README.md:

# [Project Name]

[One-line description]

[Badges: build status, version, license, etc.]

## Features
- Feature 1
- Feature 2

## Architecture (include mermaid diagram)

## Quick Start

## Installation

## Usage (with code examples)

## API Reference

## Configuration

## Contributing

## Tech Stack

## License`,

  ieee_paper: `Generate a Research Paper in IEEE format:

# [Paper Title]
**Authors:** [Names] | **Affiliation:** [Institution]

## Abstract (150-250 words)

## I. Introduction
- Background
- Problem statement
- Contribution
- Paper organization

## II. Related Work
- Literature survey
- Comparison with existing approaches

## III. Proposed Methodology
- System architecture (include mermaid diagram)
- Algorithm description
- Implementation details

## IV. Experimental Setup
- Dataset description
- Evaluation metrics
- Baseline methods

## V. Results and Discussion
- Performance comparison (include tables)
- Analysis of results
- Ablation studies

## VI. Conclusion and Future Work

## References (IEEE format: [1] Author, "Title," Journal, vol., no., pp., year.)`,

  research_paper: `Generate a full academic research paper:

# [Paper Title]
**Authors:** [Names] | **Affiliation:** [Institution]

## Abstract
## Introduction
## Literature Review
## Methodology
## Results
## Discussion
## Conclusion
## References (APA format)`,

  literature_review: `Generate a standalone literature review:

# Literature Review: [Topic]

## Introduction
## Thematic Synthesis
## Research Gaps
## Future Directions
## References`,

  research_proposal: `Generate a research/grant proposal:

# Research Proposal: [Topic]

## Background
## Research Questions
## Hypotheses
## Methodology
## Timeline (include Gantt chart in mermaid)
## Budget
## Expected Outcomes
## References`,

  systematic_review: `Generate a systematic review:

# Systematic Review: [Topic]

## Introduction
## Inclusion and Exclusion Criteria
## Search Strategy
## Data Extraction Table (markdown table)
## Quality Assessment
## Results
## Discussion
## Conclusion`,

  thesis_chapter: `Generate a single thesis chapter:

# Chapter [N]: [Chapter Title]

## Introduction
## [Content Section 1]
## [Content Section 2]
## Summary`,

  conference_abstract: `Generate a 250-word structured abstract for conference submission:

# [Paper Title]

## Background
## Objectives
## Methods
## Results
## Conclusion`,

  case_study: `Generate an academic case study:

# Case Study: [Topic/Entity]

## Context
## Problem/Challenge
## Analysis
## Findings
## Implications
## References`,

  annotated_bibliography: `Generate an annotated bibliography:

# Annotated Bibliography: [Topic]

For each source, provide:
- Citation (APA format)
- 150-word annotation (summary, evaluation, and relevance to the research topic)`,
};

export type TemplateType = keyof typeof DOC_TEMPLATES;

export function getTemplate(type: TemplateType): string {
  return DOC_TEMPLATES[type];
}

export function listTemplates(): Array<{ type: string; name: string }> {
  const names: Record<string, string> = {
    prd: "Product Requirements Document",
    srs: "Software Requirements Specification (IEEE 830)",
    project_proposal: "Project Proposal",
    technical_doc: "Technical Documentation",
    hld: "High-Level Design Document",
    lld: "Low-Level Design Document",
    bug_report: "Bug Report Template",
    test_cases: "Test Case Suite",
    edge_cases: "Edge Case Analysis",
    hackathon_pitch: "Hackathon Pitch Deck",
    startup_pitch: "Startup Investor Pitch Deck",
    market_research: "Market Research Report",
    competitor_analysis: "Competitor Analysis",
    feasibility_study: "Feasibility Study",
    readme: "README.md",
    ieee_paper: "IEEE Research Paper",
    research_paper: "Full Academic Research Paper",
    literature_review: "Standalone Literature Review",
    research_proposal: "Research/Grant Proposal",
    systematic_review: "Systematic Review (PRISMA)",
    thesis_chapter: "Thesis Chapter",
    conference_abstract: "Conference Abstract",
    case_study: "Academic Case Study",
    annotated_bibliography: "Annotated Bibliography",
  };
  return Object.entries(names).map(([type, name]) => ({ type, name }));
}
