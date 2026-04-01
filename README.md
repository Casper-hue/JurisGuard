# JurisGuard

**Cross-border regulatory monitoring platform built during career transition period (2024)**

A production-deployed web application that automates regulatory change tracking across multiple jurisdictions. Built to solve a real Legal Ops problem: keeping pace with regulatory updates without manual monitoring overhead.

---

## Problem Statement

Legal teams operating across borders face a manual, resource-intensive workflow for regulatory monitoring:
- Checking multiple government websites daily for regulatory updates
- Manually parsing legal documents to identify relevant changes
- Assessing business impact of each regulatory change
- Maintaining internal documentation of compliance requirements

This process doesn't scale. Companies either dedicate significant legal headcount to monitoring, or accept the risk of missing critical regulatory changes.

---

## Solution Overview

JurisGuard automates the monitoring → parsing → analysis workflow:

1. **Automated data collection**: GitHub Actions pipeline scrapes regulatory sources on schedule
2. **Structured data processing**: Standardizes heterogeneous legal documents into queryable format
3. **AI-assisted analysis**: LLM-based system identifies relevant changes and assesses business impact
4. **User interface**: Dashboard for filtering, search, and drill-down into specific regulatory items

**Current scope**: EU (GDPR, AI Act), US (CCPA), and selected ASEAN jurisdictions. Extensible architecture supports adding new sources.

---

## Technical Implementation

### Architecture
- **Frontend**: Next.js 16 (App Router) + React 18 + TypeScript
- **Data pipeline**: Node.js scripts + GitHub Actions (scheduled runs)
- **AI layer**: OpenRouter/Hugging Face APIs for document analysis
- **Deployment**: [Specify platform - Vercel/AWS/etc.]

### Key Technical Decisions

**Why Next.js**: Server-side rendering for better SEO and initial load performance. App Router enables file-system-based routing that maps cleanly to Legal Ops workflow (dashboard → compliance → cases → documents).

**Why scheduled pipeline vs. real-time**: Regulatory changes are not real-time events. Scheduled scraping (daily/weekly) matches the actual cadence of regulatory updates while keeping infrastructure costs low.

**Why multiple LLM providers**: Redundancy for API availability + cost optimization (different models for different tasks: summarization vs. structured extraction).

### Data Flow

```
[Government Websites] 
    ↓
[GitHub Actions Scraper]  ← Scheduled runs
    ↓
[Raw HTML/PDF Storage]
    ↓
[Processing Script]       ← Parse + structure
    ↓
[JSON Data Store]
    ↓
[Next.js API Routes]      ← Query interface
    ↓
[React Dashboard]         ← User-facing UI
```

### Project Structure

```
├── app/                   # Next.js pages (dashboard, compliance, cases, documents, AI assistant)
├── components/            # Reusable UI components
├── lib/                   # Core services (AI, crawler, utilities)
├── scripts/               # Data collection and processing scripts
├── data/                  # Structured JSON outputs from pipeline
└── types/                 # TypeScript type definitions
```

---

## Functional Scope

### Core Features
- **Regulatory dashboard**: Filterable view of recent regulatory changes (by jurisdiction, risk level, date)
- **Document library**: Centralized repository of compliance-related documents
- **Case database**: Reference database of legal precedents and enforcement actions
- **AI assistant**: LLM-powered interface for regulatory Q&A and document analysis

### Risk Assessment Logic
Multi-factor scoring model for prioritizing regulatory changes:
- Business relevance (40%): How directly it affects company operations
- Penalty severity (40%): Potential financial/legal consequences of non-compliance  
- Urgency (20%): Time to compliance deadline

Weights are configurable based on company risk appetite.

### Limitations & Trade-offs
- **No real-time alerts**: Scheduled batch processing means updates lag by up to 24 hours
- **Manual source configuration**: Adding new regulatory sources requires code changes
- **AI hallucination risk**: LLM outputs are not guaranteed accurate; human review required
- **Single-user system**: No multi-user auth or role-based access control (yet)

---

## Deployment & Maintenance

**Status**: Production-deployed and operational since [month/year]

**Maintenance overhead**: 
- Data pipeline: ~2 hours/month (monitoring scraper health, updating selectors when source sites change)
- Infrastructure: Minimal (serverless deployment)
- Content: AI summaries occasionally need manual correction

**Cost structure**:
- Hosting: [amount or "free tier"]
- LLM API calls: [amount or estimate]
- Developer time: Built solo over [timeframe]

---

## Business Value Delivered

This project demonstrates:

1. **Legal Ops workflow understanding**: Automated a real, repetitive legal task (regulatory monitoring) that typically requires dedicated headcount

2. **Technical delivery**: Shipped a working application to production, not just a prototype

3. **Business-tech translation**: Designed a scoring model that translates legal risk into quantifiable business metrics

4. **Platform thinking**: Extensible architecture that supports adding new jurisdictions/sources without rewriting core logic

---

## Technical Skills Demonstrated

**Frontend Development**
- Modern React patterns (hooks, server components, streaming)
- TypeScript for type safety and maintainability
- Responsive UI design (desktop + mobile)

**Backend & Automation**
- RESTful API design (Next.js API routes)
- CI/CD automation (GitHub Actions)
- Web scraping and data processing pipelines

**LegalTech Domain Knowledge**
- Regulatory data modeling (understanding how legal documents are structured)
- Risk assessment frameworks (multi-factor scoring)
- Legal terminology standardization (preventing AI errors through controlled vocabularies)

**System Design**
- Scheduled batch processing vs. real-time trade-offs
- Data pipeline error handling and monitoring
- Scalable architecture (can add jurisdictions without refactoring)

---

## What I Would Do Differently for an Enterprise Legal Ops Platform

Having built this as a solo project, I now understand the gaps between this and an enterprise-grade system:

**Missing capabilities**:
- **User management**: RBAC, SSO integration, audit logging
- **Workflow engine**: Approval chains, task assignment, SLA tracking
- **Integration layer**: APIs for connecting to contract management, e-signature, matter management systems
- **Data governance**: Retention policies, encryption at rest, compliance with data residency requirements
- **Observability**: Application monitoring, error tracking, performance metrics

**Architecture changes**:
- Move from scheduled batch to event-driven (webhook-based updates when available)
- Separate database layer instead of JSON files
- Containerization for consistent dev/prod environments
- Proper secrets management (not .env files)

**Process improvements**:
- User research before feature development (I built what I thought was useful, not what users validated)
- A/B testing framework for UI changes
- Formalized incident response process
- SLA commitments and uptime monitoring

These are the differences between a side project and a production system serving paying customers. Understanding these gaps is part of what I learned by shipping this.

---

## Related Work & Context

**Similar platforms in the market**: 
- Compliance Monitor (Deel): Real-time regulatory tracking across 150+ countries
- NAVEX Regulatory Change Management: Alert classification and workflow management
- Athennian: Entity management with multi-jurisdictional compliance tracking

**What JurisGuard does differently**:
- Open-source and self-hostable
- Customizable risk scoring model
- Direct AI assistance for document analysis (vs. just alerting)

**What commercial platforms do better**:
- Comprehensive source coverage (hundreds of jurisdictions vs. my ~10)
- Professional legal analysis (human experts vs. LLM summaries)
- Enterprise features (SSO, RBAC, integrations, SLAs)

This project is a proof-of-concept that demonstrates technical capability and Legal Ops understanding, not a replacement for enterprise platforms.

---

## Setup & Usage

### Prerequisites
- Node.js 18+
- API keys for LLM providers (OpenRouter/Hugging Face/Together AI)

### Installation

```bash
git clone https://github.com/Casper-hue/JurisGuard.git
cd JurisGuard
npm install
```

### Configuration

Create `.env` file:

```bash
OPENROUTER_API_KEY=your_key_here
HUGGINGFACE_API_KEY=your_key_here  
TOGETHER_API_KEY=your_key_here
```

### Running Locally

```bash
npm run dev  # Start development server on localhost:3000
```

### Data Pipeline

```bash
npm run crawl-data  # Run scraper + processing pipeline
```

This fetches latest regulatory data and updates the JSON database.

---

## Repository Structure

```
JurisGuard/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Compliance dashboard UI
│   ├── compliance/         # Regulatory tracking page  
│   ├── cases/              # Case database page
│   ├── documents/          # Document library page
│   ├── ai-assistant/       # AI Q&A interface
│   └── api/                # Backend API routes
├── components/             # React components
│   ├── ui/                 # Base UI components
│   ├── MainLayout.tsx      # App shell layout
│   └── risk-analyzer.tsx   # Risk scoring component
├── lib/                    # Core business logic
│   ├── ai-service.ts       # LLM integration layer
│   ├── crawler-service.ts  # Web scraping logic
│   └── utils.ts            # Utility functions
├── scripts/                # Automation scripts
│   └── crawl-and-process.js # Data pipeline orchestration
├── data/                   # JSON data storage
│   ├── compliance-data.json
│   ├── cases-data.json
│   └── documents-data.json
└── types/                  # TypeScript definitions
    └── index.ts
```

---

## License

MIT License - See LICENSE file for details

---

## Contact

Project: [https://github.com/Casper-hue/JurisGuard](https://github.com/Casper-hue/JurisGuard)  
Issues: [https://github.com/Casper-hue/JurisGuard/issues](https://github.com/Casper-hue/JurisGuard/issues)

---

## About This Project

Built during a career transition period between in-house legal work and Legal Operations roles. The goal was to combine legal domain knowledge (3 years in-house: compliance, contracts, IP) with technical skills (Python, JavaScript, LLM APIs) to create something that solves a real Legal Ops problem.

This project represents ~[X months] of part-time development work, deployed to production and maintained as a live system. It's my answer to the question: "Can you bridge legal and technical work?" Not as a demo, but as something that actually runs and delivers value.
