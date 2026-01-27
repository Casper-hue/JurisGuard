# JurisGuard - AI Enrichment Task

## Goal
Implement a "Risk Analysis" feature that takes raw legal text and uses DeepSeek to generate structured compliance data (Risk Score, Summary, Affected Regions).

## Strategy
Instead of a complex crawler, we will implement an "On-Demand Analysis" workflow.
1.  **Input**: A raw text string (simulating a crawled article).
2.  **Process**: Send to DeepSeek API via Next.js Server Action / API Route.
3.  **Output**: Structured JSON displayed on the UI.

## Tasks
- [ ] **Task 3.1: Define the AI Server Action**
    - Create `app/actions/analyze-compliance.ts`.
    - Function: `analyzeLegalText(rawText: string)`.
    - It should call DeepSeek API with the "Combined System Prompt" (provided below).
    - It must return a JSON object, NOT a string.

- [ ] **Task 3.2: Create the "Admin Analysis" Component**
    - Create a new component `components/risk-analyzer.tsx`.
    - UI:
        - A `<textarea>` for pasting raw legal text (e.g., a news snippet).
        - A "Analyze Risk" button.
        - A result display area that shows the "Risk Radar" and "Summary" returned by AI.
    - **Logic**: On button click, call the Server Action from Task 3.1.

- [ ] **Task 3.3: Integration**
    - Add this `RiskAnalyzer` component to the Dashboard (maybe in a "Tools" tab or a modal).