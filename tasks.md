# Development Tasks

## Phase 1: v0 Migration & Stabilization
- [ ] **Task 1.1: Component Consolidation**
    - Copy the `page.tsx` code from v0.
    - **Action**: Flatten the complex component structure. If local Shadcn components (Button, Card, etc.) are missing, rewrite them as inline Tailwind JSX within `page.tsx` or create a simple `components/ui-shim.tsx` file to host them.
    - **Goal**: Ensure `npm run dev` renders the Dashboard without any "Module not found" errors.
- [ ] **Task 1.2: Visual Alignment**
    - Enforce the global dark theme. Update `app/globals.css` to set `body { background-color: #030303; color: #fff; }`.
    - Install dependencies: `npm install lucide-react framer-motion clsx tailwind-merge`.

## Phase 2: Data Injection (Your Real Data)
- [ ] **Task 2.1: Define Types**
    - Create a file `types/index.ts`.
    - Define the `ComplianceAlert` and `RadarStat` interfaces as per `architecture.md`.
- [ ] **Task 2.2: Create Data Source**
    - Create `src/data/compliance-data.json`.
    - **Instruction**: Do NOT generate fake "Lorem Ipsum" text. Create the JSON structure with 3-5 empty or placeholder entries that I (the user) can manually edit with real legal data later.
- [ ] **Task 2.3: Wire Data to UI**
    - Refactor `page.tsx`. Find the hardcoded list of alerts/cards.
    - Replace them with a `.map()` function that renders data from `compliance-data.json`.
    - Ensure the "Severity" badge color changes dynamically based on the data (e.g., Critical = Red, Medium = Yellow).

## Phase 3: Interface Preparation (No Logic Yet)
- [ ] **Task 3.1: Crawler Interface Stub**
    - Create `lib/crawler-service.ts`.
    - Write a function `fetchLatestRegulations()` that simply reads the local JSON for now.
    - Add a `TODO` comment: "Connect to Python Crawler API here".
- [ ] **Task 3.2: Search Bar Logic**
    - Connect the top search input to filter the `compliance-data.json` list locally.