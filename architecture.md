# JurisGuard Architecture & Guidelines (v0-Based)

## 1. Project Philosophy
- **Base UI**: Strictly follow the layout and aesthetics from the v0 source (ulIzNGlDhUG).
- **Visual Style**: Industrial Dark Mode. Background `#030303`, Borders `#1F1F1F` / `border-zinc-800`.
- **Data Strategy**: "Mock-First". All data must be decoupled from UI components and loaded from external JSON files.
- **Future-Proofing**: Interfaces for Crawler and AI Agents must be defined now, but implemented later.

## 2. Tech Stack
- **Framework**: Next.js 15 (App Router).
- **Styling**: Tailwind CSS + Shadcn UI (Simulated or Installed).
- **Icons**: Lucide React.
- **Animation**: Framer Motion (for card entry/hover effects).
- **Data Fetching**: Client-side `useEffect` or Server Components loading local JSON.

## 3. Component Structure (Based on v0)
The application is a Single Page Dashboard composed of a Bento Grid:
- **Layout**: `Sidebar` (Navigation) + `Header` (Search/User) + `MainContent`.
- **Key Widgets**:
  1.  **Global Compliance Radar**: Central visualization (Recharts or CSS-based).
  2.  **Live Alerts Feed**: A scrollable list of regulatory updates.
  3.  **Quick Stats**: Cards for "Total Risks", "Monitored Jurisdictions".
  4.  **AI Copilot Entry**: A chat interface placeholder.

## 4. Data Schemas (Strict Typing)
We do not use random data. We use strict TypeScript interfaces.

### Core Interface: `ComplianceAlert`
*(This is the standard format for both manual data and future Crawler data)*
```typescript
interface ComplianceAlert {
  id: string;
  region: string;       // e.g., "EU", "USA", "China"
  severity: "critical" | "high" | "medium" | "low";
  title: string;        // e.g., "AI Act Final Draft"
  summary: string;      // Short description
  timestamp: string;    // ISO date
  source_url?: string;  // For the future Crawler
}

5. Crawler & API Reservation
 * Crawler Service: Currently NOT implemented.
 * Integration Point: A service file lib/api-client.ts should be created. currently, it just returns data from mock-data.json, but the function signature must simulate an async API call.
<!-- end list -->